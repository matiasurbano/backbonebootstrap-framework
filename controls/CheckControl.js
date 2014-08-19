/*globals define*/

define( [
    'lodash',
    'src/controls/BaseControl'
  ], function(
    _,
    BaseControl
  ){

'use strict';

var CheckControl = BaseControl.extend({

  initialize: function(options) {

    options = options || {};

    _.defaults(this, options);

    this.addSupportedType('check');
    this.type = this.type || 'check';

    if (!this.inputType) this.inputType = 'text';

    this.controlTemplate = this.controlTemplate ||
      '<div class="checker" id="uniform-titleCheck2">' +
      '<span class="">'+
      '<input <%= disabled %> id="<%= field.fullName %>" type="checkbox"  name="checkRow" value="<%= value %>">' +
      '</span>' +
      '</div>';

    BaseControl.prototype.initialize.call(this, options);
  }

});

  return CheckControl;
});
