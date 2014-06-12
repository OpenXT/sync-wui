/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    "dojo/date/locale",
    // Resources
    "dojo/i18n!./nls/UnseenDeviceWidget",
    // Mixins
    "citrix/common/_TopicMixin",
    "citrix/sync-wui/StoreGrid"
],
function (dojo, declare, localeDate, nls, _topicMixin, grid) {
return declare("citrix.sync-wui.UnseenDeviceWidget", [grid, _topicMixin], {

    days: 3,
    dataFunction: "list_devices_ui",
    idProperty: "composite_key",

    constructor: function(args) {
        this.days = args.days || this.days;
        
        this.dataParams = {
            device_name_contains: null
        };

        this.columns = {
            device_name: nls.HEADING.format(this.days),
            user_name: nls.USER_NAME,
            report_time: {
                label: nls.REPORT_TIME,
                formatter: function(value) {
                    if(value != null) {
                        value = localeDate.format(new Date(value));
                    }
                    return value;
                }
            }
        };

        var milliseconds = 1000*60*60*24*this.days;
        this.query = function(item, index, items) {
            if (item.report_time) {
                var seen = new Date(item.report_time)
                var now = new Date();
                var diff = now - seen;
                if (diff > milliseconds) {
                    return true;
                }
            }
            return false;
        }
    },

    postCreate: function() {
        this.inherited(arguments);
        this.subscribe(XUtils.publishTopic, dojo.hitch(this, this._messageHandler));
    },

    _setStoreData: function(data) {
        dojo.forEach(data, function(item, i) {
            item.composite_key = item.device_uuid + (item.user_uuid ? "|" + item.user_uuid : "");
        });
        this.store.data = data;
    },

    _messageHandler: function(message) {
        switch(message.type) {
            case "add_device":
            case "devices_removed":
                this._bindDijit(true);
                break;
        }
    }
});
});