/*globals define*/

define([
    'lodash'
  ], function(
    _
  ) {

'use strict';

var array = {};

array.del = function(items, index) {
  if (index > (items.length-1)) return null;
  return items.splice(index, 1);
};

array.delByValue = function(items, value) {
  var index = _.indexOf(items, value);
  if (index === -1) return null;
  return array.del(items, index);
};

  return array;
});
