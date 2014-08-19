/*globals define*/

define( [
    'lodash',
    'src/utils/models/Field'
  ], function(
    _,
    Field
  ){

'use strict';

/**
   A field that can handle nested objects.
   @class ObjectField
   @extend Field
   @constructor
*/
var CheckField = Field.extend({

  initialize: function(options) {

    _.defaults(this, options || {});

    this._addSupportedType('check');

    this.type = this.type || 'check';

    Field.prototype.initialize.call(this, options);
  },

  /**
   * Adds the default value (null) for check field object
   *
   * @param {string} type   Should be equal to date,
   *                        otherwise it will be handled by super._setDefaults
   *
   * @override
   *
   */
  _setDefaults: function(type) {

    if (type.toLowerCase() === 'check') return null;

    // super.setDefaults
    return Field.prototype.setDefaults.call(this, type);
  }

});

  return CheckField;
});
