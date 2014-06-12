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
    // Resources
    "dojo/i18n!citrix/sync-wui/nls/Settings",
    "dojo/text!citrix/sync-wui/templates/Settings.html",
    // Mixins
    "citrix/common/ValidationDialog",
    "citrix/common/_BoundContainerMixin",
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
    "citrix/common/ValidationTextBox",
    "citrix/common/Label",
    "citrix/common/Select",
    "citrix/sync-wui/BooleanSelect",
    "citrix/common/Repeater",
    "citrix/common/BoundWidget",
    "citrix/common/EditableWidget"
],
function(dojo, declare, array, lang, query, traverse, string, nls, template, dialog, _boundContainerMixin, _citrixTooltipMixin, _configMixin, _modelMixin, gridDialog) {
return declare("citrix.sync-wui.Settings", [dialog, _boundContainerMixin, _citrixTooltipMixin, _configMixin, _modelMixin], {

    templateString: template,
    widgetsInTemplate: true,
    destroyOnHide: true,

    isNew: false, // by default, we're modifying existing
    isDuplicate: false,
    isSaveToDevices: false,

    constructor: function(args) {
        this.isNew = args.isNew ? true : false;
        this.isDuplicate = args.isDuplicate ? true : false;
        this.isSaveToDevices = args.isSaveToDevices ? true : false;
        this.device_uuid = args.device_uuid;
        this.device_uuid_array = args.device_uuid_array;
        this._setDataFunctions();
    },

    _setDataFunctions: function() {
        if(!this.isNew) {
            // config modification
            this.configDataFunction = "get_device_config",
            this.configSaveFunction = "modify_device_config",
            this.configDataParams = {device_uuid: this.device_uuid};
            this.configSaveParams = {
                device_uuid: this.device_uuid,
                config: [],
                replace: false
            };
            // model modification
            this.dataFunction = "get_device";
            this.dataParams = {device_uuid: this.device_uuid};
            this.saveFunction = "modify_device_repo";
            this.saveParams = {
                device_uuid: this.device_uuid,
                repo_uuid: ""
            };
        } else {
            // model and config creation
            this.configDataFunction = this.isDuplicate ? "get_device_config" : "",
            this.configSaveFunction = this.isSaveToDevices ? "modify_device_config" : "",
            this.configDataParams = this.isDuplicate ? {device_uuid: this.device_uuid} : {};
            this.configSaveParams = this.isSaveToDevices ? {device_uuid: null, config: [], replace: false} : {};
            this.dataFunction = this.isDuplicate ? "get_device" : "";
            this.dataParams = this.isDuplicate ? {device_uuid: this.device_uuid} : {};
            this.saveFunction = this.isSaveToDevices ? "" : "add_device";
            this.saveParams = this.isSaveToDevices ? {} : {device_name: "", repo_uuid: "", config: []};
        }
    },

    postMixInProperties: function() {
        dojo.mixin(this, nls);
        this.inherited(arguments);
    },

    postCreate: function() {
        this.inherited(arguments);
        this.startup();

        if(this.isNew) {
            this.nameNode.edit();
            // this creates a set of default bindings which are not undefined, as that causes issues when controlling the save button
            if(!this.isDuplicate) {
                dojo.mixin(this, this.unbind(this.tabContainer.containerNode));
            }
            this._setCustomsArray();
            this._bindDijit();
        }

        if(this.isSaveToDevices) {
            this.tabContainer.removeChild(this.detailsTab);
        }

        this._updateRepoSelect();

        this.connect(this.tabContainer.tablist, "onSelectChild", "_onTabChange");
        this.connect(this.wallpaperSelect, "setSelected", "_onWallpaperSelect");
    },

    save: function(toDevices) {
        var values = this.unbind(this.tabContainer.containerNode);

        if(values.config._customs) {
            array.forEach(values.config._customs, function(item, i) {
                lang.setObject(item.id, item.value, values.config);
            }, this);
        }
        delete values.config._customs; // important otherwise you'll get config lines with daemon = "_custom"

        if(this.isNew && !this.isSaveToDevices) {
            this.saveParams.device_name = values.model.device_name;
            this.saveParams.repo_uuid = values.model.repo_uuid;
            this.saveParams.config = this._formatConfigObjectsIntoStringList(values.config);
            var finishSave = dojo.hitch(this, function(data) {
                this.isNew = false;
                this.isDuplicate = false;
                this.device_uuid = data;
                this._setDataFunctions();
                this.nameNode.cancel();
                this.getConfigData();
            });
            this.saveData(finishSave);
        } else if(this.isSaveToDevices) {
            var saveTo = dojo.hitch(this, function() {
                array.forEach(this.device_uuid_array, function(item) {
                    this.configSaveParams.device_uuid = item;
                    this.saveConfigData(values.config);
                }, this);
                this.detailsTab.destroyRecursive();
                this.onCancel();
            });
            XenClient.Utils.messageBox.showConfirmation(nls.REPLACE_CONFIG_MESSAGE, saveTo, { continueText: "CONTINUE_ACTION" });
        } else {
            this.saveParams.device_uuid = this.device_uuid;
            this.saveParams.repo_uuid = values.model.repo_uuid;
            this.saveData();
            this.saveConfigData(values.config);
        }
        this._setEnabled(this.saveButton, false);
    },

    _onWallpaperSelect: function() {
        this.wallpaperText.set("value", this.wallpaperSelect.get("value"));
    },

    _onWallpaperTextChange: function(newVal) {
        if(this.wallpaperSelect.get("value") != newVal) {
            this.wallpaperSelect.set("value", newVal);
        }
    },

    _onTabChange: function(tab) {
        this._setDisplay(this.saveButton, tab.saveable);
    },

    _bindDijit: function() {
        if(this._destroyed) {
            return;
        }
        this.wallpaperSelect.set("source", XenClient.Utils.Wallpapers);
        this._enableAddConfigButton();

        this._updateRepoSelect();

        this.bind({model: this.model, config: this.config}, this.tabContainer.containerNode);
        this.set("title", this.model.device_name);

        if(this.isDuplicate) {
            this._setEnabled(this.saveButton, true);
        }
        this._setDisplay(this.device_uuidNode, !this.isDuplicate);

        this.inherited(arguments);
    },

    _updateRepoSelect: function() {
        var options = [];
        socket.data_access("list_repos", {release: "", build: "", file_path: "", file_hash: "", unused: false}, dojo.hitch(this, function(data) {
            options = array.map(data, function(item, i) {
                return {label: "Release: " + item.release + "; Build: " + item.build, value: item.repo_uuid};
            });
            options.unshift({label: this.NONE_SET, value: ""});
            this.repoNode.set("options", options);
            this.repoNode.set("value", this.model.repo_uuid);
        }));
    },

    _enableAddConfigButton: function() {
        this._setEnabled(this.ConfigAddButton, !(this.newConfigDaemon.get("value") == "" || this.newConfigProperty.get("value") == "" || this.newConfigValue.get("value") == ""));
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

    onSaveToDevices: function(event) {
        if (!this.validate()) {
            return;
        }

    }
});
});
