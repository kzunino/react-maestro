import type { WizardGraph, WizardNode } from "react-maestro";
import { createWizardGraphFromNodes } from "react-maestro";

enum Page {
	PageA = "pageA",
	PageB = "pageB",
	PageC = "pageC",
	PageD = "pageD",
	PageE = "pageE",
}

const nodes: WizardNode[] = [
	{
		page: Page.PageA,
		next: Page.PageB,
	},
	{
		page: Page.PageB,
		previous: Page.PageA,
		next: (state) => {
			if (state.userType === "premium") return Page.PageE;
			return Page.PageC;
		},
	},
	{
		page: Page.PageC,
		previous: Page.PageB,
		next: Page.PageD,
	},
	{
		page: Page.PageD,
		previous: Page.PageC,
	},
	{
		page: Page.PageE,
		previous: Page.PageB,
		next: Page.PageD,
	},
];

export const graph: WizardGraph = createWizardGraphFromNodes(nodes, Page.PageA);

export const componentLoaders = new Map([
	[Page.PageA, () => import("./pages/PageA")],
	[Page.PageB, () => import("./pages/PageB")],
	[Page.PageC, () => import("./pages/PageC")],
	[Page.PageD, () => import("./pages/PageD")],
	[Page.PageE, () => import("./pages/PageE")],
	["__expired__", () => import("./pages/Expired")],
	["__notfound__", () => import("./pages/PageNotFound")],
]);
