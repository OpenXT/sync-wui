/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    // Resources
    "dojo/text!citrix/common/templates/ComboButton.html",
    // Mixins
    "dijit/form/ComboButton"
],
function(dojo, declare, template, comboButton) {
return declare("citrix.common.ComboButton", [comboButton], {

    templateString: template

});
});