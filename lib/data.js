'use strict';

var fs = require('fs');
var path = require('path');
var utils = require('./utils');

/**
 * Site data
 */

module.exports = function(app) {
  if (utils.isRegistered(app, 'hekyll-data')) return;
  var paths = app.paths;
  var pkgPath = path.resolve(require.resolve('assemble'), '../package.json');

  app.dataLoader('yml', function(buf, file) {
    var data = utils.yaml.safeLoad(buf);
    var name = path.basename(file);
    if (name === '_config.yml') {
      data.baseurl = data.baseurl || './';
      if (data.baseurl === '/') {
        data.baseurl = './';
      }
    }
    return data;
  });

  /**
   * Data for rendering templates
   */

  app.data('assemble', JSON.parse(fs.readFileSync(pkgPath)));
  app.data('site.github.repo', utils.repo.https(app.pkg.data));
  app.data(paths.src('*_config.yml'), {namespace: 'site'});
  app.data(paths.src('_data/*.{yml,yaml,json,csv}'), {namespace: 'site'});

  /**
   * Expose path variables on data
   */

  app.data('site.assets', paths.assets());
  app.data('site.dest', paths.dest());
  app.data('assets', paths.assets());
  app.data('dest', paths.dest());
};

