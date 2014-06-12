/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/array",
    // Mixins
    "citrix/common/ImageSelect"
],
function(dojo, declare, array, imageSelect) {
return declare("citrix.sync-wui.ImageSelect", [imageSelect], {

    setSelected: function(image) {
        var value;
        array.some(Object.keys(this.source), function(key) {
            if(image == this.source[key]) {
                value = key;
                return true;
            }
            return false;
        }, this);
        this._handleOnChange(value);
        this.value = value;
        this._updateChildren();
    },

    _updateChildren: function() {
        if (this.source != null) {
            var keys = Object.keys(this.source);
            var baseClass = (this.itemClassSmall != "" && keys.length > this.classThreshold) ? this.itemClassSmall : this.itemClass;
            array.forEach(keys, function(srcItem) {
                if (!array.some(this.getChildren(), function(item) { return this.source[srcItem] == item.image; }, this)) {
                    // image doesn't exist in the children already, so add
                    var imageItem = new this.imageWidget({image: this.source[srcItem], baseClass: baseClass});
                    this.addChild(imageItem);
                }
            }, this);
        }
        array.forEach(this.getChildren(), function(item) {
            item.set("selected", (item.image == this.source[this.value]));
            item.set("disabled", !this.editing);
        }, this);
    },

    findChild: function() {
        // want to return the child matching the current value
        var result = null;
        dojo.some(this.getChildren(), function(child){
            if(child[this.valueProperty] == this.source[this.value]) {
                result = child;
                return true;
            }
        }, this);
        return result;
    }
});
});