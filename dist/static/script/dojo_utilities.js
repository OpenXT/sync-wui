/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

// Dojo-based utilities
String.prototype.format = function(){
    var regex = /\{([^\}]+)\}/g;
    var separator = ":";
    var args = arguments;
    // Support array of values passed in
    require(["dojo/_base/lang"], function(lang) {
        if (args.length == 1 && lang.isArray(args[0])) {
            args = args[0];
        }
    });
    return this.replace(regex, function(m, k) {
        var formatter = k.split(separator);
        var key = formatter.shift();
        if (typeof(args[key]) == "undefined") {
            return m;
        }
        var value = args[key];
        if (formatter[0]) {
            formatter = formatter.join(separator);
            if (formatter == "n" || formatter == "f" ) {
                require(["dojo/number"], function(number) {
                    value = number.format(value, {places: (formatter == "f") ? 2 : 0});
                });
            } else {
                var date = (value instanceof Date) ? value : new Date(value);
                require(["dojo/date/locale"], function(dateLocale) {
                    value = dateLocale.format(date, {selector: "date", datePattern: formatter});
                });
            }
        }
        return value;
    });
};

XenClient.Utils.publishTopic = "/ui/wui";
XenClient.Utils.publish = function(type, data) {
    require(["dojo/topic"], function(dojoTopic) {
        dojoTopic.publish(XenClient.Utils.publishTopic, { type: type, data: data });
    });
};