import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import packageJson from "./package.json" with { type: "json" };

export default defineConfig(({ mode }) => ({
	plugins: [react()],
	base: mode === "github-pages" ? "/poke-type-quiz/" : "/poke-type-quiz/",
	define: {
		__APP_VERSION__: JSON.stringify(packageJson.version),
	},
}));
