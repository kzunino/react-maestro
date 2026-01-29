import type { FlowGraph, FlowNode } from "react-maestro";
import { initializeFlow } from "react-maestro";

enum Page {
	PageA = "pageA",
	PageB = "pageB",
	PageC = "pageC",
	PageD = "pageD",
	PageE = "pageE",
}

const nodes: FlowNode[] = [
	{
		currentPage: Page.PageA,
		nextPage: Page.PageB,
	},
	{
		currentPage: Page.PageB,
		nextPage: (state) => {
			if (state.userType === "premium") return Page.PageE;
			return Page.PageC;
		},
	},
	{
		currentPage: Page.PageC,
		previousPageFallback: Page.PageB,
		nextPage: Page.PageD,
	},
	{
		currentPage: Page.PageD,
		previousPageFallback: Page.PageC,
	},
	{
		currentPage: Page.PageE,
		nextPage: Page.PageD,
	},
];

export const graph: FlowGraph = initializeFlow(nodes, Page.PageA);

export const componentLoaders = new Map([
	[Page.PageA, () => import("./pages/PageA")],
	[Page.PageB, () => import("./pages/PageB")],
	[Page.PageC, () => import("./pages/PageC")],
	[Page.PageD, () => import("./pages/PageD")],
	[Page.PageE, () => import("./pages/PageE")],
	["__expired__", () => import("./pages/Expired")],
	["__notfound__", () => import("./pages/PageNotFound")],
]);
