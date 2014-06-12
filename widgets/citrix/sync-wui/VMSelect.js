/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/array",
    // Resources
    "dojo/i18n!./nls/DeviceWidget",
    "dojo/text!./templates/VMSelect.html",
    // Mixins
    "dijit/_Contained",
    "citrix/common/_TopicMixin",
    "citrix/common/ImageSelect",
    "citrix/sync-wui/_StoreMixin",
    "citrix/common/_CitrixWidgetMixin",
    // Used in code
    "citrix/sync-wui/VMItem",
    "citrix/sync-wui/GridDialog",
    // Used in template
    "citrix/sync-wui/Button"
],
function(dojo, declare, array, nls, template, _contained, _topicMixin, imageSelect, _storeMixin, _citrixWidgetMixin, vmItem, gridDialog) {
return declare("citrix.sync-wui.VMSelect", [_contained, imageSelect, _storeMixin, _citrixWidgetMixin, _topicMixin], {

    templateString: template,
    widgetsInTemplate: true,

    imageWidget: vmItem,
    valueProperty: "vm_instance_uuid",

    userVMs: true,
    device_uuid: "",
    dataFunction: "list_vm_insts_for_device_ui",
    idProperty: "vm_instance_uuid",

    constructor: function(args) {
        this.device_uuid = args.device_uuid;
        this.dataParams = {
            device_uuid: this.device_uuid,
            config: ["vm:type", "vm:image-path"]
        };
    },

    postMixInProperties: function() {
        dojo.mixin(this, nls);
        this.VM_SELECT_TITLE = this.userVMs ? nls.VM_SELECT_TITLE_USER : nls.VM_SELECT_TITLE_SERVICE;
    },

    postCreate: function() {
        this.inherited(arguments);
        this.subscribe(XUtils.publishTopic, dojo.hitch(this, this._messageHandler));
    },

    _messageHandler: function(message) {
        if(!this.getParent().isVisible) {
            // no need to update if we're not visible, and when the parent expands us, it instructs us to getData anyway
            return;
        }
        switch(message.type) {
            case "vms_removed":
            case "vm_instances_assigned":
                this.getData();
                break;
            case "vm_instances_locked":
            case "vm_instances_unlocked":
            case "vm_instances_removed":
                array.some(this.getChildren(), function(widget) {
                    if (message.data && message.data.contains(widget.vm_instance_uuid)) {
                        this.getData();
                        return true;
                    }
                }, this);
                break;
        }
    },

    _setStoreData: function(data) {
        this.store.data = array.filter(data, function(item) {
            return ["svm", "pvm", null].contains(item.config_value_1) == this.userVMs;
        }, this);
        this.refresh();
    },

    refresh: function() {
        this.set("editing", true);
        this.set("source", this.store.data);
    },

    _updateWidgets: function() {
        var child = this.findChild();
        this._setEnabled(this.RemoveButton, this.value);
        this._setEnabled(this.LockButton, this.value);
        this.LockButton.set("label", child && child.locked ? nls.UNLOCK_BUTTON : nls.LOCK_BUTTON);
    },

    _updateChildren: function() {
        if (this.source != null && this.source) {
            var baseClass = (this.itemClassSmall != "" && this.source.length > this.classThreshold) ? this.itemClassSmall : this.itemClass;
            array.forEach(this.source, function(srcItem) {
                if (!array.some(this.getChildren(), function(item) { return srcItem.vm_instance_uuid == item.vm_instance_uuid; })) {
                    // doesn't exist in the children already, so add
                    var widget = new this.imageWidget({
                        vm_instance_uuid: srcItem.vm_instance_uuid,
                        vm_instance_name: srcItem.vm_instance_name,
                        image: XenClient.Utils.VmIcons[srcItem.config_value_2],
                        locked: srcItem.locked == "t",
                        baseClass: baseClass
                    });
                    this.addChild(widget);
                    widget.startup();
                }
            }, this);
        }
        array.forEach(this.getChildren(), function(item) {
            if(array.some(this.source, function(dataItem) {
                var match = dataItem.vm_instance_uuid == item.vm_instance_uuid;
                if(match) {
                    item.set("locked", dataItem.locked == "t");
                }
                return match;
            })) {
                item.set("selected", (item.vm_instance_uuid == this.value));
                item.set("disabled", !this.editing);
            } else {
                if(item.vm_instance_uuid == this.value) {
                    this._handleOnChange("");
                    this.value = "";
                }
                this.removeChild(item);
                item.destroyRecursive();
            }
        }, this);
        this._updateWidgets();
    },

    _onAddClick: function(event) {
        var result = dojo.hitch(this, function(data) {
            var wait = new XenClient.Utils.AsyncWait(dojo.hitch(this, this._bindDijit));
            var getData = function(device_uuid, vm_uuid, name, success) {
                socket.data_access("add_vm_instance", {device_uuid: device_uuid, vm_uuid: vm_uuid, vm_instance_name: name}, success,
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
                            }, success);
                        } else if(success) {
                            success();
                        }
                    })
                );
            }
            array.forEach(data, function(item, i) {
                getData(this.device_uuid, item.vm_uuid, item.vm_name, wait.addCallback());
            }, this);
            wait.finish();
        });
        new gridDialog({ gridTemplateName: this.userVMs ? "citrix.sync-wui.VMGrid" : "citrix.sync-wui.ServiceVMGrid", finishFn: result, selectionMode: "multiple", title: this.userVMs? nls.SELECT_VM_TITLE : nls.SELECT_SERVICE_TITLE }).show();
    },

    _onRemoveClick: function(event) {
        XenClient.Utils.messageBox.showConfirmation(nls.REMOVE_VM_INSTANCE_WARNING, dojo.hitch(this, function() {
            socket.data_access("remove_vm_instance", {vm_instance_uuid: this.value}, dojo.hitch(this, function(data) {
                this._bindDijit();
            }));
        }), { continueText: "REMOVE_ACTION" });
    },

    _onLockClick: function(event) {
        var child = this.findChild();
        if(child) {
            socket.data_access((child.locked ? "unlock" : "lock") + "_vm_instance", {vm_instance_uuid: this.value}, dojo.hitch(this, function(data) {
                this._bindDijit();
            }));
        }
    }
});
});