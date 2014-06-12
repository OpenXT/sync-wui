#Product: OpenXT
#Project: Synchronizer Administration Web UI
#Copyright© Citrix 2012

Welcome to XenClient™ XT Synchronizer Web UI

# Prerequisites

Node.js 0.8+ (http://nodejs.org)
Python 2.6+ (http://www.python.org)
NPM (should ship with node)
Citrix sync-ui-helper and sync-database

# Building Node.js modules

Run 'npm rebuild' in this folder to build the source in 'node_modules'

# Installing OCI

1 Download instantclient-basic-*.zip and instantclient-sdk-*.zip for your system from http://www.oracle.com/technetwork/database/features/instant-client/index-097480.html

2 Unzip the above to somewhere (e.g. '/opt/instantclient')

3 Symlink some stuffs:
    $ cd /opt/instantclient
    $ sudo ln -s libocci.so.11.1 libocci.so
    $ sudo ln -s libclntsh.so.11.1 libclntsh.so

4 Install libaio:
    $ sudo apt-get install libaio-dev

5 Set environment variables (add them to your '~/.bashrc'):
    LD_LIBRARY_PATH="/opt/instantclient"

# Configuration

Edit 'config.json' to reflect your environment, specifically the ldap and sync-ui-helper sections
Alternatively, add a 'user.json' file with a similar json structure which will overwrite specific elements in the 'config.json' file

# Running

Execute:
    $ node app [--port <port> --environment "debug"/"release"]