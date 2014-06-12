/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    // Used in code
    "dojo/store/Memory",
    "dojo/store/Observable"
],
function (dojo, declare, memory, observable) {
return declare("citrix.sync-wui._StoreMixin", null, {

    dataFunction: "",
    idProperty: "",
    filterParam: "",

    constructor: function() {
        this.dataParams = {};
    },

    postCreate: function () {
        this.inherited(arguments);
        this.store = observable(new memory());
        this._bindDijit();
    },

    _setStoreData: function(data) {
        this.store.data = data;
    },

    getData: function (retainPosition, onFinish) {
        if (this.dataFunction != "") {
            socket.data_access(this.dataFunction, this.dataParams, dojo.hitch(this, function (data) {
                this._setStoreData(data);

                if (this.idProperty != "") {
                    this.store.idProperty = this.idProperty;
                }

                if(retainPosition) {
                    var pos = this.getScrollPosition();
                    this.refresh();
                    this.scrollTo(pos);
                } else {
                    this.refresh();
                }
                if(onFinish) {
                    onFinish();
                }
            }));
        }
    },

    _setFilterParam: function (value) {
        if (this.filterParam && this.dataParams[this.filterParam] !== undefined) {
            this.dataParams[this.filterParam] = value == "" ? null : value;
        }
        this._bindDijit();
    },

    _bindDijit: function (retainPosition, onFinish) {
        this.getData(retainPosition, onFinish);
    }
});
});