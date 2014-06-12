/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    // Resources
    "dojo/text!citrix/sync-wui/templates/ComboButton.html",
    // Mixins
    "citrix/common/ComboButton"
],
function(dojo, declare, template, comboButton) {
return declare("citrix.sync-wui.ComboButton", [comboButton], {

    templateString: template,

    cssStateNodes: {
   		"buttonNode": "dijitButtonNode",
   		"_popupStateNode": "dijitDownArrowButton"
   	}

});
});