import { ApplicationPackage, NodePackage } from '@theia/application-package';
import { BackendApplicationCliContribution, BackendApplicationContribution } from '@theia/core/lib/node';
import { PluginDeployerParticipant } from '@theia/plugin-ext';
import { ContainerModule, injectable } from 'inversify';
import { installationPath, getAppResourcePath } from './theia-blueprint-application';
import express = require('express');

/**
 * This value should be contributed by Webpack's `DefinePlugin`.
 */
declare const _THEIA_BLUEPRINT_PACKAGE: NodePackage;

export default new ContainerModule((bind, unbind, isBound, rebind) => {
    bind<PluginDeployerParticipant>(PluginDeployerParticipant).toConstantValue({
        onWillStart: async context => {
            context.systemEntries.push(`local-dir:${getAppResourcePath('builtins')}`);
        }
    });
    bind<BackendApplicationContribution>(BackendApplicationContribution).toConstantValue({
        configure: app => {
            app.use(express.static(getAppResourcePath('lib')));
        }
    });
    rebind(BackendApplicationCliContribution).to(BlueprintBackendApplicationCliContribution).inSingletonScope();
    rebind(ApplicationPackage).toDynamicValue(ctx => new BlueprintApplicationPackage({
        projectPath: installationPath,
    })).inSingletonScope();
});

@injectable()
class BlueprintBackendApplicationCliContribution extends BackendApplicationCliContribution {
    protected appProjectPath(): string {
        return installationPath;
    }
}

class BlueprintApplicationPackage extends ApplicationPackage {
    get pck(): NodePackage {
        return _THEIA_BLUEPRINT_PACKAGE
    }
}
