'use strict';

define([
 'jquery', 'jcookie', 'lodash', 'app/config'
 ],
  function ($, jcookie, _, config) {

    var analytics = {


      defaults: {
        /**
         *  @example 
         *  Freegeoip Sample JSON
         * 
         *  {
              "ip": "200.1.113.9",
              "country_code": "AR",
              "country_name": "Argentina",
              "region_code": "07",
              "region_name": "Distrito Federal",
              "city": "Buenos Aires",
              "zipcode": "",
              "latitude": -34.5875,
              "longitude": -58.6725,
              "metro_code": "",
              "area_code": ""
            }

            Smart-ip Sample JSON  
            {
               "source":"smart-ip.net",
               "host":"200.1.113.8",
               "lang":"en",
               "countryName":"Argentina",
               "countryCode":"AR",
               "city":"Buenos Aires",
               "region":"Distrito Federal",
               "latitude":"-34.5875",
               "longitude":"-58.6725",
               "timezone":"America\/Argentina\/Buenos_Aires"
            }

         */
        fields: ['ip', 'city_code', 'city_name', 'contry_code', 'contry_name', 'region_code', 'region_name', 'latitude', 'longitude', 'region_code', 'region_name'],
        cookie_name: 'user-analytics',
        map: {
          current: 0,
          getNext: function () {
            if (this.current === 0) return this.urls[this.current];
            else if (this.urls.length <= this.current + 1)
              return this.urls[++this.current];
          },
          urls: []
        }
      },

      intialize: function () {
        if (!config) throw new Error('Analytics: Config settings cant be found.');
        if (!config.analytic) throw new Error('Analytic: settings are missing.');

        // JSON parte config
        $.cookie.json = true;


        // setting defaults settings
        _.defaults(this, this.defaults);


        // Setting analytics url settings.
        this.map["urls"] = config.analytic.fetch_urls;
        this.serverURL = function () {
          if (config.endpoint.indexOf('/'))
            return config.endpoint + config.analytic.save_endpoint.replace('/', '');
          return config.endpoint + config.analytic.save_endpoint;
        };


      },

      get: function () {
        var __cookie = $.cookie(this.cookie_name);

        return ((__cookie !== undefined) ? $.parseJSON(__cookie) : undefined);
      },

      /**
       * Set analytic data on client cookie
       *
       * @param {object} Client MetaData from client.
       * @returns {object} Save cookie object.
       */
      set: function (metadata) {
        var cookie_due_time = 1, // 1 hour
          cookie_due = new Date();

        // setting cookie due time.
        // cookie_due.setSeconds(cookie_due.getSeconds()+60);
        cookie_due.setHours(cookie_due.getHours() + cookie_due_time);

        return $.cookie(this.cookie_name, metadata, {
          expires: cookie_due
        });
      },

      active: function () {
        var userAnalytics = this.get();

        if (userAnalytics !== undefined)
          return true;

        return false;
      },

      /**
       * Adapt metadata from browser to Server Model
       *
       * @param [object] dtope ata Original data value.
       * @param [object] fields_map Mapping fields object.
       * @returns [object] Mapped object.
       *
       */
      adaptData: function (data, fields_map) {
        var obj = {};
        _.each(_.pairs(data), function (field) {

          // field[0] --> field key name
          // field[1] --> field key value
          var field_name = fields_map[field[0]];
          if (field_name !== undefined) {

            obj[field_name] = field[1];
          }
        });

        return obj;
      },

      /**
       * Post to the server client analytics results to store in db.
       * @parms {object} metadata  Client MetaData from browser.
       */
      saveResults: function (metadata, callback) {

        var options = {
          type: 'POST',
          contentType: "application/json",
          dataType: "json",
          url: this.serverURL(),
          data: JSON.stringify(metadata),
          processData: true,
          success: callback,
          fail: function () {
            throw new Error("Analytics: Post to the server failts.");
          }
        };
        $.ajax(options);
      },

      /**
       * Recursive fetch to many webservices to get client data (Ip,Location,city, etc)
       *
       * @param {function} success Callback.
       */
      fetchAnalyticsUrl: function (success) {
        var __this = this;

        function fetch(url, fields_map, success) {
          var options = {
            dataType: "json",
            url: url,
            success: function (data) {
              var adapted_data = __this.adaptData(data, fields_map);

              success(adapted_data);
            },
            fail: function () {
              var nextUrl = __this.map.getNext();
              fetch(nextUrl.url, nextUrl.fields_map, success);
            }
          };

          $.ajax(options);
        };

        var nextUrl = __this.map.getNext();
        fetch(nextUrl.url, nextUrl.fields_map, success);

      },

      /*
       * Check againts a cookie and then post analytics data to server side.
       */
      report: function () {
        var __this = this;

        // load default settings from app/config
        this.intialize();

        if (!this.active()) {
          this.fetchAnalyticsUrl(function (data) {
            if (!data) console.log("Error");


            __this.set(JSON.stringify(data));
            console.log("Analytics: Data was sent.");

            // post metadata to the server 
            __this.saveResults(data, function (data) {
              console.log("Analytics: Save Success.");

            });

          });
        } else
          console.log("Analytics: Same logged user.");

      }

    };



    return analytics;
  });