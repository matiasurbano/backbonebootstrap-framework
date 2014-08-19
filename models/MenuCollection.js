/*globals define*/

define( [
    'lodash',
    'app/config',
    'src/models/BaseCollection', 'src/models/MenuModel',
    'src/controls/menu/MenuItem'
  ], function(
    _,
    config,
    BaseCollection, Model,
    MenuItem
  ) {

'use strict';

var MenuCollection = BaseCollection.extend({

  name  : 'Menues',
  model : Model,
  url   : config.endpoint + '/' + 'Menu',

  menuAdapter: undefined,

  initialize: function(options) {
    options = options || {};

    _.extend(this, options);

    BaseCollection.prototype.initialize.call(this, options);

    this.menuAdapter = this.menuAdapter || this.defaultMenuAdapter;

    this.useTableCapabilities = options.useTableCapabilities || false;
  },

  defaultMenuAdapter: function(attributes) {
    return new MenuItem(attributes);
  },

  asMenu: function() {
    var menuItems = _.map(this.models, function(model) {
      return new MenuItem(this.menuAdapter(model.attributes));
    }, this);

    var menu = MenuItem.root()
      .loadChildren(menuItems)
      .applyPermissions();

    return menu;
  }

});

  return MenuCollection;
});
