/*globals define,describe,beforeEach,afterEach,it,expect*/

define([
    'lodash',
    'src/BaseObject'
  ], function(
    _,
    BaseObject
  ) {

'use strict';

describe('BaseObject.initOptions method', function() {

  var Parent, Child, Required;

  beforeEach(function() {
    Parent = BaseObject.extend({
      name: undefined,
      initialize: function(options) {
        var defaults = {
          name    : 'no name',
          surname : 'no surname',
          age     : 10
        };
        this.initOptions(options, defaults);
        return BaseObject.prototype.initialize.call(this, options);
      }
    });

    Child = Parent.extend({
      initialize: function(options) {
        var defaults = {
          childName : 'no child name',
          surname   : 'no child surname'
        };
        this.initOptions(options, defaults);
        return Parent.prototype.initialize.call(this, options);
      }
    });

    Required = Child.extend({
      name: undefined,
      initialize: function(options) {
        var reqDefaults = {
          id        : undefined,
          mandatory : true
        };
        this.initOptions(options, reqDefaults, { required: true });

        var defaults = {
          childName   : 'required childName',
          name        : 'required name',
          surname     : 'required surname'
        };

        this.initOptions(options, defaults);
        return Child.prototype.initialize.call(this, options);
      }
    });

  });

  afterEach(function() {
    Parent = null;
    Child = null;
    Required = null;
  });

  describe('when an object receives an options object', function() {
    it('it uses the defaults parameters to initialize its state', function() {

      var parent = new Parent({
        name: 'overwritten name'
      });

      var expected = {
        name    : 'overwritten name',
        surname : 'no surname',
        age     : 10
      };

      var value = _.pick(parent, 'name', 'surname', 'age');

      expect(value).toEqual(expected);
    });
  });

  describe('when an inhereted object receives an options object', function() {
    it('it should be able to add and overwrite paramters from tis parent', function() {
      // get the default values
      var child = new Child();

      var expected = {
        childName : 'no child name',
        name      : 'no name',
        surname   : 'no child surname',
        age       : 10
      };

      var value = _.pick(child, 'childName', 'name', 'surname', 'age');

      expect(value).toEqual(expected);

      // overwrite using options
      child = new Child({
        childName : 'overwritten child name',
        age       : 33
      });

      expected = {
        childName : 'overwritten child name',
        name      : 'no name',
        surname   : 'no child surname',
        age       : 33
      };

      value = _.pick(child, 'childName', 'name', 'surname', 'age');

      expect(value).toEqual(expected);

    });
  });

  describe('when initializing an object', function() {
    it('it should throw an error if there\'s any required parameter missing', function() {

      var toErr = function() {
        // overwrite using options, 'mandatory' required parameter is missing!
        var required = new Required({
          id        : 3,
          childName : 'overwritten',
          age       : 33
        });
        return required;
      };

      expect(toErr).toThrow();

    });
  });

  describe('when initializing an object', function() {
    it('it should return the object if all required parameters are present', function() {

      var toErr = function() {
        // overwrite using options
        var required = new Required({
          id        : 33,
          name      : 'required overwritten name',
          mandatory : undefined
        });
        return required;
      };

      expect(toErr).not.toThrow();

      var expected = {
        childName : 'required childName',
        name      : 'required overwritten name',
        surname   : 'required surname',
        age       : 10,
        id        : 33,
        mandatory : undefined
      };

      var value = _.pick(toErr(), 'id,mandatory,childName,name,surname,age'.split(','));

      expect(value).toEqual(expected);

    });
  });

  describe('when the consume parameter is passed', function() {
    it('it should remove from the option every parameter used', function() {

      var defaults = {
        name    : 'no name',
        age     : 10
      };

      var obj = {
        surname     : 'no surname',
        age         : null,
        initOptions : BaseObject.prototype.initOptions
      };

      var options = {
        name   : 'overwritten name',
        age    : 20,
        unused : 'do not remove me!'
      };

      obj.initOptions(options, defaults, { consume: true });

      var expected = {
        name      : 'overwritten name',
        surname   : 'no surname',
        age       : 20
      };

      var value = _.pick(obj, 'name,surname,age'.split(','));

      expect(value).toEqual(expected);

      expected = {
        unused : 'do not remove me!'
      };

      // only unused should remain in options
      expect(options).toEqual(expected);

    });
  });

});

});
