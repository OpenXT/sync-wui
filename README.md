#Product: OpenXT
#Project: Synchronizer Administration Web UI
#Copyright© Citrix 2012

Welcome to XenClient™ XT Synchronizer Web UI

Read the README.md in the '/dist' folder first

# Development Prerequisites

git repos: sync-database and sync-ui-helper (parallel to this repo)

# Set up your environment

Go to http://download.dojotoolkit.org/release-1.8.1/
Unpack a source distro from above into './widgets' to get dojo, dijit and utils

# Running

To debug, run the 'debug.sh' file in the build folder. It will serve dojo files from './widgets' so saving the source should refresh your browser
To build, run the 'build.sh' file in the build folder. It will compile dojo into layers to be served from './dist/widgets'