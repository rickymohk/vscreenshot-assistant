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

import * as React from 'react';

import { Preferences } from '../../../lib/prefs';
import { LocalizedText } from '../../../lib/components/LocalizedText';
import PreferenceBlock from './PreferenceBlock';
import SwitchControl from './SwitchControl';
import ControlGroup from './ControlGroup';
import HotkeyInputControl from './HotkeyInputControl';
import LabeledControl from './LabeledControl';

const GeneralPreferences: React.FC = () => {
    return (
        <PreferenceBlock name="General">
            <ControlGroup>
                <LabeledControl label={<LocalizedText messageId="prefsGeneralHotkey" />}>
                    <HotkeyInputControl<Preferences> name="general.captureHotkey" w="12em" />
                </LabeledControl>
            </ControlGroup>
            <ControlGroup isEnabledHover>
                <LabeledControl label={<LocalizedText messageId="prefsGeneralClipboardCopy" />}>
                    <SwitchControl<Preferences> name="general.copyClipboard" />
                </LabeledControl>
            </ControlGroup>
            <ControlGroup isEnabledHover>
                <LabeledControl label={<LocalizedText messageId="prefsGeneralNotifyToast" />}>
                    <SwitchControl<Preferences> name="general.notifyToast" />
                </LabeledControl>
            </ControlGroup>
        </PreferenceBlock>
    );
};

export default GeneralPreferences;
