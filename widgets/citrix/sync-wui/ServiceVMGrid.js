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
    "citrix/sync-wui/VMGrid"
],
function(dojo, declare, nls, vmGrid) {
return declare("citrix.sync-wui.ServiceVMGrid", [vmGrid], {

    getGridProperties: function() {
        var props = this.inherited(arguments);
        props.columns.vm_name = nls.SERVICE_NAME;
        return props;
    },

    query: function(item, index, items) {
        return !["svm", "pvm", null].contains(item.config_value_1);
    }
});
});
