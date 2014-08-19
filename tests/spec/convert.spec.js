/*globals define,describe,beforeEach,it,expect*/

define([
    'src/utils/convert'
  ], function(
    convert
  ) {

'use strict';

describe('utils.convert.isNumeric helper', function() {

  var isNumeric = convert.isNumeric,
      value, expected;

  describe('when a string representing a number is passed', function() {
    it('it should return true', function() {

      expect(isNumeric('123')).toEqual(true);

    });
  });

  describe('when a string that is not a number is passed', function() {
    it('it should return false', function() {

      expect(isNumeric('Hi everybody')).toEqual(false);

    });
  });

  describe('when a Boolean is passed', function() {
    it('it should return false', function() {

      expect(isNumeric(true)).toEqual(false);
      expect(isNumeric(false)).toEqual(false);

    });
  });

  describe('when an empty (falsy) value is passed', function() {
    it('it should return false', function() {

      expect(isNumeric(false)).toEqual(false);
      expect(isNumeric(undefined)).toEqual(false);
      expect(isNumeric(null)).toEqual(false);
      expect(isNumeric({})).toEqual(false);
      expect(isNumeric('')).toEqual(false);
      expect(isNumeric('    ')).toEqual(false);

    });
  });

  describe('when a valid number with sign and decimals is passed', function() {
    it('it should return true', function() {

      var values = ['0', '+0','-0', '0.0', '1.5', '-1.5', '+1.5', ' 14', '14 '];

      for (var i=0; i<values.length; i++) {
        expect(isNumeric(values[i])).toEqual(true);
      }

    });
  });

  describe('when an invalid number is passed', function() {
    it('it should return false', function() {

      var values = ['--0', '++0', '1 0', '1+', '1-', '13.1.2', '13,1', '13..1'];

      for (var i=0; i<values.length; i++) {
        expect(isNumeric(values[i])).toEqual(false);
      }

    });
  });

});


});
