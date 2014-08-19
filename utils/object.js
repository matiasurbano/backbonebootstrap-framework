/*globals define*/

define([
    'lodash'
  ], function(
    _
  ) {

'use strict';

var object = {};

object.initOptions = function(options, defaults, opts) {
  options = options || {};
  defaults = defaults || {};
  opts = opts || {};

  var required = opts.required  === undefined ? false : opts.required;
  var consume = opts.consume  === undefined ? false : opts.consume;

  _.each(defaults, function(value, key) {
    // assign default value
    if (this[key] === undefined || this[key] === null) this[key] = value;

    // overwrite default with options
    if (_.has(options, key)) {
      this[key] = options[key];
      if (consume) delete options[key];
    } else if (required) {
      throw new Error('required option "' + key + '" not specified');
    }
  }, this);

  return this;
};

  return object;
});
