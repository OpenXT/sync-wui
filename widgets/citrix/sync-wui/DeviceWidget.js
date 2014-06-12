/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/_base/event",
    "dojo/date/locale",
    "dojo/aspect",
    "dojo/query",
    "dijit/registry",
    // Resources
    "dojo/i18n!./nls/DeviceWidget",
    "dojo/text!./templates/DeviceWidget.html",
    // Mixins
    "citrix/sync-wui/DeviceGrid",
    "citrix/common/_RouterMixin",
    // Used in code
    "citrix/common/Grid",
    "put-selector/put",
    "citrix/sync-wui/DeviceExpando",
    "citrix/sync-wui/Settings",
    "citrix/sync-wui/Button",
    "citrix/sync-wui/ImageButton",
    "citrix/sync-wui/GridDialog",
    // Used in template
    "citrix/sync-wui/RepoGrid",
    "citrix/common/Select"
],
function(dojo, declare, lang, array, event, localeDate, aspect, query, registry, nls, template, deviceGrid, _routerMixin, grid, put, deviceExpando, settings, button, imageButton, gridDialog) {
return declare("citrix.sync-wui.DeviceWidget", [deviceGrid, _routerMixin], {

    templateString: template,
    expandedNode: null,
    expandedId: null,
    routerBase: "computers",

    getGridProperties: function() {
        var props = this.inherited(arguments);

        props.columns.unshift({
            label: " ",
            className: "expandoButtonCell",
            renderCell: dojo.hitch(this, function(object, value, node, options) {
                var button = new imageButton({label: nls.EXPAND, showLabel: false, iconClass: "expandoIcon"});
                button.onClick = dojo.hitch(this, function() {
                    this._expandNode(this.grid.row(object).element);
                });
                node.appendChild(button.domNode);
            })
        });

        props.columns.push({
            label: nls.REPORT_TIME,
            field: "report_time",
            formatter: function(value) {
                if(value != null) {
                    value = localeDate.format(new Date(value));
                } else {
                    value = "";
                }
                return value;
            }
        });

        props.columns.push({
            label: nls.ACTIONS,
            field: "actions",
            sortable: false,
            renderCell: dojo.hitch(this, function(object, value, node, options) {
                var dupeButton = new button({label: nls.DUPLICATE_DEVICE});
                dupeButton.onClick = dojo.hitch(this, function(e) {
                    this._onDuplicateDevice(object.device_uuid);
                    event.stop(e);
                });
                node.appendChild(dupeButton.domNode);
            })
        });

        props.renderRow = dojo.hitch(this, function(obj, options) {
            var div = put("div.collapsed", grid.prototype.renderRow.apply(this.grid, arguments));
            var widget = new deviceExpando({device_uuid: obj.device_uuid, onRouting: dojo.hitch(this, this.route)});
            put(div, "div.expando", widget.domNode);
            widget.startup();
            if(obj.device_uuid == this.expandedId) {
                this._expandNode(div, true, obj.device_uuid);
                this.grid.select(obj.device_uuid);
            }
            return div;
        });

        props.removeRow = function(rowElement, justCleanup) {
            var expandoDiv = rowElement.children && rowElement.children.length == 2 ? rowElement.children[1] : null;
            var widgetDiv = expandoDiv && expandoDiv.children.length == 1 ? expandoDiv.children[0] : null;
            if(widgetDiv) {
                registry.byNode(widgetDiv).destroyRecursive();
            }
            this.inherited(arguments);
        };

        return props;
    },

    postMixInProperties: function() {
        this.inherited(arguments);
        dojo.mixin(this, nls);
    },

    postCreate: function() {
        this.inherited(arguments);

        this.grid.on("dgrid-select, dgrid-deselect", dojo.hitch(this, this._updateButtons));
        this._updateButtons();
    },

    _expandNode: function(node, rendering, device_uuid) {
        if(!node) {return;}
        var collapsed = node.className.indexOf("collapsed") >= 0;

        var expandoContent = dijit.byNode(query(".expandoContent", node)[0]);

        // if clicked row wasn't expanded, collapse any previously-expanded row
        if(collapsed && this.expandedNode && !rendering) {
            put(this.expandedNode, ".collapsed");
            dijit.byNode(query(".expandoContent", this.expandedNode)[0]).collapse();
        }

        expandoContent.expand();

        // toggle state of node which was clicked
        put(node, (collapsed ? "!" : ".") + "collapsed");

        // if the row clicked was previously expanded, nothing is expanded now
        this.expandedNode = collapsed ? node : null;
        this.expandedId = collapsed ? (!rendering ? this.grid.row(node).id : device_uuid) : null;

        this._updateButtons();
    },

    _onAddDevice: function(event) {
        new settings({isNew: true}).show();
    },

    _onEditDevices: function() {
        this._editDevices(false);
    },

    _onEditDevicesFromTemplate: function() {
        this._editDevices(true);
    },

    _editDevices: function(fromExisting) {
        var device_uuids = [];
        for(var rowid in this._selectedData) {
            device_uuids.push(this._selectedData[rowid].device_uuid);
        }
        if(device_uuids.length == 0) {
            return;
        }
        var result = function(data) {
            var device_uuid;
            if(data && data.length == 1) {
                device_uuid = data[0].device_uuid;
            }
            new settings({isNew: true, isDuplicate: fromExisting && device_uuid, isSaveToDevices: true, device_uuid: device_uuid, device_uuid_array: device_uuids}).show();
        }
        if(fromExisting) {
            new gridDialog({ gridTemplateName: "citrix.sync-wui.DeviceGrid", finishFn: result, selectionMode: "single", title: nls.SELECT_DEVICE_TITLE }).show();
        } else {
            result();
        }
    },

    _onRemove: function() {
        var device_uuids = [];
        for(var rowid in this._selectedData) {
            device_uuids.push(this._selectedData[rowid].device_uuid);
        }
        if(device_uuids.length == 0) {
            return;
        }
        XenClient.Utils.messageBox.showConfirmation(nls.REMOVE_DEVICE_WARNING, dojo.hitch(this, function() {
            var wait = new XUtils.AsyncWait(dojo.hitch(this, function() {
                this.grid.clearSelection();
                XUtils.publish("devices_removed", device_uuids);
            }));
            array.forEach(device_uuids, function(id) {
                var success = wait.addCallback();
                socket.data_access("remove_device", {device_uuid: id, cascade: true}, success, success);
            }, this);
            wait.finish();
        }), { continueText: "REMOVE_ACTION" });
    },

    _onAssignRepo: function() {
        var device_uuids = [];
        for(var rowid in this._selectedData) {
            device_uuids.push(this._selectedData[rowid].device_uuid);
        }
        if(device_uuids.length == 0) {
            return;
        }

        var result = dojo.hitch(this, function(data) {
            if(data.length == 0) {
                return;
            }
            array.forEach(device_uuids, function(id) {
                socket.data_access("modify_device_repo", {device_uuid: id, repo_uuid: data[0].repo_uuid});
            }, this);
        });
        new gridDialog({ gridTemplateName: "citrix.sync-wui.RepoGrid", finishFn: result, selectionMode: "single", title: nls.SELECT_REPO_TITLE }).show();
    },

    _onAssignServices: function() {
        this._assignVMs(false);
    },

    _onAssignVMs: function() {
        this._assignVMs(true);
    },

    _assignVMs: function(userVm) {
        if(Object.keys(this._selectedData).length == 0) {
            return;
        }
        var result = dojo.hitch(this, function(data) {
            if(data.length == 0) {
                return;
            }
            var wait = new XUtils.AsyncWait(function() {
                XUtils.publish("vm_instances_assigned");
            });
            for(var device_uuid in this._selectedData) {
                array.forEach(data, function(item) {
                    var success = wait.addCallback();
                    socket.data_access("add_vm_instance", {device_uuid: device_uuid, vm_uuid: item.vm_uuid, vm_instance_name: item.vm_name}, success,
                        dojo.hitch(this, function(error) {
                            if(error.code == "20060") {
                                // need to readd vm instance instead of add
                                // first need to get existing instance id
                                socket.data_access("list_vm_instances", {vm_instance_name: "", device_uuid: device_uuid, vm_uuid: "", disk_uuid: "", removed: true}, function(vmInstances) {
                                    array.some(vmInstances, function(instance, i) {
                                        if(instance.vm_uuid == item.vm_uuid) {
                                            socket.data_access("readd_vm_instance", {vm_instance_uuid: instance.vm_instance_uuid}, success, success);
                                            return true;
                                        }
                                    });
                                }, success);
                            } else if(success) {
                                success();
                            }
                        })
                    );
                });
            };
            wait.finish();
        });
        new gridDialog({ gridTemplateName: userVm ? "citrix.sync-wui.VMGrid" : "citrix.sync-wui.ServiceVMGrid", finishFn: result, selectionMode: "multiple", title: userVm ? nls.SELECT_VMS_TO_ASSIGN : nls.SELECT_SERVICES_TO_ASSIGN }).show();
    },

    _onLockAllInstances: function() {
        this._instanceAction(true, "lock");
    },

    _onLockSelectedInstances: function() {
        this._instanceAction(false, "lock");
    },

    _onUnlockAllInstances: function() {
        this._instanceAction(true, "unlock");
    },

    _onunlockSelectedInstances: function() {
        this._instanceAction(false, "unlock");
    },

    _onRemoveAllInstances: function() {
        this._instanceAction(true, "remove");
    },

    _onRemoveSelectedInstances: function() {
        this._instanceAction(false, "remove");
    },

    _onRemoveAllServiceInstances: function() {
        this._instanceAction(true, "remove", true);
    },

    _onRemoveSelectedServiceInstances: function() {
        this._instanceAction(false, "remove", true);
    },

    _instanceAction: function(all, action, services) {
        // do "action" on vm instances on selected devices.
        // boolean all: true = all vm instances, false = instances of selected vms
        // string action: "remove", "lock" or "unlock"

        if(Object.keys(this._selectedData).length == 0) {
            return;
        }
        // result needs to know what VM instances we are actioning - an array of vm_instance_uuids
        var result = dojo.hitch(this, function(data) {
            if(data.length == 0) {
                return;
            }
            var wait = new XUtils.AsyncWait(function() {
                XUtils.publish("vm_instances_" + (action + (action.endsWith("e") ? "d" : "ed")), data);
            });
            array.forEach(data, function(item) {
                var waitCb = wait.addCallback();
                socket.data_access(action + "_vm_instance", {vm_instance_uuid: item}, waitCb, waitCb);
            });
            wait.finish();
        });
        var vm_instance_uuids = [];
        var vm_uuids = [];
        var getInstanceIds = dojo.hitch(this, function() {
            var wait = new XUtils.AsyncWait(function() {
                result(vm_instance_uuids);
            });
            for(var device_uuid in this._selectedData) {
                var waitCb = wait.addCallback();
                socket.data_access("list_vm_insts_for_device_ui",
                    {device_uuid: device_uuid, config: ["vm:type", "vm:image-path"]},
                    function(listData) {
                        array.forEach(listData, function(item) {
                            if((all || vm_uuids.contains(item.vm_uuid)) && ["svm", "pvm", null].contains(item.config_value_1)) {
                                vm_instance_uuids.push(item.vm_instance_uuid);
                            }
                        });
                        waitCb();
                    }, waitCb
                );
            };
            wait.finish();
        });
        if(all) {
            getInstanceIds();
        } else {
            // need to select a vm whose instances we want to lock, and pass them to result
            var vmResults = function(data) {
                array.forEach(data, function(item) {
                    vm_uuids.push(item.vm_uuid);
                });
                getInstanceIds();
            };
            new gridDialog({ gridTemplateName: "citrix.sync-wui.VMGrid", finishFn: vmResults, selectionMode: "multiple", title: nls.SELECT_TITLE_LOCK_VMS }).show();
        }
    },

    _bindDijit: function() {
        this.inherited(arguments);
        this._updateButtons();
    },

    _bindDijitRetainPosition: function(args) {
        this._retainPositionArgs = args;
        this.inherited(arguments);
    },

    _bindDijitRetainPositionFinish: function() {
        if(this.expandedId) {
            var id = this.expandedId;
            if(this.grid.row(id).data) {
                this.grid.select(id);
            } else if(this._retainPositionArgs) {
                this.grid.select(id = this._retainPositionArgs.device_uuid);
            }
            this.expandedId = id;
            var node = this.grid.row(id).element;
            if(node) {
                this._expandNode(node);
            }
        }
        delete this._retainPositionArgs;
        this._updateButtons();
    },

    _updateButtons: function() {
        this._setEnabled(this.actionButton, Object.keys(this._selectedData).length > 0);
    },

    onRoute: function(value) {
        var popup = new settings({device_uuid: value});
        var handle = aspect.after(popup, "onHide", dojo.hitch(this, function() {
            this.route("");
            handle.remove();
        }));
        popup.show();
    },

    _onDuplicateDevice: function(device_uuid) {
        new settings({isNew: true, isDuplicate: true, device_uuid: device_uuid}).show();
    }
});
});
