'use strict';

var parser = require('parser-front-matter');
var through = require('through2');

module.exports = function(options) {
  return through.obj(function(file, enc, next) {
    var str = file.contents.toString();
    if (str.slice(0, 8) === '---\n---\n') {
      file.contents = new Buffer(str.slice(8));
      next(null, file);
      return;
    }

    parser.parse(file, options, function(err) {
      if (err) {
        next(err);
        return;
      }
      next(null, file);
    });
  });
};
