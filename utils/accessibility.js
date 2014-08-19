/*globals define, document*/

define([
    'jquery'
], function (
  $) {

  'use strict';

  var accessibility = {};

  /**
   * Permite cambiar la interfaz de usuario permitiendo que personas no videntes 
   * pueda vizualizar facilmente la misma, alterando los fondos de la aplicacion
   * y el contrastre del la letra.
   * 
   **/
  accessibility.colorBlind = function () {
    $('*').css('color', 'black');
    $('div.navbar-inner').css('background-color', 'white');
    $('* a:hover').css('color', 'black');
  };

  /**
   * Permite cambiar la interfaz de usuario permitiendo que personas no videntes 
   * pueda vizualizar facilmente la misma, cambiando la resolucion de la fuente.
   * 
   **/
  accessibility.resizeText = function (multiplier) {
    if (document.body.style.fontSize === '') {
      document.body.style.fontSize = '1.0em';
    }
    document.body.style.fontSize =
      parseFloat(document.body.style.fontSize) + (multiplier * 0.2) + 'em';
  };

  return accessibility;
});