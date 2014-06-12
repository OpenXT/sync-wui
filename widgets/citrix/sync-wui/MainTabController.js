/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    // Mixins
    "dijit/layout/TabController",
    // Required in code
    "citrix/sync-wui/MainTabButton"
],
function(dojo, declare, tabController, tabButton) {
return declare("citrix.sync-wui.MainTabController", tabController, {

    buttonWidget: tabButton
});
});