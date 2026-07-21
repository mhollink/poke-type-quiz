import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import packageJson from "./package.json" with { type: "json" };

export default defineConfig(({ mode }) => ({
	plugins: [react()],
	base: mode === "github-pages" ? "/poke-type-quiz/" : "/poke-type-quiz/",
	define: {
		__APP_VERSION__: JSON.stringify(packageJson.version),
	},
	build: {
		rolldownOptions: {
			output: {
				codeSplitting: {
					groups: [
						{
							name: 'mui',
							test: /node_modules[\\/](?:@mui|@emotion)[\\/]/,
							priority: 30,
						},
						{
							name: 'react',
							test: /node_modules[\\/](?:react|react-dom|scheduler)[\\/]/,
							priority: 20,
						},
						{
							name: 'vendor',
							test: /node_modules/,
							priority: 10,
						},
					],
				},
			},
		},
	},
}));
