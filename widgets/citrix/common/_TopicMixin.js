/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

define([
    "dojo",
    "dojo/_base/declare",
    "dojo/topic",
    "dojo/_base/array"
],
function(dojo, declare, topic, array) {
return declare("citrix.common._TopicMixin", null, {

    constructor: function() {
        this._topicHandles = [];
    },

    subscribe: function() {
        this._topicHandles.push(topic.subscribe.apply(undefined, arguments));
    },

    uninitialize: function() {
        array.forEach(this._topicHandles, function(item) {
            item.remove();
        });
    }
});
});