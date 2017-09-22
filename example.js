'use strict';

var path = require('path');
var each = require('./each');
var assemble = require('assemble');
var app = assemble();
var src = path.join.bind(path, __dirname, 'src');

app.use(each());

app.create('includes', {viewType: 'partial'});
app.create('posts');

app.includes(src('_includes/*'));
app.partials(src('_includes/*'));
app.layouts(src('_layouts/*'));
app.posts(src('_posts/*'));
app.pages(src('_pages/*'));

app.each(function(collection, key, cb) {
  console.log(collection);

  collection.each(function(view, key, next) {
    console.log(view);
    next();
  }, cb);
}, function callback(err) {
  if (err) console.log(err);
});

