/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/array",
    // Resources
    "dojo/i18n!./nls/DeviceWidget",
    // Mixins
    "citrix/common/_TopicMixin",
    "citrix/sync-wui/GridTemplate"
],
function(dojo, declare, array, nls, _topicMixin, gridTemplate) {
return declare("citrix.sync-wui.DeviceGrid", [gridTemplate, _topicMixin], {

    getGridProperties: function() {
        return {
            allowSelectAll: true,
            selectionMode: "multiple",
            dataFunction: "list_devices_ui",
            idProperty: "device_uuid",
            filterParam: "device_name_contains",

            columns: [
                {
                    label: nls.NAME,
                    field: "device_name"
                }
            ],

            dataParams: {
                device_name_contains: null
            }
        };
    },

    postCreate: function() {
        this.inherited(arguments);
        this.subscribe(XUtils.publishTopic, dojo.hitch(this, this._messageHandler));
    },

    _messageHandler: function(message) {
        switch(message.type) {
            case "add_device":
            case "devices_removed":
                this._bindDijitRetainPosition();
                break;
        }
    }
});
});
