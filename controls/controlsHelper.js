/*globals define*/

define( [
    'lodash',
    'src/controls/BaseControl',
    'src/controls/InputControl',
    'src/controls/DateControl',
    'src/controls/CheckControl',
    'src/controls/TextareaControl',
    'src/controls/ComboControl',
    'src/controls/SiNoComboControl',
    'src/controls/CollectionComboControl',
    'src/controls/Select2Control',
    'src/controls/Select2MultiControl'
  ], function(
    _,
    BaseControl,
    InputControl,
    DateControl,
    CheckControl,
    TextareaControl,
    ComboControl,
    SiNoComboControl,
    CollectionComboControl,
    Select2Control,
    Select2MultiControl
  ) {

'use strict';

var controlsHelper = {};

/**
 * Creates a control instance from a field definition.
 *
 * It checks for field.control to discover the type of control to create.
 *
 * The control constructor receives the field definition itself as parameter
 * plus a reference to the model.
 *
 * Supported controls: input, textarea
 *
 * @param     {field} field definition.
 *
 * @return    returns a new instance of the correspoding control
 *
 */
// controlsHelper.createFromField = function(field, model) {

//   field = field || {};

//   var control = field.control || 'input';

//   // already an instantiated control
//   if (control instanceof BaseControl) return control;

//   // the control instance has already been created
//   if (!_.isString(control)) {
//     throw new Error('control should be an instance of BaseControl or a string with the type of control.');
//   }

//   // check for a supported control type
//   var ControlConstructor = controlsHelper.constructors[control.toLowerCase()];
//   if (!ControlConstructor) throw new Error('control of type "' + control + '" not supported.');

//   // add model to the constructor parameters
//   var options = _.clone(field);
//   options.model = model;

//   return new ControlConstructor(options);
// };

controlsHelper.createControl = function(options, extraOptions) {

  options = options || {};

  // specified the control type as a string
  // transform it into an object
  if (_.isString(options)) options = { type: options };

  // passed extraOptions, overwrite those from options
  // it's used to pass the field of the control
  if (extraOptions) _.extend(options, extraOptions);

  // received an already instantiated control, just return it
  if (options instanceof BaseControl) return options;

  var type = (options.type || 'input').toLowerCase();

  if (!_.isString(type)) throw new Error('control.type should be a string.');

  if (type === 'customcontrol') {
    if (!options.constructor) throw new Error('options.constructor not specified.');
    if (!_.isFunction(options.constructor)) throw new Error('options.constructor should be a function.');

    var Constructor = options.constructor;

    return new Constructor(options);
  }

  // check for a supported control type
  var ControlConstructor = controlsHelper.constructors[type];

  if (!ControlConstructor) throw new Error('control of type "' + type + '" not supported.');

  return new ControlConstructor(options);

};

controlsHelper.constructors = {
  input               : InputControl,
  date                : DateControl,
  check               : CheckControl,
  textarea            : TextareaControl,
  combo               : ComboControl,
  sinocombo           : SiNoComboControl,
  collectioncombo     : CollectionComboControl,
  select2combo        : Select2Control,
  select2multicombo   : Select2MultiControl
};

  return controlsHelper;
});
