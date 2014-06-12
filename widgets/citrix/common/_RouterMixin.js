/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    "dojo/router"
],
function (dojo, declare, router) {
return declare("citrix.common.BaseRouter", [], {

    routerBase: "",

    startup: function () {
        this.inherited(arguments);

        if (this.routerBase != "") {
            router.register("/{0}/:value".format(this.routerBase), dojo.hitch(this, function (e) {
                this.onRoute(e.params.value);
            }));
        }
    },

    onRoute: function(value) {

    },

    route: function(value) {
        if (this.routerBase != "" && value != undefined) {
            if(value == "") {
                router.go("/{0}".format(this.routerBase));
            } else {
                router.go("/{0}/{1}".format(this.routerBase, value));
            }
        }
    }
});
});