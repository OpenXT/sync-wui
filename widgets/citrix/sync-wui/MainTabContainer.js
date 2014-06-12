/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    // Resources
    "dojo/text!citrix/sync-wui/templates/MainTabContainer.html",
    // Mixins
    "citrix/common/RouterTabContainer",
    // Required in code
    "citrix/sync-wui/MainTabController"
],
function(dojo, declare, template, tabContainer) {
return declare("citrix.sync-wui.MainTabContainer", tabContainer, {

    templateString: template,
    controllerWidget: "citrix.sync-wui.MainTabController"
	
});
});