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
            <div className='gs-logo'>
            </div>
            {this.renderHeader()}
            <hr className='gs-hr' />
            <div className='flex-grid'>
                <div className='col'>
                    {this.renderWhatIs()}
                </div>
            </div>
            <div className='flex-grid'>
                <div className='col'>
                    {this.renderWhatIsNot()}
                </div>
            </div>
            <div className='flex-grid'>
                <div className='col'>
                    {this.renderTickets()}
                </div>
            </div>
            <div className='flex-grid'>
                <div className='col'>
                    {this.renderSourceCode()}
                </div>
            </div>
            <div className='flex-grid'>
                <div className='col'>
                    {this.renderDocumentation()}
                </div>
            </div>
            <div className='flex-grid'>
                <div className='col'>
                    {this.renderDownloads()}
                </div>
            </div>
        </div>;
    }

    protected renderHeader(): React.ReactNode {
        return <div className='gs-header'>
            <h1>Eclipse Theia <span className='gs-blue-header'>Blueprint</span> Product</h1>
            {this.renderVersion()}
        </div>;
    }

    protected renderVersion(): React.ReactNode {
        return <p className='gs-sub-header' >
            {this.applicationInfo ? 'Version ' + this.applicationInfo.version + ' (Alpha)' : '(Alpha)'}
        </p>;
    }

    protected renderWhatIs(): React.ReactNode {
        return <div className='gs-section'>
            <h3 className='gs-section-header'>
                What is this?
            </h3>
            {/* Once available we should link the customization documention in below text */}
            <div >
                Eclipse Theia Blueprint product is a <span className='gs-text-bold'>template</span> to showcase
                the capabilities of Theia as well as how to build desktop-based products based on the platform.
                Theia Blueprint assembles a selected subset of existing Theia features and extensions. We
                provide installers for Theia Blueprint to be downloaded (see below) as well
                as <a href='https://github.com/eclipse-theia/theia-example' target='_blank'>documentation</a> on
                how to customize this template to build a product and installers for your own Theia-based
                product.
            </div>
        </div>;
    }

    protected renderWhatIsNot(): React.ReactNode {
        return <div className='gs-section'>
            <h3 className='gs-section-header'>
                What is it not?
            </h3>
            <div >
                Eclipse Theia Blueprint product
                is <span className='gs-text-bold'><span className='gs-text-underline'>not</span> a production-ready
                product</span>. Therefore, it is also not a replacement for Visual Studio Code or any other IDE.
            </div>
        </div>;
    }

    protected renderTickets(): React.ReactNode {
        return <div className='gs-section'>
            <h3 className='gs-section-header'>
                Reporting feature requests and bugs
            </h3>
            <div >
                The features in the Eclipse Theia Blueprint product are based on Theia and the included
                extensions/plugins. For bugs in Theia please consider opening an issue in
                the <a href='https://github.com/eclipse-theia/theia/issues/new/choose' target='_blank'>Theia
                project on Github</a>.
            </div>
            <div>
                Eclipse Theia Blueprint product only packages existing functionality into a product and installers
                for the product. If you believe there is a mistake in packaging, something needs to be added to the
                packaging or the installers do not work properly,
                please <a href='https://github.com/eclipse-theia/theia-example/issues/new/choose' target='_blank'>open
                an issue on Github</a> to let us know.
            </div>
        </div>;
    }

    protected renderSourceCode(): React.ReactNode {
        return <div className='gs-section'>
            <h3 className='gs-section-header'>
                Source Code
            </h3>
            <div >
                The source code of the Eclipse Theia Blueprint product is available
                on <a href='https://github.com/eclipse-theia/theia-example' target='_blank'>Github</a>.
            </div>
        </div>;
    }

    protected renderDocumentation(): React.ReactNode {
        return <div className='gs-section'>
            <h3 className='gs-section-header'>
                Source Code
            </h3>
            {/* Once available we should link the customization documention in below text */}
            <div >
                Please see <a href='https://github.com/eclipse-theia/theia-example' target='_blank'>here</a> for
                documentation how to customize the Eclipse Theia Blueprint product
            </div>
        </div>;
    }

    protected renderDownloads(): React.ReactNode {
        return <div className='gs-section'>
            <h3 className='gs-section-header'>
                Updates and Downloads
            </h3>
            <div className='gs-action-container'>
                You can update the Eclipse Theia Blueprint product directly in this application by navigating to
                File {'>'} Settings {'>'} Check for Updates… Moreover the application will check for Updates
                after each launch automatically.
            </div>
            <div className='gs-action-container'>
                Alternatively you can download the most recent version from the download page.
            </div>
        </div>;
    }
}