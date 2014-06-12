/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/query",
    "dojo/NodeList-traverse",    
    "dojo/string",
    "dojo/router",
    // Resources
    "dojo/i18n!./nls/VMDetails",
    "dojo/text!./templates/VMDetails.html",
    // Mixins
    "citrix/common/ValidationDialog",
    "citrix/common/_BoundContainerMixin",
    "citrix/common/_EditableMixin",
    "citrix/common/_CitrixTooltipMixin",
    "citrix/sync-wui/_ConfigMixin",
    "citrix/sync-wui/_ModelMixin",
    // Used in code
    "citrix/sync-wui/GridDialog",
    // Required in template
    "citrix/common/TabContainer",
    "citrix/common/ContentPane",
    "citrix/sync-wui/ImageSelect",
    "citrix/sync-wui/Button",
    "citrix/common/NumberTextBox",
    "citrix/common/ValidationTextBox",
    "citrix/common/ValidationTextarea",
    "citrix/common/Label",
    "citrix/common/Select",
    "citrix/sync-wui/BooleanSelect",
    "citrix/common/Repeater",
    "citrix/common/BoundWidget",
    "citrix/common/EditableWidget",
    "citrix/common/asmSelect"
],
function(dojo, declare, array, lang, query, traverse, string, router, nls, template, dialog, _boundContainerMixin, _editableMixin, _citrixTooltipMixin, _configMixin, _modelMixin, gridDialog) {
return declare("citrix.sync-wui.VMDetails", [dialog, _boundContainerMixin, _editableMixin, _citrixTooltipMixin, _configMixin, _modelMixin], {

	templateString: template,
    widgetsInTemplate: true,
    destroyOnHide: true,
    isNew: false,
    isDuplicate: false,

    constructor: function(args) {
        this.isNew = args.isNew;
        this.isDuplicate = args.isDuplicate;
        this.vm_uuid = args.vm_uuid;
        this.vm_type = args.vm_type || "";
        this._setDataFunctions();
    },

    postMixInProperties: function() {
        this.inherited(arguments);
        dojo.mixin(this, nls);
    },

    postCreate: function() {
        this.inherited(arguments);
        this.startup();
        
        if (this.isNew || this.isDuplicate) {
            var options = dojo.map(new Array(9), function(key, index) {
                index += 1;
                var label = this.SWITCHER_KEY_MASK.format(index);
                return { label: label, value: index };
            }, this);
            options.unshift({ label: this.NOT_INCLUDED, value: '' });

            this.slotSelect.set("options", options);
            this.connect(this.image_path, "setSelected", "_onVmIconSelect");

            this.edit();
        }

        if (this.isNew) {
            // this creates a set of default bindings which are not undefined, as that causes issues when controlling the save button
            var bindings = this.unbind(this.tabContainer.containerNode);
            bindings.config.vm.type = this.vm_type;

            if (this._isUserVM()) {
                bindings.config.vm.cd = "xc-tools.iso";
                bindings.config.vm.boot = ["d", "c"];
            }

            dojo.mixin(this, bindings);
            this._setCustomsArray();
            this.model.disks = [];
            this._bindDijit();
        }
    },

    getDisks: function() {
        this.model.disks = []
    
        if(this.vm_uuid) {
            socket.data_access("list_disks", {
                disk_name: "",
                disk_type: "",
                file_path: "",
                file_hash: "",
                vm_uuid: this.vm_uuid,
                vm_instance_uuid: "",
                unused: false
            }, dojo.hitch(this, function(data) {
                if(data) {
                    this.model.disks = data;
                }
                this._bindDijit();
            }));
        }
    },

    getDataFinishFn: function() {
        if (this.isDuplicate) {
            this.model.vm_uuid = '';
            this.saveButton.set("disabled", false);
        }
        if (this.config.vm && this.config.vm.boot) {
        	this.config.vm.boot = this.config.vm.boot.split("");
        }
        this.getDisks();
    },

    edit: function() {
        this.inherited(arguments);
        this._descendantAction("edit");
        this._updateButtons();
    },

    cancel: function() {
        this.inherited(arguments);
        this._updateButtons();
        this._descendantAction("cancel");
    },

    save: function() {
        this.inherited(arguments);
        var values = this.unbind(this.tabContainer.containerNode);

        if (values.config._customs) {
            array.forEach(values.config._customs, function(item, i) {
                lang.setObject(item.id, item.value, values.config);
            }, this);
        }
        delete values.config._customs; // important otherwise you'll get config lines with daemon = "_custom"

        array.forEach(this.networkArray, function(item, i) {
            lang.setObject(item.id, item.value, values.config);
        }, this);

        this.saveParams.vm_name = values.model.vm_name;

        dojo.forEach(values.model.disks, function(disk) {
            this.saveParams.disk_uuids.push(disk.disk_uuid);
        }, this);

        this.saveParams.config = this._formatConfigObjectsIntoStringList(values.config);
        var finish = dojo.hitch(this, function(data) {
            this.isNew = false;
            this.isDuplicate = false;
            this.vm_uuid = data;
            this._setDataFunctions();
            this.getConfigData();
            this.cancel();
        });
        this.saveData(finish);
    },

    onAddConfig: function(event) {
        var daemon = string.trim(this.newConfigDaemon.get("value"));
        var property = string.trim(this.newConfigProperty.get("value"));
        var value = string.trim(this.newConfigValue.get("value"));
        if(daemon != "" && property != "" && value != "") {
            lang.setObject("config." + daemon + "." + property, value, this);
            this._setCustomsArray();
            this.customRepeater.set("value", this.config._customs);
            this._setEnabled(this.saveButton, true);
            this.newConfigDaemon.set("value", "");
            this.newConfigProperty.set("value", "");
            this.newConfigValue.set("value", "");
            this._enableAddConfigButton();
        }
    },

    onDeleteConfig: function(event) {
        var templateNode = query.NodeList(event.target).parents("tr").first()[0];
        var daemon = templateNode.getAttribute("daemon");
        var property = templateNode.getAttribute("property");
        var o = lang.getObject("config." + daemon + "." + property, false, this);
        if(o !== undefined) {
            this.config[daemon][property] = "";
            this._setCustomsArray();
            this.customRepeater.set("value", this.config._customs);
            this._setEnabled(this.saveButton, true);
        }
    },

    onCustomConfigKeyUp: function(event) {
        this._enableAddConfigButton();
    },

    _setNetworkArray: function() {
        this.networkArray = [];
        array.forEach(Object.keys(this.config), function(daemon) {
            if(!daemon.startsWith("nic/")) {
                return;
            }
            array.forEach(Object.keys(this.config[daemon]), function(property) {
                this.networkArray.push({
                    id: daemon + "." + property,
                    daemon: daemon,
                    property: property,
                    value: this.config[daemon][property],
                    className: this.config[daemon][property] == "" ? "removedConfig" : ""
                });
            }, this);
        }, this);
    },

    onAddNetwork: function(event) {
        var daemon = "nic/" + string.trim(this.newNetwork.get("value"));
        var property = string.trim(this.newNetworkProperty.get("value"));
        var bool = ["wireless-driver", "enabled"].contains(property);
        var value = ["wireless-driver", "enabled"].contains(property) ? string.trim(this.newBoolNetworkValue.get("value")) : string.trim(this.newNetworkValue.get("value"));
        if(daemon != "" && property != "" && value != "") {
            lang.setObject("config." + daemon + "." + property, value, this);
            this._setNetworkArray();
            this.networkRepeater.set("value", this.networkArray);
            this._setEnabled(this.saveButton, true);
            this.newNetwork.set("value", "");
            this.newNetworkProperty.set("value", "");
            this.newNetworkValue.set("value", "");
            this.newBoolNetworkValue.set("value", "");
            this._enableAddNetworkButton();
        }
    },

    onDeleteNetwork: function(event) {
        var templateNode = query.NodeList(event.target).parents("tr").first()[0];
        var daemon = templateNode.getAttribute("daemon");
        var property = templateNode.getAttribute("property");
        var o = lang.getObject("config." + daemon + "." + property, false, this);
        if(o !== undefined) {
            this.config[daemon][property] = "";
            this._setNetworkArray();
            this.networkRepeater.set("value", this.networkArray);
            this._setEnabled(this.saveButton, true);
        }
    },

    onNetworkKeyUp: function(event) {
        this._enableAddNetworkButton();
    },

    onNewNetworkPropertyChange: function(newVal) {
        var bool = ["wireless-driver", "enabled"].contains(newVal);
        this._setDisplay(this.newNetworkValue, !bool);
        this._setDisplay(this.newBoolNetworkValue, bool);
        this.newNetworkValue.set("value", "");
        this.newBoolNetworkValue.set("value", "");
        this._enableAddNetworkButton();
    },

    onDiskAdd: function() {
        var result = dojo.hitch(this, function(data) {
            if(data.length > 0) {
                dojo.forEach(data, function(disk) {
                    var exists = false;
                    dojo.some(this.model.disks, function(currentDisk) {
                        if (currentDisk.disk_uuid == disk.disk_uuid) {
                            exists = true;
                            return true;
                        }
                        return false;
                    }, this);

                    if (!exists) {
                        this.model.disks.unshift(disk);
                    }
                }, this);
                this.diskRepeater.set("value", this.model.disks);
            }
        });
        new gridDialog({ gridTemplateName: "citrix.sync-wui.DiskGrid", finishFn: result, selectionMode: "multiple", title: nls.SELECT_DISK_TITLE }).show();
    },

    onDiskDelete: function(event) {
        var disk_uuid = this._getDeviceID(event.target);
        dojo.some(this.model.disks, function(disk, i) {
            if (disk.disk_uuid == disk_uuid) {
                this.model.disks.splice(i, 1);
                this.diskRepeater.set("value", this.model.disks);
                return true;
            }
            return false;
        }, this);
    },

    _getDeviceID: function(node) {
        return new dojo.NodeList(node).parents("tr").first()[0].getAttribute("deviceId");
    },

    _enableAddConfigButton: function() {
        this._setEnabled(this.ConfigAddButton, !(this.newConfigDaemon.get("value") == "" || this.newConfigProperty.get("value") == "" || this.newConfigValue.get("value") == ""));
    },

    _enableAddNetworkButton: function() {
        this._setEnabled(this.NetworkAddButton, !(this.newNetwork.get("value") == "" || this.newNetworkProperty.get("value") == "" || (this.newNetworkValue.get("value") == "" && this.newBoolNetworkValue.get("value") == "")));
    },

    _descendantAction: function(action) {
        dojo.forEach(this.getDescendants(), function(widget){
            if(widget[action] && typeof(widget[action]) == "function") {
                widget[action]();
            }
        });
    },

    _updateButtons: function() {
        this._setDisplay(this.saveButton, this.isNew || this.isDuplicate);
        this._setDisplay(".diskAction", this.isNew || this.isDuplicate);
        this._setDisplay(".customAction", this.isNew || this.isDuplicate);
    },

    _setDataFunctions: function() {
        // config modification
        this.configDataFunction = "",
        this.configSaveFunction = "",
        this.configDataParams = {};
        this.configSaveParams = {};
        // model modification
        this.dataFunction = "";
        this.dataParams = {};
        this.saveFunction = "";
        this.saveParams = {};

        if (this.isNew || this.isDuplicate) {
            this.saveFunction = "add_vm";
            this.saveParams.disk_uuids = [];
        }

        if (this.isNew) {
            this.saveParams.vm_name = "";
            this.saveParams.config = [];
        } else {
            this.configDataFunction = "get_vm_config",
            this.configDataParams = { vm_uuid: this.vm_uuid };
            this.dataFunction = "get_vm";
            this.dataParams = { vm_uuid: this.vm_uuid };
        }
    },

    _onVmIconSelect: function() {
        this.vmIconText.set("value", this.image_path.get("value"));
    },

    _onVmIconTextChange: function(newVal) {
        if(this.image_path.get("value") != newVal) {
            this.image_path.set("value", newVal);
        }
    },

    _isUserVM: function() {
        if (["svm", "pvm", null].contains(this.vm_type)) {
            return true;
        }
        if (this.config.vm && (!this.config.vm.type || (this.config.vm.type == "svm" || this.config.vm.type == "pvm"))) {
            return true;
        }
        return false;
    },

    _bindDijit: function() {
        this.image_path.set("source", XenClient.Utils.VmIcons);
        this._enableAddConfigButton();
        this._enableAddNetworkButton();
        this.onNewNetworkPropertyChange();
        this.bind({model: this.model, config: this.config}, this.tabContainer.containerNode);
        this._setNetworkArray();
        this.networkRepeater.set("value", this.networkArray);

        var hasImage = false;
        if (this.config.vm && this.config.vm["image-path"]) {
            var path = this.config.vm["image-path"];
            if (XenClient.Utils.VmIcons[path]) {
                this.imageNode.domNode.src = XenClient.Utils.VmIcons[path];
                hasImage = true;
            }
            this.image_path.set("value", path);
        }
        this._setVisible(this.imageNode, hasImage);
        this.set("title", this.model.vm_name);
        this._updateButtons();
        this._setDisplay(".userVmOnly", this._isUserVM());
        this.inherited(arguments);
    }
});
});
