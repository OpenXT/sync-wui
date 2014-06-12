define([
    "dojo",
    "dojo/_base/declare",
    "dojo/date/locale",
    // Resources
    "dojo/i18n!./nls/SampleWidget",
    // Mixins
    "citrix/sync-wui/StoreGrid",
    "citrix/common/_TopicMixin"
],
function (dojo, declare, localeDate, nls, grid, _topicMixin) {
return declare("acme.SampleWidget", [grid, _topicMixin], {

    dataFunction: "list_disks_ui",
    idProperty: "disk_uuid",

    constructor: function(args) {
        this.days = args.days || this.days;
        
        this.dataParams = {
            disk_name_contains: ""
        };

        this.columns = {
            disk_name: nls.HEADING,
            file_path: nls.PATH,
            disk_type: {
                label: nls.TYPE,
                formatter: function(type) {
                    return (type == "v") ? "VHD" : (type == "i") ? "ISO" : type;
                }
            },
            read_only: {
                label: nls.PERSISTENT,
                formatter: function(readonly) {
                    return (readonly == "t") ? nls.FALSE : (readonly == "f") ? nls.TRUE : readonly;
                }
            }
        };

        this.query = function(item, index, items) {
            return !(item.num_vms && item.num_vms > 0);
        };
    },

    postCreate: function() {
        this.inherited(arguments);
        this.subscribe(XUtils.publishTopic, dojo.hitch(this, this._messageHandler));
    },

    _messageHandler: function(message) {
        switch(message.type) {
            case "add_disk":
            case "remove_disk":
            case "add_vm":
                this._bindDijit();
                break;
        }
    }
});
});