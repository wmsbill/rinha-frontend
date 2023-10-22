import esbuild from "esbuild";

esbuild.build({
  entryPoints: ["src/file-parser.js"],
  outdir: "dist/js",
  bundle: true,
  // minify: true,
});
