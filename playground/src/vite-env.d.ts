/// <reference types="vite/client" />

// Allow CSS imports (side-effect imports)
declare module "*.css" {
	const css: string;
	export default css;
}
