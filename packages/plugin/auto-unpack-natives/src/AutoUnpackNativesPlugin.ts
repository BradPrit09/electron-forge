import { ForgeConfig, ForgeHookFn } from '@electron-forge/shared-types';
import PluginBase from '@electron-forge/plugin-base';

import { AutoUnpackNativesConfig } from './Config';

export default class AutoUnpackNativesPlugin extends PluginBase<AutoUnpackNativesConfig> {
  name = 'auto-unpack-natives';

  getHook(hookName: string): ForgeHookFn | null {
    if (hookName === 'resolveForgeConfig') {
      return this.resolveForgeConfig;
    }
    return null;
  }

  resolveForgeConfig = async (forgeConfig: ForgeConfig): Promise<ForgeConfig> => {
    if (!forgeConfig.packagerConfig) {
      forgeConfig.packagerConfig = {};
    }
    if (!forgeConfig.packagerConfig.asar) {
      throw new Error('The AutoUnpackNatives plugin requires asar to be truthy or an object');
    }
    if (forgeConfig.packagerConfig.asar === true) {
      forgeConfig.packagerConfig.asar = {};
    }
    const existingUnpack = forgeConfig.packagerConfig.asar.unpack;
    const newUnpack = '**/*.node';
    if (existingUnpack) {
      forgeConfig.packagerConfig.asar.unpack = `{${existingUnpack},${newUnpack}}`;
    } else {
      forgeConfig.packagerConfig.asar.unpack = newUnpack;
    }
    return forgeConfig;
  };
}
