/*globals define*/

define( [
    'jquery', 'lodash',
    'src/controls/InputControl',
    'src/controls/Select2Control'
  ], function(
    $, _,
    InputControl,
    Select2Control
  ){

'use strict';

var Select2MultiControl = Select2Control.extend({

  initialize: function(options) {

    options = options || {};

    _.defaults(this, options);

    this.type = this.type || 'select2multicombo';

    this.multiple = true;

    Select2Control.prototype.initialize.call(this, options);

  },

  initSelectionHandler: function(element, callback) {
    var selectedItems = _.map(this.field.val(), function(item) {
      return this.getRowData(item);
    }, this);
    callback(selectedItems);
  },

/**
 * Overrides the elements to display the htmlErrors
 *
 * Select2 when configured to work with multiple selected items,
 * (multiple = true) saves the choices in an ul tag, using the following
 * html tructure:
 *
 * <div class="span6">
 *   <label class="control-label" for="s2id_autogen4">Tags</label>
 *
 *   <div class="select2-container select2-container-multi" id="s2id_Tags">
 *     <ul class="select2-choices">
 *       <li class="select2-search-choice">
 *         <div>A revisar</div>
 *         <a href="#" onclick="return false;" class="select2-search-choice-close" tabindex="-1"></a>
 *       </li>
 *       [...]
 *       <li class="select2-search-field">
 *         <input type="text" autocomplete="off" class="select2-input" id="s2id_autogen4" style="width: 10px;">
 *       </li>
 *     </ul>
 *   </div>
 *   <input id="Tags" value="1,3" class="select2-offscreen" tabindex="-1">
 *   <ul></ul>    <!-- error should be displayed here! -->
 * </div>
 *
 * We override renderHtmlErrors to point the input dom element to the ul with
 * the 'select2-choices' class
 *
 * @param  {[type]} field      [description]
 * @param  {[type]} $container [description]
 * @param  {[type]} $input     [description]
 * @param  {[type]} $error     [description]
 * @return {[type]}            [description]
 */
  renderHtmlErrors: function(field, $container, $input, $error) {
    $input = $container.find('ul.select2-choices');
    // we have to call directly super.super.renderHtmlErrors
    // !!! don't call Select2Control.renderHtmlErrors!!!
    InputControl.prototype.renderHtmlErrors.call(this,
      field, $container, $input, $error
    );
  }

});

  return Select2MultiControl;
});
