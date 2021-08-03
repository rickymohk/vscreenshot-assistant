/*
 *  Copyright 2021 qitoi
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import * as storage from './storage';


const PREFERENCES_KEY = 'preferences';

const FileTypes = ['image/jpeg', 'image/png'] as const;
export type FileType = typeof FileTypes[number];
const isFileType = (type: any): type is FileType => FileTypes.some(t => t === type);

export const ToastPositions = {
    LeftBottom: 0,
    RightBottom: 1,
    LeftTop: 2,
    RightTop: 3,
} as const;
export type ToastPosition = typeof ToastPositions[keyof typeof ToastPositions];
const isToastPosition = (type: any): type is ToastPosition => Object.values(ToastPositions).includes(type);

export type Preferences = {
    general: {
        captureHotkey: string,
        copyClipboard: boolean,
        notifyToast: boolean,
        notifyPosition: ToastPosition,
        notifyDuration: number,
    },
    screenshot: {
        fileType: FileType,
        quality: number,
    },
    thumbnail: {
        width: number,
        height: number,
    },
    tweet: {
        enabled: boolean,
        tweetUrl: boolean,
        tweetTitle: boolean,
        tweetAuthor: boolean,
    },
};

export const DefaultPreferences: Preferences = {
    general: {
        captureHotkey: 'alt+s',
        copyClipboard: false,
        notifyToast: true,
        notifyPosition: ToastPositions.LeftBottom,
        notifyDuration: 1000,
    },
    screenshot: {
        fileType: 'image/jpeg',
        quality: 90,
    },
    thumbnail: {
        width: 320,
        height: 180,
    },
    tweet: {
        enabled: true,
        tweetUrl: true,
        tweetTitle: true,
        tweetAuthor: false,
    },
};

function completePreferences(prefs: Preferences): Preferences {
    const completeFileType = (value?: any): FileType => isFileType(value) ? value : DefaultPreferences.screenshot.fileType;
    const completeToastPosition = (value?: any): ToastPosition => isToastPosition(value) ? value : DefaultPreferences.general.notifyPosition;
    return {
        general: {
            captureHotkey: prefs?.general?.captureHotkey || DefaultPreferences.general.captureHotkey,
            copyClipboard: Boolean(prefs?.general?.copyClipboard ?? DefaultPreferences.general.copyClipboard),
            notifyToast: Boolean(prefs?.general?.notifyToast ?? DefaultPreferences.general.notifyToast),
            notifyPosition: completeToastPosition(prefs?.general?.notifyPosition),
            notifyDuration: Math.min(Math.max(Math.round(+(prefs?.general?.notifyDuration ?? DefaultPreferences.general.notifyDuration)), 100), 60000),
        },
        screenshot: {
            fileType: completeFileType(prefs?.screenshot?.fileType),
            quality: Math.min(Math.max(Math.round(+(prefs?.screenshot?.quality ?? DefaultPreferences.screenshot.quality)), 0), 100),
        },
        thumbnail: {
            width: Math.min(Math.max(Math.round(+(prefs?.thumbnail?.width ?? DefaultPreferences.thumbnail.width)), 1), 9999),
            height: Math.min(Math.max(Math.round(+(prefs?.thumbnail?.height ?? DefaultPreferences.thumbnail.height)), 1), 9999),
        },
        tweet: {
            enabled: Boolean(prefs?.tweet?.enabled ?? DefaultPreferences.tweet.enabled),
            tweetUrl: Boolean(prefs?.tweet?.tweetUrl ?? DefaultPreferences.tweet.tweetUrl),
            tweetTitle: Boolean(prefs?.tweet?.tweetTitle ?? DefaultPreferences.tweet.tweetTitle),
            tweetAuthor: Boolean(prefs?.tweet?.tweetAuthor ?? DefaultPreferences.tweet.tweetAuthor),
        },
    };
}


export async function loadPreferences(): Promise<Preferences> {
    if (currentPreferences !== null) {
        return Promise.resolve(currentPreferences);
    }
    return storage.getItemById<Preferences>(PREFERENCES_KEY).then(prefs => completePreferences(prefs));
}

export async function savePreferences(prefs: Preferences): Promise<void> {
    return storage.setItems({ [PREFERENCES_KEY]: completePreferences(prefs) });
}


interface PreferencesEvent {
    addEventListener: (callback: (prefs: Preferences) => void) => void;
    removeEventListener: (callback: (prefs: Preferences) => void) => void;
}

let onChanged: PreferencesEvent | null = null;

export function watch(): PreferencesEvent {
    if (onChanged !== null) {
        return onChanged;
    }

    const prefsEvent = new class implements PreferencesEvent {
        callbacks: ((prefs: Preferences) => void)[] = [];

        addEventListener(callback: (prefs: Preferences) => void) {
            this.callbacks.push(callback);
        }

        removeEventListener(callback: (prefs: Preferences) => void) {
            this.callbacks = this.callbacks.filter(cb => cb !== callback);
        }

        dispatch(prefs: Preferences) {
            for (const cb of this.callbacks) {
                cb(prefs);
            }
        }
    };

    loadPreferences().then(prefs => {
        currentPreferences = completePreferences(prefs);
    });

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'local') {
            return;
        }
        for (const [key, change] of Object.entries(changes)) {
            if (key === PREFERENCES_KEY) {
                if ('newValue' in change) {
                    currentPreferences = completePreferences(change.newValue as Preferences);
                }
                else {
                    currentPreferences = DefaultPreferences;
                }
                prefsEvent.dispatch(currentPreferences);
                break;
            }
        }
    });

    onChanged = prefsEvent;
    return prefsEvent;
}

let currentPreferences: Preferences | null = null;
