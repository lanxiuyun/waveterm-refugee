// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { RpcApi } from "@/app/store/wshclientapi";
import { TabRpcClient } from "@/app/store/wshrpcutil";
import { fireAndForget, NullAtom } from "@/util/util";
import { atom, Atom, PrimitiveAtom } from "jotai";
import { globalStore } from "./jotaiStore";
import { waveEventSubscribeSingle } from "./wps";

export type TabIndicator = {
    icon?: string;
    color?: string;
    priority?: number;
    clearonfocus?: boolean;
};

export type TabIndicatorEventData = {
    tabid: string;
    indicator?: TabIndicator | null;
};

const TabIndicatorAtomCache = new Map<string, PrimitiveAtom<TabIndicator | null>>();

function getTabIndicatorAtom(tabId: string): Atom<TabIndicator | null> {
    if (tabId == null) {
        return NullAtom as Atom<TabIndicator | null>;
    }
    let rtn = TabIndicatorAtomCache.get(tabId);
    if (rtn == null) {
        rtn = atom<TabIndicator | null>(null);
        TabIndicatorAtomCache.set(tabId, rtn);
    }
    return rtn;
}

function clearTabIndicator(tabId: string) {
    const indicatorAtom = TabIndicatorAtomCache.get(tabId);
    if (indicatorAtom != null) {
        globalStore.set(indicatorAtom, null);
    }
    const eventData: WaveEvent = {
        event: "tabindicator",
        scopes: [`tab:${tabId}`],
        data: { tabid: tabId, indicator: null } as TabIndicatorEventData,
    };
    fireAndForget(() => RpcApi.EventPublishCommand(TabRpcClient, eventData));
}

function clearTabIndicatorFromFocus(tabId: string) {
    const indicator = globalStore.get(getTabIndicatorAtom(tabId));
    if (indicator?.clearonfocus) {
        clearTabIndicator(tabId);
    }
}

function clearAllTabIndicators() {
    for (const [tabId, indicatorAtom] of TabIndicatorAtomCache) {
        globalStore.set(indicatorAtom, null);
        const eventData: WaveEvent = {
            event: "tabindicator",
            scopes: [`tab:${tabId}`],
            data: { tabid: tabId, indicator: null } as TabIndicatorEventData,
        };
        fireAndForget(() => RpcApi.EventPublishCommand(TabRpcClient, eventData));
    }
}

function setupTabIndicatorsSubscription() {
    waveEventSubscribeSingle({
        eventType: "tabindicator",
        handler: (event) => {
            const data = event.data as TabIndicatorEventData | undefined;
            if (data?.tabid == null) {
                return;
            }
            const indicatorAtom = getTabIndicatorAtom(data.tabid) as PrimitiveAtom<TabIndicator | null>;
            globalStore.set(indicatorAtom, data.indicator ?? null);
        },
    });
}

export {
    clearAllTabIndicators,
    clearTabIndicator,
    clearTabIndicatorFromFocus,
    getTabIndicatorAtom,
    setupTabIndicatorsSubscription,
};
