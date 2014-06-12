/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    // Mixins
    "citrix/common/Dialog",
    "dijit/form/_FormMixin"
],
function(dojo, declare, dialog, _formMixin) {
return declare("citrix.common.ValidationDialog", [dialog, _formMixin], {

    onFinish: function() {
        if (this.validate()) {
            this.onExecute();
        }
    },

    onSave: function() {
        if (!this.validate()) {
            return;
        }
        this.save();
    }
});
});