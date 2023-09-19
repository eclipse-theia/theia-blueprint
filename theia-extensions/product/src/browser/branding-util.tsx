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

import { Key, KeyCode } from '@theia/core/lib/browser';
import { WindowService } from '@theia/core/lib/browser/window/window-service';
import * as React from 'react';

export interface ExternalBrowserLinkProps {
    text: string;
    url: string;
    windowService: WindowService;
}

function ExternalBrowserLink(props: ExternalBrowserLinkProps): JSX.Element {
    return <a
        role={'button'}
        tabIndex={0}
        onClick={() => openExternalLink(props.url, props.windowService)}
        onKeyDown={(e: React.KeyboardEvent) => {
            if (Key.ENTER.keyCode === KeyCode.createKeyCode(e.nativeEvent).key?.keyCode) {
                openExternalLink(props.url, props.windowService);
            }
        }}>
        {props.text}
    </a>;
}

function openExternalLink(url: string, windowService: WindowService): void {
    windowService.openNewWindow(url, { external: true });
}

export function renderWhatIs(windowService: WindowService): React.ReactNode {
    return <div className='gs-section'>
        <h3 className='gs-section-header'>
            What is Theia Blueprint?
        </h3>
        <div >
            Eclipse Theia Blueprint is a <span className='gs-text-bold'>template</span> to showcase
            the capabilities of Eclipse Theia as well as how to build desktop-based products based on the platform.
            Theia Blueprint assembles a selected subset of existing Theia features and extensions. We
            provide installers for Theia Blueprint to be downloaded (see below) as well
            as <ExternalBrowserLink text="documentation" url="https://theia-ide.org/docs/blueprint_documentation/"
                windowService={windowService} ></ExternalBrowserLink> on how to customize this template to build a
            product and installers for your own Theia-based product.
        </div>
    </div>;
}

export function renderWhatIsNot(): React.ReactNode {
    return <div className='gs-section'>
        <h3 className='gs-section-header'>
            What is it not?
        </h3>
        <div >
            Eclipse Theia Blueprint is <span className='gs-text-bold'><span className='gs-text-underline'>not</span> a production-ready
                product</span>. Therefore, it is also not a replacement for Visual Studio Code or any other IDE.
        </div>
    </div>;
}

export function renderSupport(windowService: WindowService): React.ReactNode {
    return <div className='gs-section'>
        <h3 className='gs-section-header'>
            Professional Support
        </h3>
        <div >
            Professional support, implementation services, consulting and training for building tools like this instance of Theia Blueprint and for
            building other tools based on Eclipse Theia is available by selected companies as listed on the
            <ExternalBrowserLink text=" Theia support page" url="https://theia-ide.org/support/" windowService={windowService} ></ExternalBrowserLink>.
        </div>
    </div>;
}

export function renderTickets(windowService: WindowService): React.ReactNode {
    return <div className='gs-section'>
        <h3 className='gs-section-header'>
            Reporting feature requests and bugs
        </h3>
        <div >
            The features in Eclipse Theia Blueprint are based on Theia and the included
            extensions/plugins. For bugs in Theia please consider opening an issue in
            the <ExternalBrowserLink text="Theia project on Github" url="https://github.com/eclipse-theia/theia/issues/new/choose"
                windowService={windowService} ></ExternalBrowserLink>.
        </div>
        <div>
            Eclipse Theia Blueprint only packages existing functionality into a product and installers
            for the product. If you believe there is a mistake in packaging, something needs to be added to the
            packaging or the installers do not work properly,
            please <ExternalBrowserLink text="open an issue on Github" url="https://github.com/eclipse-theia/theia-blueprint/issues/new/choose"
                windowService={windowService} ></ExternalBrowserLink> to let us know.
        </div>
    </div>;
}

export function renderSourceCode(windowService: WindowService): React.ReactNode {
    return <div className='gs-section'>
        <h3 className='gs-section-header'>
            Source Code
        </h3>
        <div >
            The source code of Eclipse Theia Blueprint is available
            on <ExternalBrowserLink text="Github" url="https://github.com/eclipse-theia/theia-blueprint"
                windowService={windowService} ></ExternalBrowserLink>.
        </div>
    </div>;
}

export function renderDocumentation(windowService: WindowService): React.ReactNode {
    return <div className='gs-section'>
        <h3 className='gs-section-header'>
            Documentation
        </h3>
        <div >
            Please see <ExternalBrowserLink text="here" url="https://theia-ide.org/docs/blueprint_documentation/"
                windowService={windowService} ></ExternalBrowserLink> for
            documentation how to customize Eclipse Theia Blueprint.
        </div>
    </div>;
}

export function renderDownloads(): React.ReactNode {
    return <div className='gs-section'>
        <h3 className='gs-section-header'>
            Updates and Downloads
        </h3>
        <div className='gs-action-container'>
            You can update Eclipse Theia Blueprint directly in this application by navigating to
            File {'>'} Settings {'>'} Check for Updates… Moreover the application will check for updates
            after each launch automatically.
        </div>
        <div className='gs-action-container'>
            Alternatively you can download the most recent version from the download page.
        </div>
    </div>;
}
