// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { getTabMetaKeyAtom, globalStore } from "@/app/store/global";
import { RpcApi } from "@/app/store/wshclientapi";
import { TabRpcClient } from "@/app/store/wshrpcutil";
import { fireAndForget } from "@/util/util";

// Amber padlock tint shown on locked tabs.
export const TabLockedColor = "#FFB400";

const TabLockedNotificationTitle = "Wave Terminal";
const TabLockedNotificationBody = "This tab is locked and cannot be closed.";

/**
 * Returns whether a tab is currently locked (close-protected).
 *
 * Reads the `tab:locked` meta synchronously from the global store so it can be
 * called from non-reactive close handlers (button, context menu, keybinding)
 * to short-circuit a close before it reaches the backend.
 */
export function isTabLocked(tabId: string): boolean {
    if (!tabId) {
        return false;
    }
    return !!globalStore.get(getTabMetaKeyAtom(tabId, "tab:locked"));
}

/**
 * Shows a system notification explaining that a locked tab cannot be closed.
 *
 * Used by close interceptors (keyboard shortcut, tab close button) so users
 * get feedback instead of a silent no-op.
 */
export function showTabLockedNotification(): void {
    fireAndForget(() =>
        RpcApi.NotifyCommand(
            TabRpcClient,
            { title: TabLockedNotificationTitle, body: TabLockedNotificationBody, silent: true },
            { noresponse: true }
        )
    );
}
