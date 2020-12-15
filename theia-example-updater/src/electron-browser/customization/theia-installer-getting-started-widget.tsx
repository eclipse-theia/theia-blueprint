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

import { GettingStartedWidget } from '@theia/getting-started/lib/browser/getting-started-widget';
import { injectable } from 'inversify';

@injectable() 
export class TheiaInstallerGettingStartedWidget extends GettingStartedWidget {
    
    protected render(): React.ReactNode {
        return <div className='gs-container'>
            {this.renderHeader()}
            <div className='flex-grid'>
                <div className='col'>
                    {this.renderVersion()}
                </div>
            </div>
            <hr className='gs-hr' />
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

    protected renderVersion(): React.ReactNode {
        return <div className='gs-section'>
            <div className='gs-action-container'>
                <p className='gs-sub-header' >
                    {this.applicationInfo ? 'Version ' + this.applicationInfo.version + ' (Alpha)' : '(Alpha)'}
                </p>
            </div>
        </div>;
    }
}