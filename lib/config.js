'use strict';

var fs = require('fs');
var url = require('url');
var path = require('path');
var Store = require('data-store');
var colors = require('./colors');
var utils = require('./utils');

/**
 * Configuration settings for assemblefile.js:
 *  √ build paths
 *  √ custom collections
 *  √ options (defaults)
 *  √ plugins
 *  √ helpers
 *  √ middleware
 *  √ data
 */

module.exports = function(app) {
  if (utils.isRegistered(app, 'hekyll-config')) return;

  /**
   * Build paths
   */

  var cwd = path.resolve(app.cwd || app.options.cwd);
  var src = app.options.src || 'src';
  var dest = app.options.dest || 'dist';
  var data = app.options.data || '_data';
  var destBase = app.options.destBase || dest;
  var theme = app.options.theme;
  var posts = app.options.posts || 'posts';
  var pages = app.options.pages || '';
  var paths = app.paths = {};
  paths.cwd = path.resolve.bind(path, cwd);
  paths.src = path.resolve.bind(path, cwd, src);
  paths.dest = path.resolve.bind(path, cwd, dest);
  paths.destBase = path.resolve.bind(path, cwd, destBase);
  paths.assets = path.resolve.bind(path, paths.dest('public'));
  paths.data = path.resolve.bind(path, paths.src(data));
  paths.theme = path.resolve.bind(path, theme);

  /**
   * Initialize config store
   */

  app.store = new Store('assemble-hekyll', {cwd: paths.data()});

  /**
   * Custom template collections
   */

  app.create('includes', { viewType: 'partial' });
  app.create('posts');
  app.create('files');

  /**
   * Listen for errors
   */

  app.on('option', function(key, val) {
    if (key === 'color' && colors[val]) {
      app.store.set('bodyClass', colors[val]);
    }
  });

  /**
   * Listen for errors
   */

  app.on('error', function(err) {
    console.log(err);
    process.exit(1);
  });

  /**
   * Build "options" (useful in plugins, middleware and helpers)
   */

  app.option('engine', 'hbs');
  app.option('assets', paths.assets());
  app.option('dest', paths.dest());
  app.option('src', paths.src());

  /**
   * Plugins
   */

  app.use(require('./data'));
  app.use(require('./helpers'));
  app.use(require('./middleware'));

  var base = path.normalize(app.data('site.baseurl') || '');
  if (base === '') {
    base = '.';
  }

  app.data('site.baseurl', base);
  // base = url.resolve('file://', paths.dest(base));
  paths.url = path.resolve.bind(path, paths.dest(base));
  paths.pages = path.resolve.bind(path, paths.url(pages));
  paths.posts = path.resolve.bind(path, paths.url(posts));

  /**
   * Create a noop "custom" task, which may be overridden
   * in "themefile.js" or your "assemblefile.js"
   */

  app.task('custom', {silent: true}, function(cb) {
    cb();
  });

  /**
   * Return build paths
   */

  return paths;
};
