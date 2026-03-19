const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const sdkRoot = path.resolve(__dirname, '..');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [sdkRoot],
  resolver: {
    // Only look for node_modules in the example's own directory.
    // The parent SDK's source files are accessible via watchFolders,
    // but its node_modules (which has an older react-native) should NOT
    // be used for module resolution.
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
    ],
    // Block the parent SDK's node_modules from being resolved
    blockList: exclusionList([
      new RegExp(path.resolve(sdkRoot, 'node_modules') + '/.*'),
    ]),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
