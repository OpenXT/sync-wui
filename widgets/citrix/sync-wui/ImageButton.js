/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    // Resources
    "dojo/text!citrix/sync-wui/templates/ImageButton.html",
    // Mixins
    "citrix/sync-wui/Button"
],
function(dojo, declare, template, button) {
return declare("citrix.sync-wui.ImageButton", [button], {

    templateString: template

   
});
});