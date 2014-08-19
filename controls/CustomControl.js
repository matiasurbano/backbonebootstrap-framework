/*globals define*/

define( [
    'src/controls/BaseControl'
  ], function(
    BaseControl
  ){

'use strict';

var CustomControl = BaseControl.extend({
  initialize: function(options) {
    this.addSupportedType('customcontrol');
    this.type = this.type || 'customcontrol';
    return BaseControl.prototype.initialize.call(this, options);
  }

});

  return CustomControl;
});
