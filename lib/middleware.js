'use strict';

var url = require('url');
var path = require('path');
var relative = require('relative');
var merge = require('merge-deep');
var utils = require('./utils');

/**
 * Middleware
 */

module.exports = function(app) {
  if (utils.isRegistered(app, 'hekyll-middleware')) return;

  app.onLoad(/\.(md|hbs|html)$/, utils.pageData(app));
  app.onLoad(/\.(md|hbs|html)$/, function(view, next) {
    var folder = view.folder = path.basename(view.dirname);
    var paths = app.paths;

    view.content = view.content.replace(/{{ @(page|post)\.url /g, '{{link-to @$1');

    view.extname = '.html';
    view.id = view.data.id;
    view.title = view.data.title;
    view.data.site = view.data.site || {};
    if (folder === '_posts') {
      view.url = path.relative(paths.dest(), paths.posts(view.relative));
      view.dest = view.url;
    } else {
      view.url = path.relative(paths.dest(), paths.dest(view.relative));
      view.dest = view.url;
    }

    next(null, view);
  }, function(view, next) {
    if (path.extname(view.history[0]) !== '.md') {
      next(null, view);
      return;
    }

    // we don't want the layout to render yet, because
    // later we'll need to use the inner HTML
    view._originalLayout = view.layout;
    view.layout = null;
    app.render(view, function(err) {
      if (err) {
        next(err);
        return;
      }

      utils.markdown()(view, function(err) {
        if (err) {
          next(err);
          return;
        }

        utils.markdown.unescape()(view, function(err) {
          if (err) {
            next(err);
            return;
          }
          view.layout = view._originalLayout;
          view.html = view.content;
          next(null, view);
        });
      });
    });
  });

  app.preRender(/\.(html|hbs|md)/, function(file, next) {
    file.data.site = merge({}, app.cache.data.site, file.data.site);
    next();
  });

  app.preWrite(/\.html$/, function(file, next) {
    var paths = app.paths;
    var $ = utils.cheerio.load(file.content);
    var cls = app.store.get('bodyClass')
      || app.data('site.bodyClass')
      || app.option('bodyClass');

    if (cls) {
      $('body').attr('class', cls);
    }

    $('script').each(function(i, ele) {
      var src = ele.attribs.src;
      if (src) {
        src = src.replace(/public/, 'assets');
        src = src.replace(/^(\.\/+)+/, '');
        if (!/^\/\/:/.test(src) && src.charAt(0) === '/') {
          src = src.slice(1);
        }
        var tok = url.parse(src);
        if (!tok.protocol && !tok.host) {
          ele.attribs.src = relative(file.data.path, paths.dest(src));
        }
      } else {

      }
    });

    $('link').each(function(i, ele) {
      var href = ele.attribs.href;
      if (href) {
        href = href.replace(/public/, 'assets');
        href = href.replace(/^(\.\/+)+/, '');
        if (!/^\/\/:/.test(href) && href.charAt(0) === '/') {
          href = href.slice(1);
        }
        if (/^css\//.test(href)) {
          href = path.join('assets', href);
        }
        var tok = url.parse(href);
        if (!tok.protocol && !tok.host) {
          ele.attribs.href = relative(file.data.path, paths.dest(href));
        }
      } else {

      }
    });

    $('a').each(function(i, ele) {
      var href = ele.attribs.href;
      var tok = url.parse(href);

      if (!tok.protocol && !tok.host) {
        if (href.charAt(0) === '/') {
          href = href.slice(1);
        }

        href = href.replace(/^(\.\/+)+/, '');
        if (href === '') {
          href = 'index.html';
        }

        if (/^[-+$\w]+$/.test(href) && path.extname(href) === '') {
          href += '.html';
        }
        href = relative(file.data.path, paths.dest(href));
        ele.attribs.href = href;
      }
    });

    file.content = $.html();
    next();
  });
};
