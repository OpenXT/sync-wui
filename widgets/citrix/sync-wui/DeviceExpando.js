/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    "dojo/dom-class",
    // Resources
    "dojo/i18n!./nls/DeviceWidget",
    // Mixins
    "citrix/common/ContentPane",
    // Used in code
    "citrix/sync-wui/DevicePlatform",
    "citrix/sync-wui/VMSelect"
    // Used in template
],
function(dojo, declare, domClass, nls, contentPane, devicePlatform, vmSelect) {
return declare("citrix.sync-wui.DeviceExpando", [contentPane], {

    device_uuid: "",
    _expanded: false,
    onRouting: null,

    postCreate: function() {
        this.inherited(arguments);
        domClass.add(this.domNode, "expandoContent");
        this.on("click", function(e) {
            // prevent clicking the background of the expando bubbling up to the row (de)select event
            e.preventDefault();
            e.stopPropagation();
        });
    },

    expand: function() {
        this.isVisible = true;
        if(!this._expanded) {
            var platform = new devicePlatform({device_uuid: this.device_uuid, onRouting: this.onRouting});
            var userselect = new vmSelect({userVMs: true, device_uuid: this.device_uuid, itemClass: "citrixImageItem citrixImage45"});
            var serviceselect = new vmSelect({userVMs: false, device_uuid: this.device_uuid, itemClass: "citrixImageItem citrixImage45"});
            this.addChild(platform);
            this.addChild(userselect);
            this.addChild(serviceselect);
            platform.startup();
            userselect.startup();
            serviceselect.startup();
            this._expanded = true;
        } else {
            dojo.forEach(this.getChildren(), function(child) {
                child.getData();
            });
        }
    },

    collapse: function() {
        this.isVisible = false;
    },

    startup: function() {
        this.inherited(arguments);
    }
});
});