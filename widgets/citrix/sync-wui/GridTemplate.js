/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/aspect",
    "dojo/string",
    // Resources
    "dojo/i18n!./nls/GridDialog",
    "dojo/text!./templates/GridTemplate.html",
    // Mixins
    "dijit/_Widget",
    "dijit/_Templated",
    "dijit/_Container",
    "citrix/common/_CitrixWidgetMixin",
    // Used in code
    "citrix/sync-wui/StoreGrid",
    // Used in template
    "citrix/sync-wui/Button",
    "citrix/common/ValidationTextBox",
    "citrix/common/Select",
    "citrix/sync-wui/ComboButton"
],
function(dojo, declare, array, aspect, string, nls, template, _widget, _templated, _container, _citrixWidgetMixin, storeGrid) {
return declare("citrix.sync-wui.GridTemplate", [_widget, _templated, _container, _citrixWidgetMixin], {

    templateString: template,
    widgetsInTemplate: true,
    grid: null,
    _selectedData: null,

    getGridProperties: function() {
        return {};
    },

    postMixInProperties: function() {
        this.inherited(arguments);
        dojo.mixin(this, nls);
    },

    postCreate: function() {
        this.inherited(arguments);
        this.grid = new storeGrid(this.getGridProperties());
        this.addChild(this.grid);
        this.grid.deselectOnRefresh = false;
        this._selectedData = {};
        this.grid.on("dgrid-select", dojo.hitch(this, function(event) {
            array.forEach(event.rows, function(row) {
                this._selectedData[row.id] = row.data;
            }, this);
        }));
        this.grid.on("dgrid-deselect", dojo.hitch(this, function(event){
            array.forEach(event.rows, function(row) {
                delete this._selectedData[row.id];
            }, this);
        }));
        this.grid.selectAll = dojo.hitch(this, this.selectAll);
        aspect.before(this.grid, "clearSelection", dojo.hitch(this, this.clearSelection));
    },

    resize: function() {
        // for some reason grid.resize is needed before and after base resize (just 1 will result in incorrect settings),
        // otherwise table header layout is screwed up
        this.grid.resize();
        this.inherited(arguments);
        this.grid.resize();
    },

    startup: function() {
        this.inherited(arguments);
        this.grid.startup();
    },

    _bindDijit: function(retainPosition, onFinish) {
        this.grid._bindDijit(retainPosition, onFinish);
    },

    _bindDijitRetainPosition: function() {
        this._bindDijit(true, dojo.hitch(this, this._bindDijitRetainPositionFinish));
    },

    _bindDijitRetainPositionFinish: function() {

    },

    _onSearch: function(event) {
        this.grid.set("filterParam", string.trim(this.filterNode.get("value")));
        this.grid.query = this.query;
    },

    _onClear: function(event) {
        this.grid.set("filterParam", "");
        this.grid.query = this.query;
        this.filterNode.set("value", "");
    },

    _onShowSelected: function(event) {
        this.grid.set("filterParam", "");
        this.grid.query = dojo.hitch(this, function(item, index, items) {
            return this._selectedData[item[this.grid.idProperty]];
        });
    },

    _onSelectNone: function(event) {
        this.grid.clearSelection();
    },

    _onSelectAll: function(event) {
        this.grid.selectAll();
    },

    clearSelection: function(exceptId, dontResetLastSelected){
        for(var id in this._selectedData) {
            if(this._selectedData.hasOwnProperty(id) && exceptId !== id) {
                delete this._selectedData[id];
            }
        }
    },
    selectAll: function(){
        // this is so that only those rows that are part of the current filter are selected, and when the filter changes
        // the grid doesn't continue to select all
        this.grid.allSelected = false;

        var data = this.grid.store.query(this.grid.query);
        array.forEach(data, function(item) {
            this.grid.select(item[this.grid.idProperty]);
            this._selectedData[item[this.grid.idProperty]] = item;
        }, this);
    }
});
});
