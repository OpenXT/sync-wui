/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    // Mixins
    "citrix/common/Grid",
    "citrix/sync-wui/_StoreMixin"
],
function (dojo, declare, grid, _storeMixin) {
return declare("citrix.sync-wui.StoreGrid", [grid, _storeMixin], {

});
});