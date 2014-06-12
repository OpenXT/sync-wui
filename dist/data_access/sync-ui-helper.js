/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

var nconf = require('nconf')
    , spawn = require('child_process').spawn;

var success_status = "success";
var json_connect = { command: "connect", login: nconf.get("sync-ui-helper:connection") };
var json_call = { command: "call", procedure: null, package: nconf.get("sync-ui-helper:package"), params: null };
var json_disconnect = { command: "disconnect" };
var json_quit = { command: "quit" };

var helper = spawn(nconf.get("sync-ui-helper:path"));
console.log("sync-ui-helper spawned with pid: " + helper.pid);

var id = 0;
var returnFns = {};
var data = "";

helper.stdout.on('data', function (chunk) {
    data += chunk;
    var index = data.indexOf('\n');
    while (index > -1) {
        var message = data.slice(0, index);
        receiveMessage(message);
        data = data.slice(index + 1);
        index = data.indexOf('\n');
    }
});

helper.stderr.on('data', function (error) {
    console.log("sync-ui-helper returned error: " + error);
});

helper.on('exit', function (code) {
    console.log("sync-ui-helper exited with code: " + code);
});

function sendMessage(json, cb) {
    json.id = id;
    helper.stdin.write(JSON.stringify(json) + "\n");
    if (cb) {
        returnFns[id] = cb;
    }
    id ++;
}

function getStatus(json) {
    var code = 0;
    var message = "An error occurred";
    var status = json.status;

    code = json.oracle_code || json.code || code;
    message = json.oracle_message || json.message || message;

    console.log("sync-ui-helper returned " + status + ": [" + code + "] " + message);

    return { error: { status: status, code: code, message: message }};
}

function receiveMessage(message) {
    var json = JSON.parse(message);
    var result;

    if (json.status == success_status) {
        result = json.return_val;
    } else {
        result = getStatus(json);
    }

    if (returnFns[json.id]) {
        returnFns[json.id].call(this, result, json.status);
        delete returnFns[json.id];
    }
}

process.on('exit', function () {
    sendMessage(json_disconnect);
    sendMessage(json_quit);
});

sendMessage(json_connect, function(result, status) {
    if (status == success_status) {
        console.log("sync-ui-helper connected to database");
    }
});

exports.execute = function() {
    var args = [].slice.call(arguments);
    var cb = null;

    json_call.procedure = args.shift();
    json_call.params = null;

    if (typeof(args[0]) === "object") {
        json_call.params = args.shift();
    }
    if (typeof(args[0]) === "function") {
        cb = args.shift();
    }

    sendMessage(json_call, cb);
};