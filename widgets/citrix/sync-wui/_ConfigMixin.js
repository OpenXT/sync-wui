/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/query"
],
function(dojo, declare, array, query) {
return declare("citrix.sync-wui._ConfigMixin", null, {

    configDataFunction: "",
    configSaveFunction: "",

    constructor: function() {
        this.configDataParams = {};
        this.configSaveParams = {};
        this.config = {};
    },

    postCreate: function() {
        this.inherited(arguments);
        this.getConfigData();
    },

    getConfigData: function() {
        if(this.configDataFunction != "") {
            socket.data_access(this.configDataFunction, this.configDataParams, dojo.hitch(this, function(data) {
                this.config = {};
                array.forEach(data, function(item) {
                    if(!this.config[item.daemon]) {
                        this.config[item.daemon] = {};
                    }
                    this.config[item.daemon][item.key] = item.value;
                }, this);
                this._setCustomsArray();
                this._bindDijit();
            }));
        }
    },

    _setCustomsArray: function() {
        this.config._customs = [];
        array.forEach(Object.keys(this.config), function(daemon) {
            if(daemon == "_customs") {
                return;
            }
            array.forEach(Object.keys(this.config[daemon]), function(property) {
                if(!daemon.startsWith("nic/") && query("[name = 'config." + daemon + "." + property + "']").length == 0) {
                    this.config._customs.push({
                        id: daemon + "." + property,
                        daemon: daemon,
                        property: property,
                        value: this.config[daemon][property],
                        className: this.config[daemon][property] == "" ? "removedConfig" : ""
                    });
                }
            }, this);
        }, this);
    },

    saveConfigData: function(configObject) {
        if(this.configSaveFunction != "") {
            this.configSaveParams.config = this._formatConfigObjectsIntoStringList(configObject);
            socket.data_access(this.configSaveFunction, this.configSaveParams, dojo.hitch(this, function(data){
                this.getConfigData();
            }));
        }
    },

    _formatConfigObjectsIntoStringList: function(configObject) {
        var configlist = [];
        array.forEach(Object.keys(configObject), function(daemonkey) {
            array.forEach(Object.keys(configObject[daemonkey]), function(key) {
                var value = daemonkey + ":" + key + ":" + configObject[daemonkey][key];
                configlist.push(value);
            }, this);
        }, this);
        return configlist;
    }
});
});