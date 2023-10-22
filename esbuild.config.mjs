import esbuild from "esbuild";

esbuild.build({
  entryPoints: ["src/file-parser.js"],
  outdir: "dist",
  bundle: true,
  // minify: true,
});
