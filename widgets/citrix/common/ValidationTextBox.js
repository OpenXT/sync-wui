/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    // Mixins
    "dijit/form/ValidationTextBox",
    "citrix/common/_KeyboardAttachMixin"
],
function(dojo, declare, validationTextBox, _keyboardAttachMixin) {
return declare("citrix.common.ValidationTextBox", [validationTextBox, _keyboardAttachMixin], {

    missingMessage: ""
});
});