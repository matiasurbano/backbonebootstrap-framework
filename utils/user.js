/*globals define*/

define( [
    'jquery', 'lodash',
    'src/BaseObject',
    'src/utils/cookies'
  ], function(
    $, _,
    BaseObject,
    cookies
  ) {

'use strict';

var User = BaseObject.extend({

  initialize: function(options) {

    var defaults = {
      initialized   : false,
      userId        : undefined,
      defaultUserId : 'anonymous',
      cookieName    : 'userId',
      success       : undefined,
      error         : undefined,
      profile       : undefined,
      permissions   : undefined
    };

    _.bindAll(this, 'onUserLoaded');

    options = options || {};

    _.defaults(this, defaults);
    _.extend(this, options);

    if (!this.error) {
      this.error = function(message) {
        if (!message) message = 'error initilizing user';
        throw new Error(message);
      };
    }

    // super.initialize
    BaseObject.prototype.initialize.call(this, options);

    this.listenTo(this, 'user:loaded', this.onUserLoaded);
    this.load();
  },

  /**
   * Authenticate the current user, return the userId
   * and also fetch the profile info and the permissions
   *
   * Should be overriden to fetch all the needed data
   *
   * @return {[type]} [description]
   */
  load: function() {
    this.trigger('user:loaded');
  },

  onUserLoaded: function() {
    var errors = [];

    if (!this.userId)       errors.push('Could not authenticate user. userId is empty');
    if (!this.profile)      errors.push('Could not fetch user profile.');
    if (!this.permissions)  errors.push('Could not fetch user permissions.');

    if (errors.length > 0) {
      this.clear();
      this.error(errors.join('\n'));
      return;
    }
    this.initialized = true;
    this.trigger('user:initialized');
    if (this.success) this.success(this);
  },

  clear: function() {
    this.initialized = false;
    this.profile     = undefined;
    this.permission  = undefined;
    this.setUserId(undefined);
    return this;
  },

  setUserId: function(userId) {
    this.userId = userId;
    cookies.set(this.cookieName, this.userId);
    return this.userId;
  },

  /**
   * [getCurrentUser description]
   * @return {String} [description]
   */
  getUserId: function() {
    var userId = cookies.get(this.cookieName);

    if (!userId) {
      //mock user
      userId = this.defaultUserId;
      cookies.set(this.cookieName, userId);
    }
    return userId;
  },

  checkInitialized: function() {
    if (!this.initialized) throw new Error('user.permissions not initialized');
  },

  /**
   * [can description]
   * @param  {String} resource   [description]
   * @param  {String} permission [description]
   * @return {Boolean}           [description]
   */
  can: function(resource, permission) {
    var actions;

    permission = (permission || '*').toLowerCase();
    actions = this.permissionsByResource(resource);

    if (!actions || actions.length === 0) return false;
    if (permission === '*') return true;

    return _.contains(actions, permission);
  },

  /**
   * [canReadOnly description]
   * @param  {String} resource [description]
   * @return {Boolean}          [description]
   */
  canReadOnly: function(resource) {
    var actions = this.permissionsByResource(resource);
    return (actions === ['consulta']);
  },

    /**
   * [permissionsByResource description]
   * @param  {String} resource [description]
   * @return {{Array.<string>}}          [description]
   */
  permissionsByResource: function(resource) {
    this.checkInitialized();

    // assert
    resource = resource || undefined;
    if (!resource) throw new Error('resource not specified');

    return this.permissions[resource.toLowerCase()] || [];
  }

});

  return User;
});
