/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

var oracle = require('db-oracle')
    , nconf = require('nconf');

var self = this;

function connect(fn) {
    new oracle.Database({
        hostname: nconf.get("oracle:host"),
        user: nconf.get("oracle:username"),
        password: nconf.get("oracle:password")
    }).connect(fn);
}

self.list_devices = function(params, fn) {
    connect(function(error) {
        if (error) {
            return console.log("CONNECTION ERROR: " + error);
        }

        this.query().select('DEVICE_UUID as "device_uuid", DEVICE_NAME as "device_name"').from('DEVICE').execute(function(error, rows) {
            if (error) {
                return console.log('ERROR: ' + error);
            }
            return fn(rows);
        });
    });
};

self.list_vms = function(params, fn) {
    connect(function(error) {
        if (error) {
            return console.log("CONNECTION ERROR: " + error);
        }

        this.query().select('VM_UUID as "vm_uuid", VM_NAME as "vm_name"').from('VM').execute(function(error, rows) {
            if (error) {
                return console.log('ERROR: ' + error);
            }
            return fn(rows);
        });
    });
};

self.get_vm = function(params, fn) {
    connect(function(error) {
        if (error) {
            return console.log("CONNECTION ERROR: " + error);
        }

        this.query().select('VM_UUID as "vm_uuid", VM_NAME as "vm_name"').from('VM').where('VM_UUID = ?', [ params.vm_uuid ]).execute(function(error, result) {
            if (error) {
                return console.log('ERROR: ' + error);
            }
            return fn(result);
        });
    });
};

// fn, args, fn
exports.execute = function() {
    var args = [].slice.call(arguments);
    var fn = args.shift();
    if (typeof(self[fn]) === "function") {
        self[fn].apply(self, args);
    }
}