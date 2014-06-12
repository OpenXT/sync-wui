/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    // Resources
    "dojo/i18n!./nls/DeviceWidget",
    "dojo/text!./templates/DevicePlatform.html",
    // Mixins
    "dijit/_Widget",
    "dijit/_Templated",
    "dijit/_Contained",
    "citrix/common/_BoundContainerMixin",
    "citrix/sync-wui/_ModelMixin",
    // Used in template
    "citrix/common/BoundWidget"
],
function(dojo, declare, nls, template, _widget, _templated, _contained, _boundContainer, _model) {
return declare("citrix.sync-wui.DevicePlatform", [_widget, _templated, _contained, _boundContainer, _model], {

    templateString: template,
    widgetsInTemplate: true,

    device_uuid: "",
    dataFunction: "get_report",
    onRouting: null,

    constructor: function(args) {
        this.device_uuid = args.device_uuid;
        this.dataParams = {
            device_uuid: this.device_uuid
        };
    },

    postMixInProperties: function() {
        dojo.mixin(this, nls);
    },

    _bindDijit: function() {
        this.bind(this.model, this.domNode);
    },

    onConfigClick: function(event) {
        if(this.onRouting) {
            this.onRouting(this.device_uuid);
        }
    }
});
});