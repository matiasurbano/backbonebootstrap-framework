/*globals define*/

define( [
    'lodash'
  ], function(
    _
  ) {

'use strict';

var mixin = {};

  _.mixin({
    evaluate: function(object, property) {
      if (!object) return undefined;
      return _.isFunction(property) ? property.call(object, object) : object[property];
    }
  });

  return mixin;
});
