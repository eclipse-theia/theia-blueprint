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

import { renderDocumentation, renderDownloads, renderSourceCode, renderTickets, renderWhatIs, renderWhatIsNot } from './branding-util';

import { GettingStartedWidget } from '@theia/getting-started/lib/browser/getting-started-widget';
import { injectable } from 'inversify';

@injectable()
export class TheiaBlueprintGettingStartedWidget extends GettingStartedWidget {

    protected render(): React.ReactNode {
        return <div className='gs-container'>
            <div className='gs-logo'>
            </div>
            {this.renderHeader()}
            <hr className='gs-hr' />
            <div className='flex-grid'>
                <div className='col'>
                    {renderWhatIs()}
                </div>
            </div>
            <div className='flex-grid'>
                <div className='col'>
                    {renderWhatIsNot()}
                </div>
            </div>
            <div className='flex-grid'>
                <div className='col'>
                    {renderTickets()}
                </div>
            </div>
            <div className='flex-grid'>
                <div className='col'>
                    {renderSourceCode()}
                </div>
            </div>
            <div className='flex-grid'>
                <div className='col'>
                    {renderDocumentation()}
                </div>
            </div>
            <div className='flex-grid'>
                <div className='col'>
                    {renderDownloads()}
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
        return <p className='gs-sub-header' >
            {this.applicationInfo ? 'Version ' + this.applicationInfo.version + ' (Alpha)' : '(Alpha)'}
        </p>;
    }
}