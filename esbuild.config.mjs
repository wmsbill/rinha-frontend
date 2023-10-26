import esbuild from "esbuild";

esbuild.build({
  entryPoints: ["src/file-parser.js", "src/json-renderer.js"],
  outdir: "dist/js",
  bundle: true,
  format: "esm",
  platform: "browser",
  treeShaking: true,
  // minify: true,
});
