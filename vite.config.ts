import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import packageJson from "./package.json" with { type: "json" };
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  base: "/poke-type-quiz/",
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "mui-x",
              test: /node_modules.*[\\/]@mui[\\/]x-/,
              priority: 30,
            },
            {
              name: "mui",
              test: /node_modules[\\/](?:@mui|@emotion)[\\/]/,
              priority: 20,
            },
            {
              name: "react",
              test: /node_modules[\\/](?:react|react-dom|scheduler)[\\/]/,
              priority: 20,
            },
            {
              name: "vendor",
              test: /node_modules/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
});
