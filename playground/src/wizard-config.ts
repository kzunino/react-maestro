import type { WizardGraph, WizardNode } from "react-maestro";
import { createWizardGraphFromNodes } from "react-maestro";

const nodes: WizardNode[] = [
	{
		page: "pageA",
		form: { name: "", age: 0, address: "" },
		stateContext: { name: "", age: 0, address: "" },
		next: "pageB",
	},
	{
		page: "pageB",
		form: { email: "", userType: "" },
		stateContext: { email: "", userType: "" },
		previous: "pageA",
		next: (state) => {
			if (state.userType === "premium") return "pageE";
			return "pageC";
		},
	},
	{
		page: "pageC",
		form: {},
		stateContext: {},
		previous: "pageB",
		next: "pageD",
	},
	{
		page: "pageD",
		form: { confirm: false },
		stateContext: { confirm: false },
		previous: "pageC",
	},
	{
		page: "pageE",
		form: { premiumFeature: "" },
		stateContext: { premiumFeature: "" },
		previous: "pageB",
		next: "pageD",
	},
];

export const graph: WizardGraph = createWizardGraphFromNodes(nodes, "pageA");

export const componentLoaders = new Map([
	["pageA", () => import("./pages/PageA")],
	["pageB", () => import("./pages/PageB")],
	["pageC", () => import("./pages/PageC")],
	["pageD", () => import("./pages/PageD")],
	["pageE", () => import("./pages/PageE")],
	["__expired__", () => import("./pages/Expired")],
	["__notfound__", () => import("./pages/PageNotFound")],
]);
