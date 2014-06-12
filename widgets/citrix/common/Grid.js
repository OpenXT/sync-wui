/*
 Product: OpenXT
 Project: Synchronizer Administration Web UI
 Copyright© Citrix 2012
 */

define([
    "dojo",
    "dojo/_base/declare",
    "dojo/has",
    // Mixins
    "dgrid/OnDemandGrid",
    "dgrid/Keyboard",
    "dgrid/Selection",
    "dgrid/extensions/DijitRegistry"
],
function (dojo, declare, has, grid, keyboard, selection, gridRegistry) {
return declare("citrix.common.Grid", [grid, keyboard, selection, gridRegistry], {

    selectionMode: "single",
    selectionEvents: "click",

    // overridden so that "multiple" selectionMode behaves more like a toggle, with added ctrl/shift functionality
    _handleSelect: function (event, currentTarget) {
        var ctrlEquiv = has("mac") ? "metaKey" : "ctrlKey";
        // don't run if selection mode is none,
        // or if coming from a dgrid-cellfocusin from a mousedown
        if (this.selectionMode == "none" ||
            (event.type == "dgrid-cellfocusin" && event.parentType == "mousedown") ||
            (event.type == "mouseup" && currentTarget != this._waitForMouseUp)) {
            return;
        }
        this._waitForMouseUp = null;
        this._selectionTriggerEvent = event;
        var ctrlKey = !event.keyCode ? event[ctrlEquiv] : event.ctrlKey;
        if (!event.keyCode || !event.ctrlKey || event.keyCode == 32) {
            var mode = this.selectionMode,
                row = currentTarget,
                rowObj = this.row(row),
                lastRow = this._lastSelected;

            if (mode == "single") {
                if (lastRow === row) {
                    // Allow ctrl to toggle selection, even within single select mode.
                    this.select(row, null, !ctrlKey || !this.isSelected(row));
                } else {
                    this.clearSelection();
                    this.select(row);
                    this._lastSelected = row;
                }
            } else if (this.selection[rowObj.id] && !event.shiftKey && event.type == "mousedown") {
                // we wait for the mouse up if we are clicking a selected item so that drag n' drop
                // is possible without losing our selection
                this._waitForMouseUp = row;
            } else {
                var value;
                // clear selection first for non-ctrl-clicks in extended mode,
                // as well as for right-clicks on unselected targets
                if ((event.button != 2 && mode == "extended" && !ctrlKey) ||
                    (event.button == 2 && !(this.selection[rowObj.id]))) {
                    this.clearSelection(rowObj.id, true);
                }
                if (!event.shiftKey) {
                    // null == toggle; undefined == true;
                    if(mode == "multiple") {
                        lastRow = value = null;
                    } else {
                        lastRow = value = ctrlKey ? null : undefined;
                    }
                }
                this.select(row, lastRow, value);

                if (!lastRow) {
                    // update lastRow reference for potential subsequent shift+select
                    // (current row was already selected by earlier logic)
                    this._lastSelected = row;
                }
            }
            if (!event.keyCode && (event.shiftKey || ctrlKey)) {
                // prevent selection in firefox
                event.preventDefault();
            }
        }
        this._selectionTriggerEvent = null;
    }

});
});