/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    // Resources
    "dojo/i18n!./nls/DiskWidget",
    // Mixins
    "citrix/common/_TopicMixin",
    "citrix/sync-wui/GridTemplate"
],
function(dojo, declare, nls, _topicMixin, gridTemplate) {
return declare("citrix.sync-wui.DiskGrid", [gridTemplate, _topicMixin], {

    getGridProperties: function() {
        return {
            dataFunction: "list_disks_ui",
            idProperty: "disk_uuid",
            filterParam: "disk_name_contains",

            columns: {
                disk_name: nls.NAME,
                file_path: nls.PATH,
                disk_type: {
                    label: nls.TYPE,
                    formatter: function(type) {
                        return (type == "v") ? "VHD" : (type == "i") ? "ISO" : type;
                    }
                },
                read_only: {
                    label: nls.PERSISTENT,
                    formatter: function(readonly) {
                        return (readonly == "t") ? nls.FALSE : (readonly == "f") ? nls.TRUE : readonly;
                    }
                }
            },

            dataParams: {
                disk_name_contains: ""
            }
        };
    },

    postCreate: function() {
        this.inherited(arguments);
        this.subscribe(XUtils.publishTopic, dojo.hitch(this, this._messageHandler));
    },

    _messageHandler: function(message) {
        switch(message.type) {
            case "add_disk":
            case "remove_disk":
                this._bindDijitRetainPosition();
                break;
        }
    }
});
});
