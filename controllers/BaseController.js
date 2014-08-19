/*globals define*/

define( [
    'lodash', 'src/views/BaseView'
  ], function(
    _, BaseView
  ){

'use strict';

var BaseController = BaseView.extend({

  resource: undefined,

  permissions: undefined,

  initialize: function(options) {

    options = options || {};

    _.defaults(this, options);

    if (this.resource !== undefined) this.resource = this.resource.toLowerCase();

    this.permissions = this.permissions || [];

    // super.initialize
    BaseView.prototype.initialize.call(this, options);

  },

  start: function() {
    throw new Error('BaseController.start not implemented.');
  },

  addView: function(view) {
    view.controller = this;
    // super.addView
    return BaseView.prototype.addView.apply(this, arguments);
  }

});

  return BaseController;
});
