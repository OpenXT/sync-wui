#!/bin/sh
#
# Copyright (c) 2013 Citrix Systems, Inc.
# 
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
#

#Product: OpenXT
#Project: Synchronizer Administration Web UI
#Copyright© Citrix 2012

set -e

if [ "${1}" ]; then
    port="${1}"
    file='app'
    killall node || true
fi

( cd "../widgets/util/buildscripts/" && rm -rf "../../../dist/static/widgets" && ./build.sh profile="../../../build/sync-wui.profile.js" --release --bin java )

rm -rf ../dist/static/widgets/citrix/common/*.js
rm -rf ../dist/static/widgets/citrix/common/templates
find ../dist/static/widgets/citrix/common/themes/tundra -type f -name [^tundra]*.css | xargs rm

rm -rf ../dist/static/widgets/citrix/sync-wui/*.js
rm -rf ../dist/static/widgets/citrix/sync-wui/templates
rm -rf ../dist/static/widgets/citrix/sync-wui/nls
find ../dist/static/widgets/citrix/sync-wui/themes/tundra -type f -name [^tundra]*.css | xargs rm

rm -rf ../dist/static/widgets/acme/*.uncompressed.js

if [ "${port}" ]; then
	cd "../dist/"
	node "${file}" --port "${port}" --environment "release"  &
	sleep 3
	chromium-browser "http://127.0.0.1:${port}"
fi
