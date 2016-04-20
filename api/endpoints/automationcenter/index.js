'use strict';

var util = require('util');
var _ = require('lodash');
var logger = require('logentries-logformat')('suite-sdk');

var Base = require('../_base');

var AutomationCenter = function(request, options) {
  Base.call(this, options);
  this._request = request;
};

util.inherits(AutomationCenter, Base);

_.extend(AutomationCenter.prototype, {

  programResource: function(payload, options) {
    return this._requireParameters(payload, ['service_id']).then(function() {
      logger.log('automationcenter_programresource');

      if (payload.resource_id) {
        var url = util.format('/programresource/service_id=%s&resource_id=%d', payload.service_id, payload.resource_id);
      } else {
        var url = util.format('/programresource/service_id=%s', payload.service_id);
      }

      return this._request.get(
        this._getCustomerId(options),
        url,
        options
      );
    }.bind(this));
  }

});


AutomationCenter.create = function(request, options) {
  return new AutomationCenter(request, options);
};

module.exports = AutomationCenter;
