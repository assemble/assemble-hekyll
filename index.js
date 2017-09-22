'use strict';

var fs = require('fs');
var path = require('path');
var del = require('delete');
var hekyll = require('hekyll');
var through = require('through2');
var pick = require('object.pick');
var metadata = require('github-metadata');
var matter = require('./lib/matter');
var config = require('./lib/config');
var utils = require('./lib/utils');


module.exports = function(options) {
  return function(app) {
    if (utils.isRegistered(app, 'assemble-hekyll')) return;
    app.option(options);
    var opts = Object.assign({}, app.options);
    var paths = config(app);
    var dest = paths.dest;
    var src = paths.src;

    /**
     * Load templates
     */

    app.task('templates', function(cb) {
      app.includes(src('_includes/*.{hbs,md}'));
      app.partials(src('_includes/*.{hbs,md}'));
      app.layouts(src('_layouts/*.{hbs,md}'));
      app.posts(src('_posts/*.{hbs,md}'));
      app.pages(src('{_pages/,}*.hbs'));
      app.pages(src('{_pages/,}!(README|CONTRIBUTING|LICENSE).md'));
      app.files(src('*.{xml,txt}'));
      cb();
    });

    /**
     * Get metadata for a GitHub repository
     */

    app.task('metadata', function(cb) {
      if (!fs.existsSync(paths.src())) {
        return Promise.resolve(null);
      }

      var github = app.store.get('github');
      if (github && !app.options.github) {
        app.data('github', github);
        return Promise.resolve(null);
      }

      var opts = pick(app.options, [
        'username',
        'password',
        'token',
        'owner',
        'repo'
      ]);

      if (!opts.token && !opts.username && !opts.password) {
        return Promise.resolve(null);
      }

      if (!opts.owner || !opts.repo) {
        return Promise.resolve(null);
      }

      var repo = `${opts.owner}/${opts.repo}.`;
      console.log('getting metadata for', repo, 'This is only done once, unless you pass the --github flag.');

      return metadata(opts)
        .then(function(data) {
          data.public_repositories = [];
          app.store.set('github', data);
          app.data('github', data);
        });
    });

    /**
     * Create lists (arrays of views) from collections (objects of views),
     * then add the paginated lists to the context
     */

    app.task('hekyll-build', function(cb) {
      return hekyll.build({cwd: paths.theme(), destBase: paths.destBase()});
    });

    /**
     * Build files at the root of the site
     */

    app.task('hekyll', ['hekyll-build'], function() {
      return app.src('templates/*.*', {cwd: __dirname})
        .pipe(app.dest(paths.destBase()));
    });

    /**
     * Create lists (arrays of views) from collections (objects of views),
     * then add the paginated lists to the context
     */

    app.task('paginate', function(cb) {
      utils.toList(app, 'pages');
      utils.toList(app, 'posts');
      cb();
    });

    /**
     * Build "pages"
     */

    app.task('pages', function() {
      return app.toStream('pages')
        .pipe(utils.filter('**/!{README,LICENSE}{,.md}'))
        .pipe(app.renderFile('hbs')).on('error', console.log)
        .pipe(app.dest(paths.pages()));
    });

    /**
     * Build "posts"
     */

    app.task('posts', function() {
      return app.toStream('posts')
        .pipe(app.renderFile('hbs')).on('error', console.log)
        .pipe(app.dest(paths.posts()));
    });

    /**
     * Build files at the root of the site
     */

    app.task('root', function() {
      return app.toStream('files')
        .pipe(app.renderFile('hbs')).on('error', console.log)
        .pipe(app.dest(dest()));
    });

    /**
     * CSS
     */

    app.task('css', function() {
      return app.src('*.css', {cwd: src('css')})
        .pipe(app.dest(function(file) {
          file.base = file.dirname;
          return dest('assets/css');
        }));
    });

    app.task('sass', ['css'], function() {
      return app.src('**/*.scss', {cwd: src()})
        .pipe(matter())
        .pipe(utils.sass({
          outputStyle: 'expanded',
          includePaths: 'src/_sass'
        }).on('error', utils.sass.logError))
        .pipe(app.dest(function(file) {
          file.base = file.dirname;
          return dest('assets/css');
        }));
    });

    /**
     * Copy assets to "public" folder
     */

    app.task('assets', function() {
      return app.copy(src('{assets,public}/**'), function(file) {
        file.path = file.path.replace(/public/, '');
        return dest('assets');
      });
    });

    /**
     * Wipe out dest files before re-building
     */

    app.task('clean', function() {
      return del(dest());
    });

    /**
     * Default task
     */

    app.task(opts.defaultTask || 'theme', [
      'clean',
      'root',
      'sass',
      'assets',
      'metadata',
      'templates',
      'paginate',
      'pages',
      'posts',
      'custom'
    ]);
  };
};
