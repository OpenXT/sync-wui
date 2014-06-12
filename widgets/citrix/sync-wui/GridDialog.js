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
    // Resources
    "dojo/i18n!citrix/sync-wui/nls/GridDialog",
    "dojo/text!citrix/sync-wui/templates/GridDialog.html",
    // Mixins
    "citrix/common/Dialog"
],
function (dojo, declare, lang, array, nls, template, dialog) {
return declare("citrix.sync-wui.GridDialog", [dialog], {

    templateString: template,
    canExecute: true,
    destroyOnHide: true,

    finishFn: null,
    gridTemplateName: "",
    gridTemplateWidget: null,

    postMixInProperties: function() {
        this.inherited(arguments);
        dojo.mixin(this, nls);
    },

    postCreate: function () {
        this.inherited(arguments);

        var object = lang.getObject(this.gridTemplateName);
        if(object) {
            this.gridTemplateWidget = new object();
            var grid = this.gridTemplateWidget.grid;
            grid.selectionMode = this.selectionMode;
            if(this.query) {
                grid.query = this.query;
            }
            grid.deselectOnRefresh = false;
            this.addChild(this.gridTemplateWidget);
            this.gridTemplateWidget.startup();
        }
    },

    onExecute: function() {
        if(this.finishFn) {
            var data = [];
            for(var row in this.gridTemplateWidget._selectedData) {
                if(this.gridTemplateWidget._selectedData.hasOwnProperty(row)){
                    data.push(this.gridTemplateWidget._selectedData[row]);
                }
            }
            this.finishFn(data);
        }
        this.inherited(arguments);
    }
});
});