/********************************************************************************
 * Copyright (C) 2020 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import * as React from 'react';
import { inject, injectable } from '@theia/core/shared/inversify';
import { renderDocumentation, renderDownloads, renderSourceCode, renderSupport, renderTickets, renderWhatIs, renderWhatIsNot } from './branding-util';
import { GettingStartedWidget } from '@theia/getting-started/lib/browser/getting-started-widget';
import { VSXEnvironment } from '@theia/vsx-registry/lib/common/vsx-environment';
import { WindowService } from '@theia/core/lib/browser/window/window-service';
import { Message, PreferenceService } from '@theia/core/lib/browser';
import { BlueprintPreferences } from './theia-blueprint-preferences';

@injectable()
export class TheiaBlueprintGettingStartedWidget extends GettingStartedWidget {

    @inject(VSXEnvironment)
    protected readonly environment: VSXEnvironment;

    @inject(WindowService)
    protected readonly windowService: WindowService;

    @inject(PreferenceService)
    protected readonly preferenceService: PreferenceService;

    protected vscodeApiVersion: string;

    protected async doInit(): Promise<void> {
        super.doInit();
        this.vscodeApiVersion = await this.environment.getVscodeApiVersion();
        await this.preferenceService.ready;
        this.update();
    }

    protected onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        const htmlElement = document.getElementById('alwaysShowWelcomePage');
        if (htmlElement) {
            htmlElement.focus();
        }
    }

    protected render(): React.ReactNode {
        return <div className='gs-container'>
            <div className='gs-float'>
                <div className='gs-logo'>
                </div>
                {this.renderActions()}
            </div>
            {this.renderHeader()}
            <hr className='gs-hr' />
            <div className='flex-grid'>
                <div className='col'>
                    {renderWhatIs(this.windowService)}
                </div>
            </div>
            <div className='flex-grid'>
                <div className='col'>
                    {renderWhatIsNot()}
                </div>
            </div>
            <div className='flex-grid'>
                <div className='col'>
                    {renderSupport(this.windowService)}
                </div>
            </div>
            <div className='flex-grid'>
                <div className='col'>
                    {renderTickets(this.windowService)}
                </div>
            </div>
            <div className='flex-grid'>
                <div className='col'>
                    {renderSourceCode(this.windowService)}
                </div>
            </div>
            <div className='flex-grid'>
                <div className='col'>
                    {renderDocumentation(this.windowService)}
                </div>
            </div>
            <div className='flex-grid'>
                <div className='col'>
                    {renderDownloads()}
                </div>
            </div>
            <div className='flex-grid'>
                <div className='col'>
                    {this.renderPreferences()}
                </div>
            </div>
        </div>;
    }

    protected renderActions(): React.ReactNode {
        return <div className='gs-container'>
            <div className='flex-grid'>
                <div className='col'>
                    {this.renderOpen()}
                </div>
            </div>
            <div className='flex-grid'>
                <div className='col'>
                    {this.renderRecentWorkspaces()}
                </div>
            </div>
            <div className='flex-grid'>
                <div className='col'>
                    {this.renderSettings()}
                </div>
            </div>
            <div className='flex-grid'>
                <div className='col'>
                    {this.renderHelp()}
                </div>
            </div>
        </div>;
    }

    protected renderHeader(): React.ReactNode {
        return <div className='gs-header'>
            <h1>Eclipse Theia <span className='gs-blue-header'>Blueprint</span></h1>
            {this.renderVersion()}
        </div>;
    }

    protected renderVersion(): React.ReactNode {
        return <div>
            <p className='gs-sub-header' >
                {this.applicationInfo ? 'Version ' + this.applicationInfo.version + ' (Beta)' : '(Beta)'}
            </p>

            <p className='gs-sub-header' >
                {'VS Code API Version: ' + this.vscodeApiVersion}
            </p>
        </div>;
    }

    protected renderPreferences(): React.ReactNode {
        return <GSPreferences preferenceService={this.preferenceService}></GSPreferences>;
    }
}

export interface PreferencesProps {
    preferenceService: PreferenceService;
}

function GSPreferences(props: PreferencesProps): JSX.Element {
    const [alwaysShowWelcomePage, setAlwaysShowWelcomePage] = React.useState<boolean>(props.preferenceService.get(BlueprintPreferences.alwaysShowWelcomePage, true));
    React.useEffect(() => {
        const preflistener = props.preferenceService.onPreferenceChanged(change => {
            if (change.preferenceName === BlueprintPreferences.alwaysShowWelcomePage) {
                const prefValue: boolean = change.newValue;
                console.info('Set blueprint.alwaysShowWelcomePage checkbox state to ' + prefValue);
                setAlwaysShowWelcomePage(prefValue);
            }
        });
        return () => preflistener.dispose();
    }, [props.preferenceService]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newChecked = e.target.checked;
        console.info('Set blueprint.alwaysShowWelcomePage pref to ' + newChecked);
        props.preferenceService.updateValue(BlueprintPreferences.alwaysShowWelcomePage, newChecked);
    };
    return <div className='gs-preference'>
        <input type="checkbox" className="theia-input" id="alwaysShowWelcomePage" onChange={handleChange} checked={alwaysShowWelcomePage}></input>
        <label htmlFor="alwaysShowWelcomePage">Show Welcome Page after every start of the application</label>
    </div>;
}
