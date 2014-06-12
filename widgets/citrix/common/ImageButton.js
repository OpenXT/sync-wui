/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    // Resources
    "dojo/text!citrix/common/templates/ImageButton.html",
    // Mixins
    "citrix/common/Button"
],
function(dojo, declare, template, button) {
return declare("citrix.common.ImageButton", [button], {

    templateString: template
});
});