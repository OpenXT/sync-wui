/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    // Mixins
    "dijit/form/RadioButton"
],
function(dojo, declare, radioButton) {
return declare("citrix.common.RadioButton", [radioButton], {

    bindIgnore: false,

    _clicked: function(/*Event*/ e) {
        this.inherited(arguments);
        this.focusNode.focus();
    }
});
});