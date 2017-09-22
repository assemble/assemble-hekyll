'use strict';

/**
 * Example assemblefile.js
 */

var hekyll = require('./');
var argv = require('minimist')(process.argv.slice(2));
var Assemble = require('assemble');

/**
 * Instantiate assemble
 */

var app = module.exports = new Assemble(argv);

/**
 * Options
 */

app.option({owner: 'jonschlinkert', repo: 'hekyll'});
app.option(require('./tmp/auth.json'));

/**
 * Register hekyll plugin
 */

app.use(hekyll({cwd: __dirname, theme: 'vendor/poole/lanyon', destBase: 'src'}));

/**
 * Default task
 */

app.task('default', ['theme']);
