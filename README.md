# steam-cef-repaint

A GNOME Shell extension that works around Steam CEF web surfaces going black on workspace switch under GNOME/Wayland.

## Bug

Steam webhelper CEF surfaces go black on GNOME 49 / Wayland / openSUSE Tumbleweed when switching workspaces. Native Steam UI repaints correctly; only CEF-rendered web surfaces (store, library) go black. Maximize/minimize forces a repaint.

Upstream bug report: https://github.com/ValveSoftware/steam-for-linux/issues/10869

## Findings

- `steamui.so` constructs and passes webhelper flags internally — `STEAM_CEF_ARGS` is not implemented in `steam.sh` on this build and is silently ignored
- The only injection point is `ubuntu12_64/steamwebhelper_sniper_wrap.sh`, but Steam checksums its own files and self-repairs on next launch (`BVerifyInstalledFiles: steamwebhelper_sniper_wrap.sh is 655 bytes, expected 623`)
- With GPU acceleration enabled, webhelper is launched with no `--disable-gpu` flags, confirming this is not a GPU path issue
- `GDK_BACKEND=x11` does not resolve it, ruling out a pure Wayland compositor (Mutter) repaint signaling issue
- gamescope nested mode (`-e`) falls back to headless backend under GNOME and never presents a window, so that path is also blocked
- Root cause appears to be CEF not receiving damage/expose events for its render surfaces when the window loses visibility across workspace switches, and not repainting on reactivation — independent of GPU acceleration state and display backend

## Workaround

Hooks into GNOME Shell's `workspace-switched` signal and forces a minimize/restore cycle on the Steam window, triggering a full CEF surface redraw.

## Install

```bash
mkdir -p ~/.local/share/gnome-shell/extensions/steam-cef-repaint@kodefabrik.github.com
cp metadata.json extension.js ~/.local/share/gnome-shell/extensions/steam-cef-repaint@kodefabrik.github.com/
```

Log out and back in, then:

```bash
gnome-extensions enable steam-cef-repaint@kodefabrik.github.com
```

## Tested on

- openSUSE Tumbleweed 20260317
- GNOME 49, Wayland
- Intel Iris Xe (ADL GT2), Mesa 26.0.2
- Steam build 1773426488

Valve, fix it. 😄
