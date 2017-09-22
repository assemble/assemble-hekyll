'use strict';

var argv = require('minimist')(process.argv.slice(2));
var assemble = require('assemble');
var hekyll = require('./hekyll');

/**
 * Instantiate assemble
 */

var app = module.exports = assemble(argv);

/**
 * Register hekyll plugin
 */

app.option({
  username: 'jonschlinkert',
  password: 'Nhalle22',
  owner: 'jonschlinkert',
  repo: 'hekyll'
});

app.use(hekyll({cwd: __dirname, theme: 'vendor/poole/lanyon', destBase: 'src'}));
// app.use(require('./src/themefile.js'));

/**
 * Default task
 */

app.task('default', ['theme']);
