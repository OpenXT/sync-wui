/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

// Utility functions common to the UI code.
XenClient = {};

Function.prototype.getHashCode = (function() {
    var id = 0;
    return function() {
        if (!this["hashCode"]) {
            this["hashCode"] = "<hash|#" + id++ + ">";
        }
        return this["hashCode"];
    }
})();

// Build chains of functions.
// e.g. 
//   a.extend(b);
//   a(); // calls a; calls b after a returns
Function.prototype.extend = function(fn) {
    var self = this;
    return function() {
        self.apply(null, arguments);
        if (typeof(fn) === "function") {
            fn.apply(null, arguments);
        }
    }
};

Function.prototype.decorate = function(fn) {
    var self = this;
    return function() {
        fn(self);
    }
};

// Check if an array contains a specific element
Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) if (this[i] === obj) return true;
    return false;
};

// Convert a string to a boolean
// (case-insensitive equality test against the string "true")
String.prototype.bool = function(defaultToTrue) {
    if (defaultToTrue && this == "") {
        return true;
    }
    return (/^true$/i).test(this);
};

// Returns true if a string starts with a particular character sequence
String.prototype.startsWith = function(str) {
    return (this.match("^" + str) == str);
};

// Returns true if a string ends with a particular character sequence
String.prototype.endsWith = function(str) {
    return (this.match(str + "$") == str);
};

String.prototype.truncate = function(len) {
    var s = this.substring(0, len);
    return s.replace(/\s+$/, ''); //strip trailing whitespace
};

String.prototype.shorten = function(len, end, ellipses) {
    if (this.length <= len) {
        return this;
    }
    end = end || false;
    ellipses = ellipses || "...";
    len -= ellipses.length;

    if (end) {
        return this.substr(0, len) + ellipses;
    } else {
        len /= 2;
        var begin = this.substr(0, len);
        var end = this.substr(this.length - len);
        return begin + ellipses + end;
    }
};

// From http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
Object.toType = function(obj) {
    return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
};

// From http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
// IE<=8 doesn't have an implementation built in
Object.keys = Object.keys || (function () {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !{toString:null}.propertyIsEnumerable("toString"),
        DontEnums = [
            'toString',
            'toLocaleString',
            'valueOf',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'constructor'
        ],
        DontEnumsLength = DontEnums.length;

    return function (o) {
        if (typeof o != "object" && typeof o != "function" || o === null)
            throw new TypeError("Object.keys called on a non-object");

        var result = [];
        for (var name in o) {
            if (hasOwnProperty.call(o, name))
                result.push(name);
        }

        if (hasDontEnumBug) {
            for (var i = 0; i < DontEnumsLength; i++) {
                if (hasOwnProperty.call(o, DontEnums[i]))
                    result.push(DontEnums[i]);
            }
        }

        return result;
    };
})();

