/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    "dojo/string",
    "dojo/aspect",
    "dojo/_base/array",
    // Resources
    "dojo/i18n!./nls/VMWidget",
    "dojo/text!./templates/VMWidget.html",
    // Mixins
    "citrix/sync-wui/VMGrid",
    "citrix/common/_RouterMixin",
    // Used in code
    "citrix/sync-wui/VMDetails",
    "citrix/sync-wui/Button",
    "citrix/sync-wui/GridDialog"
],
function (dojo, declare, string, aspect, array, nls, template, vmGrid, _routerMixin, vmDetails, button, gridDialog) {
return declare("citrix.sync-wui.VMWidget", [vmGrid, _routerMixin], {

    templateString: template,
    routerBase: "uservms",
    vm_type: "svm",
    popup: null,

    getGridProperties: function() {
        var props = this.inherited(arguments);
        var self = this;

        props.columns.num_vm_instances = nls.NUM_VM_INSTANCES;

        props.columns.actions = {
            label: nls.ACTIONS,
            sortable: false,
            renderCell: function(object, value, node, options) {
                var assignButton = new button({label: nls.ASSIGN_VM});
                assignButton.onClick = function() {
                    self.onAssign(object[props.idProperty], object.vm_name);
                };
                var detailsButton = new button({label: nls.VIEW_VM});
                detailsButton.onClick = function() {
                    self.route(object[props.idProperty]);
                };
                var dupeButton = new button({label: nls.DUPLICATE_VM});
                dupeButton.onClick = function() {
                    self._onDuplicateVM(object[props.idProperty]);
                };
                node.appendChild(assignButton.domNode);
                node.appendChild(detailsButton.domNode);
                node.appendChild(dupeButton.domNode);
            }
        };

        return props;
    },

    postMixInProperties: function() {
        this.inherited(arguments);
        dojo.mixin(this, nls);
    },

    postCreate: function() {
        this.inherited(arguments);

        this.grid.on(".dgrid-content .dgrid-cell:click", dojo.hitch(this, this._updateButtons));
        this._updateButtons();
    },

    onAssign: function(uuid, name) {
        var result = dojo.hitch(this, function(data) {
            var finish = dojo.hitch(this, function() {
                XUtils.publish("vm_instances_assigned");
            });
            var wait = new XenClient.Utils.AsyncWait(finish);
            var getData = function(device_uuid, vm_uuid, name, success) {
                socket.data_access("add_vm_instance", { device_uuid: device_uuid, vm_uuid: vm_uuid, vm_instance_name: name }, success,
                    dojo.hitch(this, function(error) {
                        if(error.code == "20060") {
                            // need to readd vm instance instead of add
                            // first need to get existing instance id
                            socket.data_access("list_vm_instances", {vm_instance_name: "", device_uuid: device_uuid, vm_uuid: "", disk_uuid: "", removed: true}, function(data) {
                                array.some(data, function(item, i) {
                                    if(item.vm_uuid == vm_uuid) {
                                        socket.data_access("readd_vm_instance", {vm_instance_uuid: item.vm_instance_uuid}, success);
                                        return true;
                                    }
                                });
                            });
                        }
                    })
                );
            };
            dojo.forEach(data, function(device) {
                getData(device.device_uuid, uuid, name, wait.addCallback());
            }, this);
            wait.finish();
        });
        new gridDialog({ gridTemplateName: "citrix.sync-wui.DeviceGrid", finishFn: result, selectionMode: "multiple", title: nls.SELECT_DEVICE_TITLE }).show();
    },

    onRoute: function(uuid) {
        this._openVM({ vm_uuid: uuid });
    },

    _onAddVM: function(event) {
        this._openVM({ isNew: true, vm_type: this.vm_type });
    },

    _onDuplicateVM: function(uuid) {
        this._openVM({ vm_uuid: uuid, isDuplicate: true });
    },

    _openVM: function(props) {
        if (this.popup) {
            this.popup.hide();
        }
        this.popup = new vmDetails(props);
        var handle = aspect.after(this.popup, "onHide", dojo.hitch(this, function() {
            this.route("");
            handle.remove();
        }));
        this.popup.show();
    },

    _onRemoveVM: function(event) {
        XenClient.Utils.messageBox.showConfirmation(this.routerbase == "servicevms" ? nls.REMOVE_SERVICE_WARNING : nls.REMOVE_VM_WARNING, dojo.hitch(this, function() {
            var wait = new XUtils.AsyncWait(dojo.hitch(this, function() {
                this.grid.clearSelection();
                XUtils.publish("vms_removed");
            }));
            for(var vm_uuid in this._selectedData) {
                var success = wait.addCallback();
                socket.data_access("remove_vm", { vm_uuid: vm_uuid, cascade: true }, success, success);
            }
            wait.finish();
        }), { continueText: "REMOVE_ACTION" });

        var row = this.grid.row(Object.keys(this.grid.selection)[0]);
        var vm_uuid = row.data.vm_uuid;
    },

    _bindDijit: function() {
        this.inherited(arguments);
        this._updateButtons();
    },

    _updateButtons: function() {
        this._setEnabled(".vmButton", Object.keys(this.grid.selection).length > 0);
    },

    _bindDijitRetainPositionFinish: function() {
        this._updateButtons();
    }
});
});