import GLib from 'gi://GLib';

let workspaceSwitchedSignal = null;
let repaintTimeout = null;

export default class SteamRepaintExtension {
    enable() {
        workspaceSwitchedSignal = global.workspace_manager.connect(
            'workspace-switched',
            () => this._repaintSteam()
        );
    }

    disable() {
        if (workspaceSwitchedSignal) {
            global.workspace_manager.disconnect(workspaceSwitchedSignal);
            workspaceSwitchedSignal = null;
        }
        if (repaintTimeout) {
            GLib.source_remove(repaintTimeout);
            repaintTimeout = null;
        }
    }

    _repaintSteam() {
        const workspace = global.workspace_manager.get_active_workspace();
        const windows = workspace.list_windows();
        for (const win of windows) {
            if (win.get_wm_class()?.toLowerCase().includes('steam')) {
                win.minimize();
                repaintTimeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1, () => {
                    win.unminimize();
                    repaintTimeout = null;
                    return GLib.SOURCE_REMOVE;
                });
            }
        }
    }
}
