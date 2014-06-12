/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

var fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec,
    util = require('util');

var packageFileName = 'package.json';
var modulesDirName = 'node_modules';
var cacheDirectory = process.cwd();
var npmCacheAddMask = 'npm cache add %s@%s; echo %s';
var sourceDirMask = '%s/%s/%s/package';
var targetDirMask = '%s/node_modules/%s';

function deleteFolder(folder) {
    if (fs.existsSync(folder)) {
        var files = fs.readdirSync(folder);
        files.forEach(function(file) {
            file = folder + "/" + file;
            if (fs.lstatSync(file).isDirectory()) {
                deleteFolder(file);
            } else {
                fs.unlinkSync(file);
            }
        });
        fs.rmdirSync(folder);
    }
}

function downloadSource(folder) {
    var packageFile = path.join(folder, packageFileName);
    if (fs.existsSync(packageFile)) {
        var data = fs.readFileSync(packageFile);
        var package = JSON.parse(data);

        function getVersion(data) {
            var version = data.match(/-([^-]+)\.tgz/);
            return version[1];
        }

        var callback = function(error, stdout, stderr) {
            var dependency = stdout.trim();
            var version = getVersion(stderr);
            var sourceDir = util.format(sourceDirMask, cacheDirectory, dependency, version);
            var targetDir = util.format(targetDirMask, folder, dependency);
            var modulesDir = folder + '/' + modulesDirName;

            if (!fs.existsSync(modulesDir)) {
                fs.mkdirSync(modulesDir);
            }

            fs.renameSync(sourceDir, targetDir);
            deleteFolder(cacheDirectory + '/' + dependency);
            downloadSource(targetDir);
        };

        for (dependency in package.dependencies) {
            var version = package.dependencies[dependency];
            exec(util.format(npmCacheAddMask, dependency, version, dependency), callback);
        }
    }
}

if (!fs.existsSync(path.join(process.cwd(), packageFileName))) {
    console.log(util.format("Unable to find file '%s'.", packageFileName));
    process.exit();
}

deleteFolder(path.join(process.cwd(), modulesDirName));
process.env.npm_config_cache = cacheDirectory;
downloadSource(process.cwd());