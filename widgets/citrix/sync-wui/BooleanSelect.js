/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    // Resources
    "dojo/i18n!citrix/sync-wui/nls/BooleanSelect",
    // Mixins
    "citrix/common/Select"
],
function(dojo, declare, nls, select) {

return declare("citrix.sync-wui.BooleanSelect", [select], {

    postCreate: function() {
        this.inherited(arguments);

        this.set("options", [
            {label: nls.TRUE, value: "true"},
            {label: nls.FALSE, value: "false"},
            {label: nls.NOT_SET, value: ""}
        ]);
    }
});
});