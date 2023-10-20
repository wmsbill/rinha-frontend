import esbuild from "esbuild";

esbuild.build({
  entryPoints: ["src/db.js", "src/file-parser.js"],
  outdir: "dist",
  bundle: true,
  // minify: true,
});
