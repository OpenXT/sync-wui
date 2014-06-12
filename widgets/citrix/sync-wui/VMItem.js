/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    "dojo/dom-class",
    // Resources
    "dojo/text!citrix/sync-wui/templates/VMItem.html",
    // Mixins
    "citrix/common/ImageItem"
],
function(dojo, declare, domclass, template, imageItem) {
return declare("citrix.sync-wui.VMItem", [imageItem], {

	templateString: template,
    vm_instance_name: "",
    vm_instance_uuid: "",

    _setVm_instance_nameAttr: function(value) {
        this.nameNode.innerHTML = value;
    },

    _setImageAttr: function(value) {
        if(value && value !== "") {
            this.imageNode.src = value;
            this.image = value;
            this.imageNode.style.visibility = "visible";
        } else {
            this.imageNode.style.visibility = "hidden";
        }
    },

    _setLockedAttr: function(value) {
        this.locked = value == true ? true : false;
        domclass.toggle(this.containerNode, "locked", this.locked);
    }
});
});