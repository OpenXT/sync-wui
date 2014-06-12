/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    // Mixins
    "dijit/layout/TabContainer",
    // Required in code
    "dojo/router",
    "dojo/hash"
],
function(dojo, declare, tabContainer, router, hash) {
return declare("citrix.common.RouterTabContainer", tabContainer, {

    startup: function() {
        this.inherited(arguments);

        this.watch("selectedChildWidget", dojo.hitch(this, function(prop, oldVal, newVal) {
            var current = "/" + newVal.id.toLowerCase();
            if (hash().match("^" + current) != current) {
                hash("/" + newVal.id.toLowerCase());
            }
        }));

        dojo.forEach(this.getChildren(), function(child) {
            router.register("/{0}.*".format(child.id), dojo.hitch(this, function(e) {
                this.selectChild(child);
            }));
        }, this);
    }
});
});