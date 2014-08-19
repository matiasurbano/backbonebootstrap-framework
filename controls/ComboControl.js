/*globals define*/

define( [
    'lodash',
    'src/controls/BaseControl',
    'text!./combo.html'
  ], function(
    _,
    BaseControl,
    comboTemplate
  ){

'use strict';

var ComboControl = BaseControl.extend({

  initialize: function(options) {

    options = options || {};

    _.defaults(this, options);

    this.addSupportedType('combo');
    this.type = this.type || 'combo';

    if (!this.items) throw new Error('combo items not specified');

    if (_.isArray(this.items)) this.items = this.arrayToItems(this.items);
    if (_.isObject(this.items)) this.items = this.objectToItems(this.items);

    this.controlTemplate = this.controlTemplate || comboTemplate;

    BaseControl.prototype.initialize.call(this, options);
  },

  arrayToItems: function(arrayItems) {
    var ret = [];
    _.each(arrayItems, function(item) {
      ret.push( {
        key: item,
        value: item
      });
    });
    return ret;
  },

  objectToItems: function(objectItems) {
    var ret = [];
    _.each(objectItems, function(value, key) {
      ret.push( {
        key: key,
        value: value
      });
    });
    return ret;
  }

});

  return ComboControl;
});
