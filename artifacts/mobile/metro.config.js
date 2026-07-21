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

// 4. Enable package.json "exports" field resolution for packages that publish
//    with modern ESM entry points (e.g. zod v3, many newer packages).
config.resolver.unstable_enablePackageExports = true;

// 5. Production bundle optimisations: minify identifiers and remove dead code.
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_classnames: true, // required for Hermes class syntax
    keep_fnames: false,
    mangle: { toplevel: false },
    output: {
      ascii_only: true,
      quote_style: 3,
      wrap_iife: true,
    },
    sourceMap: false,
    toplevel: false,
    compress: {
      reduce_funcs: false,
    },
  },
};

module.exports = config;
