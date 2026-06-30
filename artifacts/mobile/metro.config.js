const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo so Metro hot-reloads workspace changes.
config.watchFolders = [workspaceRoot];

// 2. Tell Metro where to look for modules: app-local first, then monorepo root.
//    pnpm stores transitive deps next to their parent packages inside the
//    virtual store (.pnpm/), so Metro's normal hierarchical lookup finds them
//    naturally — do NOT set disableHierarchicalLookup here, as that would
//    block resolution of transitive deps (whatwg-fetch, @babel/runtime, etc.)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// 3. pnpm uses symlinks for its virtual store (.pnpm); Metro must follow them.
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
