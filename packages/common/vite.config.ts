import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        "types/index": resolve(__dirname, "src/types/index.ts"),
        "constants/index": resolve(__dirname, "src/constants/index.ts"),
        "algorithms/index": resolve(__dirname, "src/algorithms/index.ts"),
      },
      formats: ["es"],
      fileName: (format, entryName) => `${entryName}.js`,
    },
    outDir: "dist",
    emptyDirBeforeWrite: true,
    sourcemap: true,
  },
  plugins: [
    dts({
      include: ["src/**/*"],
      outDir: "dist",
    }),
  ],
});
