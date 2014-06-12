/*
Product: OpenXT
Project: Synchronizer Administration Web UI
Copyright© Citrix 2012
*/

cwd = (new java.io.File(".")).getAbsolutePath();

for(var dojohome = ".", arg, rhinoArgs = this.arguments, i = 0; i < rhinoArgs.length;){
	arg = (rhinoArgs[i++] + "").split("=");
	if(arg[0] == "baseUrl"){
		dojohome = arg[1];
		break;
	}
}

if (dojohome.indexOf(".")==0) {
    realBuildScriptsPath=cwd+"/";
} else {
    realBuildScriptsPath=dojohome;
}

var profile = {
    basePath: "../widgets/util/buildscripts/",
    layerOptimize: "shrinksafe",
    cssOptimize: "comments",
    releaseDir: "../../../dist/static/widgets",
    mini: true,
    copyTests: false,

    packages: [
        {
            name: "dojo",
            location: realBuildScriptsPath + "../../dojo"
        },
        {
            name: "dijit",
            location: realBuildScriptsPath + "../../dijit"
        },
        {
            name: "dojox",
            location: realBuildScriptsPath + "../../dojox"
        },
        {
            name: "dgrid",
            location: cwd + "/../../../widgets/dgrid"
        },
        {
            name: "put-selector",
            location: cwd + "/../../../widgets/put-selector"
        },
        {
            name: "xstyle",
            location: cwd + "/../../../widgets/xstyle"
        },
        {
            name: "citrix",
            location: cwd + "/../../../widgets/citrix"
        },
        {
            name: "acme",
            location: cwd + "/../../../widgets/acme"
        }
    ],
    layers: {
        "dojo": {
            include: [
                "dojo/_base/url",
                "dojo/cache",
                "dojo/cookie",
                "dojo/data/ItemFileReadStore",
                "dojo/data/util/filter",
                "dojo/data/util/simpleFetch",
                "dojo/data/util/sorter",
                "dojo/date/locale",
                "dojo/date/stamp",
                "dojo/DeferredList",
                "dojo/dnd/autoscroll",
                "dojo/dnd/Avatar",
                "dojo/dnd/common",
                "dojo/dnd/Container",
                "dojo/dnd/Manager",
                "dojo/dnd/Moveable",
                "dojo/dnd/Mover",
                "dojo/dnd/Selector",
                "dojo/dnd/Source",
                "dojo/dnd/TimedMoveable",
                "dojo/html",
                "dojo/NodeList-manipulate",
                "dojo/NodeList-traverse",
                "dojo/number",
                "dojo/parser",
                "dojo/require",
                "dojo/selector/acme",
                "dojo/Stateful",
                "dojo/text",
                "dojo/touch",
                "dojo/uacss",
                "dojo/window"
            ]
        },
        "citrix/sync-wui": {
            copyright: "// Author: Rob Moran\n// Company: Citrix\n// Product: OpenXT\n// Project: Synchronizer Administration Web UI\n// Copyright© Citrix 2012\n",
            exclude: [
                "dojo"
            ],
            include: [
                "citrix/sync-wui/AlertDialog",
                "citrix/sync-wui/MainTabContainer",
                "citrix/common/ContentPane",
                "citrix/sync-wui/UnseenDeviceWidget",
                "citrix/sync-wui/DeviceWidget",
                "citrix/sync-wui/VMWidget",
                "citrix/sync-wui/ServiceVMWidget",
                "citrix/sync-wui/DiskWidget"
            ]
        },
        "acme": {
            copyright: "// Author: Rob Moran\n// Company: Citrix\n// Product: OpenXT\n// Project: Synchronizer Administration Web UI\n// Copyright© Citrix 2012\n",
            exclude: [
                "dojo"
            ],
            include: [
                "acme/SampleWidget"
            ]
        }        
    }
 };
