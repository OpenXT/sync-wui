/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    // Mixins
    "citrix/common/ValidationTextBox"
],
function(dojo, declare, validationTextBox, _keyboardAttachMixin) {
return declare("citrix.common.NumberTextBox", validationTextBox, {

    regExp: '[0-9]*'
});
});