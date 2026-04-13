import GLib from 'gi://GLib';

let workspaceSwitchedSignal = null;

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
    }

    _repaintSteam() {
        const workspace = global.workspace_manager.get_active_workspace();
        const windows = workspace.list_windows();
        for (const win of windows) {
            if (win.get_wm_class()?.toLowerCase().includes('steam')) {
                win.minimize();
                GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1, () => {
                    win.unminimize();
                    return GLib.SOURCE_REMOVE;
                });
            }
        }
    }
}
