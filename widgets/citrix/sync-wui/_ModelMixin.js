/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    "dijit"
],
function(dojo, declare, dijit) {
return declare("citrix.sync-wui._ModelMixin", null, {

    dataFunction: "",
    saveFunction: "",
    getDataFinishFn: null,

    constructor: function() {
        this.dataParams = {};
        this.saveParams = {};
        this.model = {};
    },

    postCreate: function() {
        this.inherited(arguments);
        this.getData();
    },

    getData: function() {
        if(this.dataFunction != "") {
            socket.data_access(this.dataFunction, this.dataParams, dojo.hitch(this, function(data) {
                this.model = data[0];
                if(this.getDataFinishFn) {
                    this.getDataFinishFn();
                } else {
                    this._bindDijit();
                }
            }));
        }
    },

    saveData: function(finish) {
        if(this.saveFunction != "") {
            socket.data_access(this.saveFunction, this.saveParams, dojo.hitch(this, function(data) {
                if(finish) {
                    finish(data);
                }
                this.getData();
            }), function(error) {
                XenClient.Utils.messageBox.showError("[{0}] {1}".format(error.code, error.message));
            });
        }
    }
});
});
