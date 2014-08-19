/*globals define*/

define( [
    'lodash', 'backbone',
    'src/utils/object'
  ], function (
    _, Backbone,
    object
  ){

'use strict';

/**
 * Base object to use for every non-Backbone inherited object.
 *
 * It just provides an initialize method and the extend class method
 * borrowed from Backbone.Model.extend
 *
 * It also adds Backbone events functionality, giving every object the ability
 * to bind and trigger custom named events.
 *
 * @param {Object} options Initialization options object
 *
 * See
 * - http://backbonejs.org/#Events
 */
var BaseObject = function(options) {
  this.initialize.apply(this, arguments);
};

_.extend(BaseObject.prototype, Backbone.Events, {

  initialize: function(options) {},

  // add initOptions helper method
  initOptions: object.initOptions

});

// The self-propagating extend function that Backbone classes use.
BaseObject.extend = Backbone.Model.extend;

  return BaseObject;
});
