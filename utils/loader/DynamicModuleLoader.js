/*globals define, require, requirejs*/

define( [
    'lodash',
    'src/BaseObject',
    'src/utils/http'
  ], function(
    _,
    BaseObject,
    http
  ){

'use strict';

var DynamicModuleLoader = BaseObject.extend({

  defaultModule: 'Main',
  locationTemplate: 'app/controllers/<%= module %>Controller',

  initialize: function(options) {

    options = options || {};

    _.extend(this, options);

    // super.initialize
    BaseObject.prototype.initialize.call(this, options);

  },

  load: function(location, success, error) {

    // save previous requireJS error handler
    var requirejsPrevOnError = requirejs.onError;
    requirejs.onError = error;

    try {
      require([location], function(module) {

        // restore requirejs error handler
        requirejs.onError = requirejsPrevOnError;

        // requireJS could not load Controller
        if (!module) {
          var err = new Error('requireJS could not load "' + location + '" module');
          error(err);
        } else {
          success(module);
        }
      });

    } catch(e) {
      error(e);
    }

  },

  loadFromUrl: function(success, error) {
    var moduleName = this.locationFromUrl();

    if (!moduleName) throw new Error('no module location could be inferred from the url');

    this.load(moduleName, success, error);
  },

  locationFromUrl: function() {
    return http.getModuleFromUrl(this.defaultModule, this.locationTemplate);
  }

});

  return DynamicModuleLoader;
});
