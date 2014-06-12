/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    // Mixins
    "dijit/Menu"
],
function(dojo, declare, menu) {
return declare("citrix.common.Menu", [menu], {

    baseClass: "citrixMenu"
});
});