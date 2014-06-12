/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    // Resources
    "dojo/text!citrix/sync-wui/templates/Button.html",
    // Mixins
    "citrix/common/Button"
],
function(dojo, declare, template, button) {
return declare("citrix.sync-wui.Button", [button], {

    templateString: template,

    _onClick: function(/*Event*/ e){
   		var ok = this.inherited(arguments);
   		if(ok){
            e.preventDefault();
            e.stopPropagation();
   		}
   		return ok;
   	}

});
});