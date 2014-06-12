/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    // Resources
    "dojo/i18n!./nls/VMWidget",
    // Mixins
    "citrix/common/_TopicMixin",
    "citrix/sync-wui/GridTemplate"
],
function(dojo, declare, nls, _topicMixin, gridTemplate) {
return declare("citrix.sync-wui.VMGrid", [gridTemplate, _topicMixin], {

    getGridProperties: function() {
        return {
            allowSelectAll: true,
            selectionMode: "multiple",
            dataFunction: "list_vms_ui",
            idProperty: "vm_uuid",
            filterParam: "vm_name_contains",

            columns: {
                icon: {
                    label: " ",
                    field: "config_value_2",
                    className: "field-icon",
                    formatter: function(path) {
                        if (path) {
                            if (XenClient.Utils.VmIcons[path]) {
                                return "<img class='vmGridImage' src='" + XenClient.Utils.VmIcons[path] + "'/>";
                            }
                        }
                        return "";
                    }
                },                
                vm_name: nls.NAME
            },

            dataParams: {
                vm_name_contains: null,
                config: ["vm:type", "vm:image-path"]
            }
        };
    },

    postCreate: function() {
        this.inherited(arguments);
        this.grid.query = this.query;
        this.subscribe(XUtils.publishTopic, dojo.hitch(this, this._messageHandler));
    },

    query: function(item, index, items) {
        return ["svm", "pvm", null].contains(item.config_value_1);
    },

    _messageHandler: function(message) {
        switch(message.type) {
            case "vms_removed":
            case "add_vm":
            case "devices_removed":
            case "vm_instances_removed":
            case "vm_instances_assigned":
                this._bindDijitRetainPosition();
                break;
        }
    }
});
});
