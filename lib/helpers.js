'use strict';

var fs = require('fs');
var ent = require('ent');
var path = require('path');
var crypto = require('crypto');
var hbs = require('handlebars-utils');
var moment = require('moment-strftime');
var set = require('set-value');
var get = require('get-value');
var utils = require('./utils');

module.exports = function(app) {
  if (utils.isRegistered(app, 'hekyll-helpers')) return;
  var paths = app.paths;

  app.helpers(require('handlebars-helpers')());
  // app.helpers(require('liquid-filters'));

  app.helper('helperMissing', function() {
    var opts = [].slice.call(arguments).pop();
    console.log(`missing helper {{${opts.name}}}`);
  });

  app.helper('get', function(view, prop) {
    if (view) return get(view, prop);
  });

  app.helper('append', function(a, b) {
    if (b == null && /\.css/.test(a)) {
      if (a.charAt(0) === '/') a = '.' + a;
      b = createHash(paths.dest(a).replace(/\?v=$/, ''));
    }
    return a + (b || '');
  });

  app.helper('link-to', require('helper-link-to'));
  app.helper('sortItems', require('helper-sort-items'));
  app.helper('frame', require('handlebars-helper-create-frame'));

  app.helper('relative_url', function(url) {
    return url;
  });

  app.helper('assign', function(prop, val, options) {
    set(options, ['data.root', prop], val);
    this.app.data(prop, val);
  });

  app.helper('comment', function(options) {
    return '<!-- ' + options.fn(this).trim() + ' -->';
  });

  app.helper('pager', function(type, options) {
    var items = app.data('site.' + type);
    var item = this.view;
    var idx = items.indexOf(item);

    var len = items.length;
    var prev = items[len - 1] || null;
    var next = items[len + 1] || null;

    var pager = {};
    pager.isPager = true;
    pager.current = item;

    pager.index = len;
    pager.isFirst = len === 0;
    pager.first = items[0] || item;
    pager.prev = prev;
    pager.next = next;

    if (prev) {
      prev.data.pager = prev.data.pager || {};
      prev.data.pager.next = item.clone();
    }

    Object.defineProperty(pager, 'isLast', {
      configurable: true,
      enumerable: true,
      get: function() {
        return this.index === items.length - 1;
      }
    });

    Object.defineProperty(pager, 'last', {
      configurable: true,
      enumerable: true,
      get: function() {
        return items[items.length - 1];
      }
    });

    return options.fn(pager);
  });

  app.helper('is', function(a, b, options) {
    if (hbs.isOptions(b)) {
      options = b;
      b = options.hash.b;
    }
    var isMatch = (a == null && b == null) ? false : a == b;
    if (typeof options.fn !== 'function') {
      return isMatch;
    }
    if (isMatch) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  app.helper('isnt', function(a, b, options) {
    if (hbs.isOptions(b)) {
      options = b;
      b = options.hash.b;
    }
    var isMatch = (a == null && b == null) ? false : a != b;
    if (typeof options.fn !== 'function') {
      return isMatch;
    }
    if (isMatch) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  app.helper('date', function(date, format) {
    if (date === 'now') {
      date = Date.now();
    }
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return moment(date).strftime(format);
  });

  app.helper('date_to_xmlschema', function(date) {
    return moment(date).toISOString();
  });

  app.helper('date_to_string', function(date) {
    return moment(date).format('DD MMM YYYY');
  });

  // XML escape a string for use. Replaces any special characters
  // with appropriate HTML entity replacements.
  app.helper('xml_escape', function(str) {
    return typeof str === 'string' ? ent.encode(str) : '';
  });

  app.helper('log', function() {
    var args = [].slice.call(arguments);
    args.pop();
    console.log.apply(console, args);
  });

  app.helper('empty', function() {
    return this.app.getHelper('isEmpty').apply(this, arguments);
  });

  app.helper('limit', function fn(list, limit, options) {
    if (!list || !Array.isArray(list)) {
      return [];
    }

    list._i = list._i || 0;
    list._i++;

    var arr = [];
    var len = list.length - 1;
    var n = list._i % len;
    var items = list.slice(n, n + limit);
    if (items.length < limit) {
      items.push.apply(items, list.slice(0, limit - items.length));
    }

    return items.reduce(function(acc, ele) {
      if (arr.indexOf(ele.path) === -1) {
        arr.push(ele.path);
        acc.push(ele);
      }
      return acc;
    }, []);
  });

  app.helper('excerpt', function(str, options) {
    return str.slice(0, 150);
  });
};

function createHash(fp) {
  var shasum = crypto.createHash('sha1');
  if (fs.existsSync(fp)) {
    shasum.update(fs.readFileSync(fp, 'utf8'));
  } else {
    shasum.update(fp);
  }
  return shasum.digest('hex');
}
