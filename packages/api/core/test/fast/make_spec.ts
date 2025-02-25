import { expect } from 'chai';
import { ForgeMakeResult } from '@electron-forge/shared-types';
import * as path from 'path';
import proxyquire from 'proxyquire';

import { MakeOptions } from '../../src/api';
import make from '../../src/api/make';

describe('make', () => {
  const fixtureDir = path.resolve(__dirname, '..', 'fixture');

  describe('overrideTargets inherits from forge config', () => {
    let stubbedMake: (opts: MakeOptions) => Promise<ForgeMakeResult[]>;

    before(() => {
      const electronPath = path.resolve(__dirname, 'node_modules/electron');
      stubbedMake = proxyquire.noCallThru().load('../../src/api/make', {
        '../util/electron-version': {
          getElectronModulePath: () => Promise.resolve(electronPath),
          getElectronVersion: () => Promise.resolve('1.0.0'),
        },
      }).default;
    });

    it('passes config properly', async () => {
      const results = await stubbedMake({
        arch: 'x64',
        dir: path.join(fixtureDir, 'app-with-custom-maker-config'),
        overrideTargets: ['../custom-maker'],
        platform: 'linux',
        skipPackage: true,
      });

      expect(results[0].artifacts).to.deep.equal(['from config']);
    });

    after(() => proxyquire.callThru());
  });

  describe('maker config validation', () => {
    it('throws an error if the name is missing', async () => {
      await expect(
        make({
          arch: 'x64',
          dir: path.join(fixtureDir, 'maker-sans-name'),
          platform: 'linux',
          skipPackage: true,
        })
      ).to.eventually.be.rejectedWith(/^The following maker config is missing a maker name:/);
    });

    it('throws an error if the name is not a string', async () => {
      await expect(
        make({
          arch: 'x64',
          dir: path.join(fixtureDir, 'maker-name-wrong-type'),
          platform: 'linux',
          skipPackage: true,
        })
      ).to.eventually.be.rejectedWith(/^The following maker config has a maker name that is not a string:/);
    });
  });
});
