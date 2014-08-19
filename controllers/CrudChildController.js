/*globals define*/

define( [
    'src/controllers/CrudController',
    'src/views/crud/HeaderView'
  ], function(
    CrudController,
    HeaderView
  ){

'use strict';

var CrudChildController = CrudController.extend({

  parent: undefined,      // parentController

  parentModel: undefined,

  headerView: undefined,

  initialize: function(options) {

    options = options || {};

    this.parent = options.parent || this.parent || undefined;
    if (!this.parent) throw new Error('parent not specified!');

    this.resource = this.resource || options.resource || this.parent.resource;

    if (this.children || options.children) {
      throw new Error('CrudChildController cannot have children, use CrudParentController or CrudParentChildController instead!');
    }

    // super.initialize
    CrudController.prototype.initialize.call(this, options);

    this.HeaderView = this.HeaderView || options.HeaderView || HeaderView;

    this.headerView = new this.HeaderView({
      controller  : this,
      el          : this.$crudEl.find('.header-view')
    });

    this.addView(this.headerView);
  },

  isParent: function() { return false; },
  isChild: function() { return true; },

  setParentModel: function(model) {

    // parent hasn't changed, do nothing
    if (this.collection.parentId === model.id) {
      this.headerView.render();
      return this;
    }

    this.parentModel = model;
    this.collection.parentId = this.parentModel.id;

    // clear filters, order, page
    this.queryParams = {};

    // check!!! this.list is already executed on start
    // it won't be updated when we come back to this tab
    // this.list(this.queryParams);

    // update header
   this.headerView.setModel(model).render();

    return this;
  }

});

  return CrudChildController;
});
