# assemble-hekyll [![NPM version](https://img.shields.io/npm/v/assemble-hekyll.svg?style=flat)](https://www.npmjs.com/package/assemble-hekyll) [![NPM monthly downloads](https://img.shields.io/npm/dm/assemble-hekyll.svg?style=flat)](https://npmjs.org/package/assemble-hekyll) [![NPM total downloads](https://img.shields.io/npm/dt/assemble-hekyll.svg?style=flat)](https://npmjs.org/package/assemble-hekyll)

> Assemble plugin for building a hekyll theme (Jekyll theme converted to handlebars).

Follow this project's author, [Jon Schlinkert](https://github.com/jonschlinkert), for updates on this project and others.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save assemble-hekyll
```

## Usage

```js
var hekyll = require('assemble-hekyll');
var assemble = require('assemble');
var app = module.exports = assemble();
app.use(hekyll());
```

## Usage

```js
var hekyll = require('assemble-hekyll');
```

## Quickstart

The easiest way to convert and build a Jekyll theme with assemble is to start by using [generate-hekyll](https://github.com/generate/generate-hekyll) to convert the theme. generate-hekyll has built-in support for all of GitHub's default Jekyll themes, as well as all of the awesome [poole](https://github.com/poole) themes from [@mdo](https://github.com/mdo).

See the [alternative steps](#alternative-steps) if you want more fine grained control over cloning and converting the theme.

### 1. Install generate-hekyll

First, install [generate](https://github.com/generate/generate) and [generate-hekyll](https://github.com/generate/generate-hekyll):

```sh
$ npm install -g generate generate-hekyll
```

### 2. Convert the theme you want

Next, run generate-hekyll to download and convert the theme you want:

```sh
$ gen hekyll
```

### 3. Customize and build!

Feel free to customize your [assemblefile.js](#assemblefilejs)! You should now be able to build the site at any time with the following command:

```sh
$ assemble
```

### Alternative steps

As an alternative to using `generate-hekyll` to convert the theme (steps 1 and 2), you can do the following.

**Step 1: git clone**

`git clone` the theme you want into a local directory.

**Step 2: Tell assemble where to find the theme**

In `assemblefile.js`, tell assemble where to find the Jekyll theme and where to write the converted handlebars files.

```js
app.option({
  // current working directory
  cwd: __dirname, 

  // path to the jekyll theme
  theme: 'vendor/poole/lanyon', 

  // path to write the converted files. remember, the generated files 
  // will become your "source" templates when you build the handlebars
  // theme with assemble
  destBase: 'src' 
});
```

**Step 3: Convert the theme**

Run the following to convert your theme.

```sh
$ assemble hekyll
```

## assemblefile.js

Example code to use in your `assemblefile.js`.

```js
var hekyll = require('assemble-hekyll');
var argv = require('minimist')(process.argv.slice(2));
var Assemble = require('assemble');

/**
 * Instantiate and expose your instance of assemble to assemble's CLI
 */

var app = module.exports = new Assemble(argv);

/**
 * Options
 */

// these options are necessary only if you're cloning the theme yourself
// using the alternative steps described above. Replace these values with
// your own.
app.option({cwd: __dirname, theme: 'vendor/poole/lanyon', destBase: 'src'});

// the following options are necessary if you want to download metadata
// from the repository to use in templates. Replace these values with
// the owner/repository to use for getting metadata.
app.option({owner: 'jonschlinkert', repo: 'hekyll'});

// if you want to download metadata, pass username and password, or token.
// note that the `metadata` task is skipped if these values aren't defined
app.option(require('./tmp/auth.json'));

/**
 * Register hekyll plugin
 */

app.use(hekyll(app.options));

/**
 * Default task
 */

app.task('default', ['theme']);
```

## Please help improve this project

As with any site, you'll need to make some customizations, and potentially fix any remaining issues that were missed by the plugin. If you find a bug, or something that doesn't work, but you think this plugin should handle it, please [don't hesitate to create an issue](../../issues/new).

## About

### Related projects

You might also be interested in these projects:

* [generate-hekyll](https://www.npmjs.com/package/generate-hekyll): Scaffold out a handlebars theme from a Jekyll theme using Hekyll. | [homepage](https://github.com/generate/generate-hekyll "Scaffold out a handlebars theme from a Jekyll theme using Hekyll.")
* [generate](https://www.npmjs.com/package/generate): Command line tool and developer framework for scaffolding out new GitHub projects. Generate offers the… [more](https://github.com/generate/generate) | [homepage](https://github.com/generate/generate "Command line tool and developer framework for scaffolding out new GitHub projects. Generate offers the robustness and configurability of Yeoman, the expressiveness and simplicity of Slush, and more powerful flow control and composability than either.")
* [hekyll-cli](https://www.npmjs.com/package/hekyll-cli): CLI for hekyll, the Jekyll to Handlebars theme converter. | [homepage](https://github.com/jonschlinkert/hekyll-cli "CLI for hekyll, the Jekyll to Handlebars theme converter.")
* [hekyll](https://www.npmjs.com/package/hekyll): Migrate Jekyll (gh-pages) themes to use handlebars instead of liquid. | [homepage](https://github.com/jonschlinkert/hekyll "Migrate Jekyll (gh-pages) themes to use handlebars instead of liquid.")

### Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

Please read the [contributing guide](.github/contributing.md) for advice on opening issues, pull requests, and coding standards.

### Building docs

_(This project's readme.md is generated by [verb](https://github.com/verbose/verb-generate-readme), please don't edit the readme directly. Any changes to the readme must be made in the [.verb.md](.verb.md) readme template.)_

To generate the readme, run the following command:

```sh
$ npm install -g verbose/verb#dev verb-generate-readme && verb
```

### Running tests

Running and reviewing unit tests is a great way to get familiarized with a library and its API. You can install dependencies and run tests with the following command:

```sh
$ npm install && npm test
```

### Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](https://twitter.com/jonschlinkert)

### License

Copyright © 2017, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT License](LICENSE).

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.6.0, on September 21, 2017._