//XenClient.Utils Namespace
XenClient.Utils = {
    parseQuery: function() {
        var result = {};
        window.location.search.toString().replace(/(?:\?|&)([^&=]*)=?([^&]*)/g, function($0, $1, $2) {
            if ($1) {
                result[$1] = $2 || true;
            }
        });
        return result;
    },
    parseCookie: function() {
        var result = {};
        document.cookie.replace(' ', '').replace(/(?:^|;)([^;=]*)=?([^;]*)/g, function($0, $1, $2) {
            if ($1) {
                result[$1] = $2 || true;
            }
        });
        return result;
    },
    debug: function() {
        return XUtils.parseQuery().debug;
    },
    // Converts a number in units of bytes to a human-readable form.
    // @param bytes - the number to convert, in bytes
    // @param decimalPlaces - the number of decimal places, default is 0
    // @return A string with a human-readable representation of the number
    humanizeBytes: function(bytes, decimalPlaces) {
        function trunc(n) {
            return n.toFixed(decimalPlaces || 0);
        }
        if (bytes < 1024.0) {
            return bytes + " B";
        } else if (bytes < 1024.0 * 1024.0) {
            return trunc(bytes / 1024.0) + " KB";
        } else if (bytes < 1024.0 * 1024.0 * 1024.0) {
            return trunc(bytes / (1024.0 * 1024.0)) + " MB";
        } else if (bytes < 1024.0 * 1024.0 * 1024.0 * 1024.0) {
            return trunc(bytes / (1024.0 * 1024.0 * 1024.0)) + " GB";
        } else {
            return trunc(bytes / (1024.0 * 1024.0 * 1024.0 * 1024.0)) + " TB";
        }
    },
    AsyncQueue: function() {
        this._successMethods = [];
        this._failureMethods = [];
        this._response = null;
        this._flushed = false;
        this._success = false;
        this._failure = false;

        // adds callbacks to your queue
        this.add = function(successFN, failureFN) {
            if (this._flushed) {
                if (this._success) {
                    successFN.apply(null, this._response);
                }
                if (this._failure) {
                    failureFN.apply(null, this._response);
                }
            } else {
                this._successMethods.push(successFN);
                this._failureMethods.push(failureFN);
            }
        };

        // note: flush only ever happens once
        this.success = function() {
            if (this._flushed) {
                return;
            }
            this._response = arguments;
            this._flushed = true;
            this._success = true;
            while (this._successMethods[0]) {
                this._successMethods.shift().apply(null, arguments);
            }
        };

        this.failure = function() {
            if (this._flushed) {
                return;
            }
            this._response = arguments;
            this._flushed = true;
            this._failure = true;
            while (this._failureMethods[0]) {
                this._failureMethods.shift().apply(null, arguments);
            }
        };
    },
    AsyncWait: function(finishFn, errorFn) {
        var count = 0;
        var callbackAdded = false;
        this.addCallback = function(fn) {
            count++;
            callbackAdded = true;
            return function() {
                if (fn) {
                    fn.apply(null, arguments);
                }
                if (--count == 0 && finishFn) {
                    finishFn();
                }
            }
        };
        this.error = function() {
            if (errorFn) {
                errorFn.apply(null, arguments);
            }
            if (--count == 0 && finishFn) {
                finishFn();
            }
        };
        this.finish = function() {
            if (!callbackAdded && finishFn) {
                finishFn();
            }
        };
    },
    uuidToPath: function(uuid, prefix) {
        prefix = prefix || "/vm/";
        return prefix + uuid.replace(/-/g, "_");
    },
    pathToUuid: function(path, prefix) {
        prefix = prefix || "/vm/";
        return path.replace(prefix, "").replace(/_/g, "-");
    },
    stripScript: function(html) {
        // script blocks
        html = html.replace(/<[^>]*script[^>]*>/gi, "");
        // node events
        html = html.replace(/<[^>]*[\s]on[^>]*>/gi, "");
        // other horrid things
        html = html.replace(/<[^>]*object[^>]*>/gi, "");
        html = html.replace(/<[^>]*embed[^>]*>/gi, "");
        html = html.replace(/<[^>]*iframe[^>]*>/gi, "");
        return html;
    },
    disableContextMenu: function(element) {
        element.oncontextmenu = function(event) {
            return false;
        };
    },
    preventScrolling: function(element) {
        element.onscroll = function(event) {
            element.scroll(0, 0);
        };
    }
};

// shortcut for XenClient.Utils
var XUtils = XenClient.Utils;

XenClient.Utils.CreateObjectGraph = (function() {
    var buildGraph = function (parent, splitKey) {
        var key = splitKey.shift();
        if (parent[key] === undefined) eval("parent." + key + "={}");
        if (splitKey.length > 0) buildGraph(parent[key], splitKey);
    };

    return function(name, context) {
        context = context || window;
        buildGraph(context, name.split("."));
    }
})();

var Namespace = XenClient.Utils.CreateObjectGraph;
