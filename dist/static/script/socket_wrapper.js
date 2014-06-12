/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

var socket = function(sio) {
	
    function redirect(url) {
        window.location.href = url;
    }

    function refresh_site() {
        return window.location.reload();
    }

    function refresh_css() {
        var links = document.getElementsByTagName("link");
        for (var i = 0; i < links.length; i++) {
            var tag = links[i];
            if (tag.rel.toLowerCase().indexOf("stylesheet") >= 0 && tag.href) {
                var href = tag.href;
                var index = href.indexOf("?");
                if (index > 0) {
                    href = href.slice(0, index);
                }
                tag.href = href + "?" + new Date().valueOf();
            }
        }
    }

	var socket = sio.connect(window.location.hostname);
    socket.on('redirect', redirect);
    socket.on('refresh_site', refresh_site);
    socket.on('refresh_css', refresh_css);

	return {
        data_access: function() {
            var args = [].slice.call(arguments);
            var success = undefined;
            var failure = undefined;
            var topic = args[0];
            var props = {};
            if (typeof(args[1]) == "object") {
                props = args[1];
            }
            if (typeof(args[args.length - 1]) === "function") {
                if (typeof(args[args.length - 2]) === "function") {
                    failure = args.pop();
                }
                success = args.pop();
            }            
            var fn = function(data) {
                if (data && data.redirect) {
                    redirect(data.redirect);
                } else if (data && data.error) {
                    if (failure) {
                        failure(data.error);
                    } else {
                        console.warn(data.error.message);
                    }
                } else {
                    XUtils.publish(topic, props);
                    if (success) {
                        success(data);
                    }
                }

            };
            args.unshift('data_access');
            args.push(fn);
            socket.emit.apply(socket, args);
        }
	}
}(io);