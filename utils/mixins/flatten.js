/*globals define*/

define( [
    'lodash'
  ], function(
    _
  ) {

'use strict';

// flattens an object
// turns { prop1: { subprop1: 11 }, prop2: 2, prop3: [ { sub: 1 }, { sub: 2 } ] }
// into { prop1.subprop1: 11, prop2: 2, prop3.sub: [1, 2] }
var flatten = function(json) {
  var keys = [];

  var toFlat = function loop(key, value) {
    if (_.isArray(value)) {
      _.each(value, function(item) {
        loop(key, item);
      });

    } else if (_.isObject(value)) {
      key = key ? key + '.' : '';
      _.each(value, function(subValue, subKey) {
        loop(key + subKey, subValue);
      });

    // scalar value,  trivial case
    } else {
      keys.push( { key: key, value: value });
    }
  };

  toFlat('', json);

  var groups = _.groupBy(keys, 'key'),
      flatten = {};

  _.each(groups, function(group) {
    var key   = group[0].key,
        value = _.pluck(group, 'value');

    // only return an array if there's more than one element
    flatten[key] = value.length === 1 ? value[0] : value;
  });

  return flatten;
};

_.mixin({
  'flatten': flatten
});

  return flatten;
});
