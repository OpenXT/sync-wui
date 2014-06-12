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

WUI=${DESTDIR}/sync-wui
WUI_SRCS=${DESTDIR}/sync-wui-sources

BUILT=built
SRCS=sources

DOJO=dojo-1.8.1

JS_SRC=$(shell find widgets -type f -print )
DIST_SRC=$(shell find dist -type f -print )


all: built.stamp

# to maintain compatability with the existing relative paths we run two directories down,
# we don't need this as we can run our dojo binary from anywhere.

# create the sources directory first, so that it does not contain any output from the build
built.stamp: sources build/sync-wui.profile.js ${JS_SRC}  ${DIST_SRC}
	mkdir -p a/b/c
	mkdir -p ${BUILT}
	cp -dr dist/. ${BUILT}
	rm -rf dist/static/widgets
	mkdir -p dist/static/widgets
	(cd a/b/c && ${DOJO} profile="../../../build/sync-wui.profile.js" --release --bin java )
	mkdir -p dist/static/widgets
	mkdir -p ${BUILT}/static/widgets
	cp -dr dist/static/widgets/. ${BUILT}/static/widgets
	rm -rf dist/static/widgets
	find ${BUILT}/static/widgets/citrix/common -name '*.js' -exec rm '{}' ';'
	find ${BUILT}/static/widgets/citrix/common/themes/tundra -name '[^tundra]*.css' -exec rm '{}' ';'
	find ${BUILT}/static/widgets/citrix/sync-wui -name '*.js' -exec rm '{}' ';'
	find ${BUILT}/static/widgets/citrix/sync-wui/themes/tundra -name '[^tundra]*.css' -exec rm '{}' ';'
	find ${BUILT} -name '*.uncompressed.js' -exec rm '{}' ';'
	touch $@

sources:
	mkdir -p ${SRCS}
	cp README.md ${SRCS}/
	cp -dr dist ${SRCS}/
	cp -dr build ${SRCS}/
	cp -dr widgets ${SRCS}/

install:
	install -m 0755 -d ${WUI}
	cp -dr ${BUILT}/. ${WUI}
	install -m 0755 -d ${WUI_SRCS}
	cp -dr ${SRCS}/. ${WUI_SRCS}

	rm -rf ${WUI}/static/widgets/citrix/common/templates
	rm -rf ${WUI}/static/widgets/citrix/sync-wui/templates
	rm -rf ${WUI}/static/widgets/citrix/sync-wui/nls
	rm -rf ${WUI}/static/widgets/build-report.txt

        # Avoid packaging errors by removing the demos directory in dojox
	rm -rf ${WUI}/static/widgets/dojox/data/demos/

	# Remove unused themes

clean:
	rm -f built.stamp
	rm -rf dist/static/widgets
	rm -rf ${BUILT}
	rm -rf ${SRCS}

