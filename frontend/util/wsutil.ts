// Copyright 2025, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import type { WebSocket as NodeWebSocketType } from "ws";

let NodeWebSocket: typeof NodeWebSocketType = null;
let nodeWebSocketReadyPromise: Promise<void> = Promise.resolve();

function isNodeLikeEnvironment(): boolean {
    return typeof window === "undefined" || (typeof process !== "undefined" && process.type === "browser");
}

if (isNodeLikeEnvironment()) {
    // Dynamic import is necessary to avoid issues with Rollup:
    // https://github.com/websockets/ws/issues/2057
    nodeWebSocketReadyPromise = import("ws")
        .then((ws) => {
            NodeWebSocket = ws.default;
        })
        .catch((e) => {
            console.log("Error importing 'ws':", e);
        });
}

type ComboWebSocket = NodeWebSocketType | WebSocket;

async function newWebSocket(url: string, headers: { [key: string]: string }): Promise<ComboWebSocket> {
    if (isNodeLikeEnvironment()) {
        // Ensure the Node WebSocket implementation is loaded before falling back
        // to the browser WebSocket, which is undefined in Electron main process.
        await nodeWebSocketReadyPromise;
    }
    if (NodeWebSocket) {
        return new NodeWebSocket(url, { headers });
    }
    if (typeof WebSocket === "undefined") {
        throw new Error("WebSocket not available in this environment");
    }
    return new WebSocket(url);
}

export { newWebSocket };
export type { ComboWebSocket as WebSocket };
