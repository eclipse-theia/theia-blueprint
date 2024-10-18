/********************************************************************************
 * Copyright (C) 2020 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import * as React from 'react';

import { Message, PreferenceService } from '@theia/core/lib/browser';
import { inject, injectable } from '@theia/core/shared/inversify';
import {
    renderDocumentation, renderDownloads, renderExtendingCustomizing, renderSourceCode, renderSupport, renderTickets, renderWhatIs, renderCollaboration
} from './branding-util';

import { GettingStartedWidget } from '@theia/getting-started/lib/browser/getting-started-widget';
import { VSXEnvironment } from '@theia/vsx-registry/lib/common/vsx-environment';
import { WindowService } from '@theia/core/lib/browser/window/window-service';

@injectable()
export class TheiaIDEGettingStartedWidget extends GettingStartedWidget {

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
            <div className='gs-content-container'>
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
                        {renderExtendingCustomizing(this.windowService)}
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
                        {this.renderAIBanner()}
                    </div>
                </div>
                <div className='flex-grid'>
                    <div className='col'>
                        {renderCollaboration(this.windowService)}
                    </div>
                </div>
                <div className='flex-grid'>
                    <div className='col'>
                        {renderDownloads()}
                    </div>
                </div>
            </div>
            <div className='gs-preference-container'>
                {this.renderPreferences()}
            </div>
        </div>;
    }

    protected renderActions(): React.ReactNode {
        return <div className='gs-container'>
            <div className='flex-grid'>
                <div className='col'>
                    {this.renderStart()}
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
            <h1>Eclipse Theia <span className='gs-blue-header'>IDE</span></h1>
            {this.renderVersion()}
        </div>;
    }

    protected renderVersion(): React.ReactNode {
        return <div>
            <p className='gs-sub-header' >
                {this.applicationInfo ? 'Version ' + this.applicationInfo.version : '-'}
            </p>

            <p className='gs-sub-header' >
                {'VS Code API Version: ' + this.vscodeApiVersion}
            </p>
        </div>;
    }

    protected renderAIBanner(): React.ReactNode {
        return <div className='gs-section'>
            <div className='flex-grid'>
                <div className='col'>
                    <h3 className='gs-section-header'> 🚀 AI Support in the Theia IDE is available! [Experimental] ✨</h3>

                    <div className='gs-action-container'>
                        Theia IDE now contains experimental AI support, which offers early access to cutting-edge AI capabilities within your IDE.
                        <br />
                        Please note that these features are disabled by default, ensuring that users can opt-in at their discretion.
                        For those who choose to enable AI support, it is important to be aware that these experimental features may generate continuous
                        requests to the language models (LLMs) you provide access to. This might incur costs that you need to monitor closely.
                        <br />
                        For more details, please visit &nbsp;
                        <a
                            role={'button'}
                            tabIndex={0}
                            onClick={() => this.doOpenExternalLink(this.theiaAIDocUrl)}
                            onKeyDown={(e: React.KeyboardEvent) => this.doOpenExternalLinkEnter(e, this.theiaAIDocUrl)}>
                            {'the documentation'}
                        </a>.
                        <br />
                        <br />
                        🚧 Please note that this feature is currently in development and may undergo frequent changes.
                        We welcome your feedback, contributions, and sponsorship! To support the ongoing development of the AI capabilities please visit the&nbsp;
                        <a
                            role={'button'}
                            tabIndex={0}
                            onClick={() => this.doOpenExternalLink(this.ghProjectUrl)}
                            onKeyDown={(e: React.KeyboardEvent) => this.doOpenExternalLinkEnter(e, this.ghProjectUrl)}>
                            {'Github Project'}
                        </a>.
                        &nbsp;Thank you for being part of our community!
                    </div>
                    <div className='gs-action-container'>
                        <a
                            role={'button'}
                            style={{ fontSize: 'var(--theia-ui-font-size2)' }}
                            tabIndex={0}
                            onClick={() => this.doOpenAIChatView()}
                            onKeyDown={(e: React.KeyboardEvent) => this.doOpenAIChatViewEnter(e)}>
                            {'Open the AI Chat View now to learn how to start! ✨'}
                        </a>
                    </div>
                </div>
            </div>
        </div>;
    }
}
