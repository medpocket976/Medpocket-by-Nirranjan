const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo so Metro picks up workspace changes
config.watchFolders = [workspaceRoot];

// 2. Resolve node_modules from the app first, then the monorepo root.
//    This is the correct order for pnpm workspaces.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// 3. CRITICAL for pnpm: disable hierarchical lookup so Metro never walks UP
//    past the app root looking for node_modules. Without this, Metro can
//    pick up packages from a parent directory (e.g. the monorepo root's
//    expo/AppEntry.js) instead of the app's own expo-router/entry.
config.resolver.disableHierarchicalLookup = true;

// 4. Enable symlink support — pnpm uses symlinks for its virtual store
//    (.pnpm), so Metro must be able to follow them to find real packages.
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
