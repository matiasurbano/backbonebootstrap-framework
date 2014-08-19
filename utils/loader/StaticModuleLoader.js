/*globals define, console*/

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

var StaticModuleLoader = BaseObject.extend({

  defaultModule: 'Main',
  modules: undefined,

  initialize: function(options) {

    options = options || {};

    _.extend(this, options);

    if (!_.isObject(this.modules)) throw new Error('modules object not defined');

    BaseObject.prototype.initialize.call(this, options);
  },

  load: function(moduleName, success, error) {

    var module = this.modules[moduleName];

    if (!module) {
      var err = new Error('module "' + moduleName + '" not found');
      error(err);
    } else {
      success(module);
    }
  },

  loadFromUrl: function(success, error) {
    var moduleName = http.module();

    if (!moduleName) {
      console.log('no module specified, using default');
      moduleName = this.defaultModule;
    }

    return this.load(moduleName, success, error);
  }

});

  return StaticModuleLoader;
});
