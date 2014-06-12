/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    // Mixins
    "citrix/sync-wui/VMWidget",
    "citrix/sync-wui/ServiceVMGrid"
],
function (dojo, declare, vmWidget, serviceVmGrid) {
return declare("citrix.sync-wui.ServiceVMWidget", [vmWidget, serviceVmGrid], {

    routerBase: "servicevms",
    vm_type: "",

    postCreate: function() {
        this.inherited(arguments);
        this.addVMButton.set("label", this.ADD_SERVICE);
    }
});
});