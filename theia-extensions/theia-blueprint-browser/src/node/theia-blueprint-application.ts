import * as path from 'path';
/**
 * When packaged as an executable, this is the folder where the exe is located.
 */
export const installationPath = path.dirname(process.execPath);
/**
 * Get a path relative to the installation folder's path.
 */
export function getAppResourcePath(...parts: string[]): string {
    return path.resolve(installationPath, ...parts);
}
