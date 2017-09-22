'use strict';

var path = require('path');
var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('assemble');
require('assemble-middleware-page-variable', 'pageData');
require('assemble-remarkable/middleware', 'markdown');
require('cheerio');
require('gulp-sass', 'sass');
require('is-valid-app', 'isValid');
require('js-yaml', 'yaml');
require('micromatch', 'mm');
require('repo-utils', 'repo');
require('through2', 'through');
require('vinyl-fs', 'vfs');
require = fn;

utils.toList = function toList(app, name) {
  var paths = app.paths;
  var list = app.list(app[name]);
  list.paginate({limit: 1});

  app.data('paginator.' + name, list.items);
  app.data('site.' + name, list.items);
  var site = app.data('site');

  for (var i = 0; i < list.items.length; i++) {
    var items = list.items.slice();
    var item = list.items[i];
    var related = [];
    var paths = [];

    for (let ele of items) {
      var view = ele.clone();
      if (paths.indexOf(view.path) !== -1) continue;
      if (ele.path === item.path) continue;
      view.data = null;
      paths.push(view.path);
      related.push(view);
    }

    site['related_' + name] = related;
    item.set('data.site', site);
  }
};

utils.filter = function(patterns, options) {
  var isMatch = utils.mm.matcher(patterns, options);
  return utils.through.obj(function(file, enc, next) {
    if (isMatch(file.path) || isMatch(file.relative)) {
      next();
      return;
    }
    next(null, file);
  });
};

utils.isRegistered = function() {
  return !utils.isValid.apply(null, arguments);
};

/**
 * Expose `utils` modules
 */

module.exports = utils;
