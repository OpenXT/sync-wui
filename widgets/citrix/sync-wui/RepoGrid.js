/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    // Resources
    "dojo/i18n!./nls/RepoGrid",
    // Mixins
    "citrix/sync-wui/GridTemplate"
],
function(dojo, declare, nls, gridTemplate) {
return declare("citrix.sync-wui.RepoGrid", [gridTemplate], {

    getGridProperties: function() {
        return {
            dataFunction: "list_repos",
            idProperty: "repo_uuid",

            columns: {
                release: nls.RELEASE,
                build: nls.BUILD,
                file_path: nls.FILE_PATH
            },

            dataParams: {
                release: "",
                build: "",
                file_path: "",
                file_hash: "",
                unused: false
            }
        };
    },

    postCreate: function() {
        this.inherited(arguments);
        this._setDisplay(".gridHeader", false);
        this._setClass(".gridBody", "fullHeight");
    }
});
});
