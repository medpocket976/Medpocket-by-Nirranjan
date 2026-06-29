const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Allow Metro to see packages installed at the monorepo root
config.watchFolders = [workspaceRoot];

// Resolve node_modules from both the app directory and the workspace root,
// so workspace-hoisted packages (expo, react-native, etc.) are always found.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

module.exports = config;
