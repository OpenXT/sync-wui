/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    // Resources
    "dojo/text!citrix/sync-wui/templates/MainTabButton.html",
    // Mixins
    "dijit/layout/TabController"
],
function(dojo, declare, template, tabController) {
return declare("citrix.sync-wui.MainTabButton", tabController.TabButton, {

    templateString: template
    //baseClass: "citrixMainTab"
});
});