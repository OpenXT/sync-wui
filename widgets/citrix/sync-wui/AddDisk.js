/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    // Resources
    "dojo/i18n!citrix/sync-wui/nls/AddDisk",
    "dojo/text!citrix/sync-wui/templates/AddDisk.html",
    // Mixins
    "citrix/common/ValidationDialog",
    "citrix/common/_CitrixWidgetMixin",
    "citrix/common/_CitrixTooltipMixin",
    "citrix/sync-wui/_ModelMixin",
    // Required in template
    "citrix/sync-wui/Button",
    "citrix/common/ValidationTextBox",
    "citrix/common/NumberSpinner",
    "citrix/common/Select"
],
function(dojo, declare, nls, template, dialog, _citrixWidgetMixin, _citrixTooltipMixin, _modelMixin) {
return declare("citrix.sync-wui.AddDisk", [dialog, _citrixWidgetMixin, _citrixTooltipMixin, _modelMixin], {

    templateString: template,
    widgetsInTemplate: true,
    destroyOnHide: true,

    constructor: function(args) {
        this.saveFunction = "add_disk";
        this.saveParams = {
            disk_name: null,
            disk_type: null,
            file_path: null,
            file_size: null,
            file_hash: null,
            encryption_key: null,
            shared: null,
            read_only: null
        };
    },

    postMixInProperties: function() {
        dojo.mixin(this, nls);
        this.inherited(arguments);
    },

    postCreate: function() {
        this.inherited(arguments);
        this.startup();
        this.set("title", nls.TITLE);

        this.typeNode.set("value", "v");
        this.readonlyNode.set("value", false);
        this.sharedNode.set("value", false);
    },

    onTypeChange: function(newValue) {
        this._setEnabled(this.keyNode, newValue == 'v');
        this._setEnabled(this.readonlyNode, newValue == 'v');
        if (newValue == 'i') {
            this.keyNode.set("value", "");
            this.readonlyNode.set("value", true);
        }
    },

    onROChange: function(newValue) {
        this._setEnabled(this.sharedNode, newValue == false);
        if (newValue == true) {
            this.sharedNode.set("value", false);            
        }
    },

    save: function() {
        this.saveParams.disk_name = this.nameNode.get("value");
        this.saveParams.file_path = this.pathNode.get("value");
        this.saveParams.file_hash = this.hashNode.get("value");
        this.saveParams.file_size = this.sizeNode.get("value");
        this.saveParams.disk_type = this.typeNode.get("value");
        this.saveParams.encryption_key = this.keyNode.get("value");
        this.saveParams.read_only = this.readonlyNode.get("value");
        this.saveParams.shared = this.sharedNode.get("value");

        var finish = dojo.hitch(this, function() {
            this.onExecute();
        });
        
        this.saveData(finish);
    }
});
});
