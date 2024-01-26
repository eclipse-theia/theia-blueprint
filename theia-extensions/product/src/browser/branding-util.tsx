/********************************************************************************
 * Copyright (C) 2020 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
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
            What is this?
        </h3>
        <div>
            The Eclipse Theia IDE is a modern and open IDE for cloud and desktop. The Theia IDE is based on the <ExternalBrowserLink text="Theia platform"
            url="https://theia-ide.org" windowService={windowService} ></ExternalBrowserLink>.
        </div>
        <div>
            The IDE is available as a <ExternalBrowserLink text="downloadable desktop application" url="https://theia-ide.org//#theiaidedownload"
            windowService={windowService} ></ExternalBrowserLink>. You can also <ExternalBrowserLink text="try the latest version of the Theia IDE online"
            url="https://try.theia-cloud.io/" windowService={windowService} ></ExternalBrowserLink>. The online test version is limited to 30 minutes per session and hosted
            via <ExternalBrowserLink text="Theia Cloud" url="https://theia-cloud.io/" windowService={windowService} ></ExternalBrowserLink>.
        </div>
    </div>;
}

export function renderExtendingCustomizing(windowService: WindowService): React.ReactNode {
    return <div className='gs-section'>
        <h3 className='gs-section-header'>
            Extending/Customizing the Theia IDE
        </h3>
        <div >
            You can extend the Theia IDE at runtime by installing VS Code extensions, e.g. from the <ExternalBrowserLink text="OpenVSX registry" url="https://open-vsx.org/"
            windowService={windowService} ></ExternalBrowserLink>, an open marketplace for VS Code extensions. Just open the extension view or browse <ExternalBrowserLink
            text="OpenVSX online" url="https://open-vsx.org/" windowService={windowService} ></ExternalBrowserLink>.
        </div>
        <div>
            Furthermore, the Theia IDE is based on the flexible Theia platform. Therefore, the Theia IDE can serve as a <span className='gs-text-bold'>template</span> for building
            custom tools and IDEs. Browse <ExternalBrowserLink text="the documentation" url="https://theia-ide.org/docs/composing_applications/"
            windowService={windowService} ></ExternalBrowserLink> to help you customize and build your own Eclipse Theia-based product.
        </div>
    </div>;
}

export function renderSupport(windowService: WindowService): React.ReactNode {
    return <div className='gs-section'>
        <h3 className='gs-section-header'>
            Professional Support
        </h3>
        <div>
            Professional support, implementation services, consulting and training for building tools like Theia IDE and for building other tools based on Eclipse Theia is
            available by selected companies as listed on the <ExternalBrowserLink text=" Theia support page" url="https://theia-ide.org/support/"
            windowService={windowService} ></ExternalBrowserLink>.
        </div>
    </div>;
}

export function renderTickets(windowService: WindowService): React.ReactNode {
    return <div className='gs-section'>
        <h3 className='gs-section-header'>
            Reporting feature requests and bugs
        </h3>
        <div >
            The features in the Eclipse Theia IDE are based on Theia and the included
            extensions/plugins. For bugs in Theia please consider opening an issue in
            the <ExternalBrowserLink text="Theia project on Github" url="https://github.com/eclipse-theia/theia/issues/new/choose"
                windowService={windowService} ></ExternalBrowserLink>.
        </div>
        <div>
            Eclipse Theia IDE only packages existing functionality into a product and installers
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
            The source code of Eclipse Theia IDE is available
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
            Please see the <ExternalBrowserLink text="documentation" url="https://theia-ide.org/docs/user_getting_started/"
            windowService={windowService} ></ExternalBrowserLink> on how to use the Theia IDE.
        </div>
    </div>;
}

export function renderDownloads(): React.ReactNode {
    return <div className='gs-section'>
        <h3 className='gs-section-header'>
            Updates and Downloads
        </h3>
        <div className='gs-action-container'>
            You can update Eclipse Theia IDE directly in this application by navigating to
            File {'>'} Preferences {'>'} Check for Updates… Moreover the application will check for updates
            after each launch automatically.
        </div>
        <div className='gs-action-container'>
            Alternatively you can download the most recent version from the download page.
        </div>
    </div>;
}
