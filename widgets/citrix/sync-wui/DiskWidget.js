/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    "dojo/string",
    // Resources
    "dojo/i18n!./nls/DiskWidget",
    "dojo/text!./templates/DiskWidget.html",
    // Mixins
    "citrix/sync-wui/DiskGrid",
    // Used in code
    "citrix/sync-wui/AddDisk",
    // Used in template
    "citrix/sync-wui/Button"    
],
function (dojo, declare, string, nls, template, diskGrid, addDisk) {
return declare("citrix.sync-wui.DiskWidget", diskGrid, {

    templateString: template,
    popup: null,

    getGridProperties: function() {
        var props = this.inherited(arguments);

        props.columns.shared = {
            label: nls.SHARED,
            formatter: function(shared) {
                return (shared == "t") ? nls.TRUE : (shared == "f") ? nls.FALSE : shared;
            }
        };

        props.columns.num_vms = nls.NUM_VMS;

        return props;
    },    

    postMixInProperties: function() {
        this.inherited(arguments);
        dojo.mixin(this, nls);
    },

    postCreate: function() {
        this.inherited(arguments);
        this.grid.on(".dgrid-row:click", dojo.hitch(this, this._updateButtons));
        this._updateButtons();
    },

    _onAddDisk: function(event) {
        if (this.popup) {
            this.popup.hide();
        }
        this.popup = new addDisk();
        this.popup.show();
    },

    _onRemoveDisk: function(event) {
        var row = this.grid.row(Object.keys(this.grid.selection)[0]);
        var disk_uuid = row.data.disk_uuid;
        XenClient.Utils.messageBox.showConfirmation(nls.REMOVE_DISK_WARNING, dojo.hitch(this, function() {
            socket.data_access("remove_disk", { disk_uuid: disk_uuid }, dojo.hitch(this, function(data) {
                this._bindDijit();
            }));
        }), { continueText: "REMOVE_ACTION" });
    },

    _bindDijit: function() {
        this.inherited(arguments);
        this._updateButtons();
    },

    _updateButtons: function(event) {
        var selection = this.grid.selection;
        if (event && Object.keys(this.grid.selection).length == 1) {
            if (this.grid.row(event).data.num_vms == 0) {
                this._setEnabled(".diskButton", true);
                return;
            }
        }

        this._setEnabled(".diskButton", false);
    }
});
});
