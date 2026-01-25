import type { WizardGraph, WizardNode } from "react-maestro";
import {
	createWizardGraphFromNodes,
	definePageSchema,
	Wizard,
} from "react-maestro";

// Define typed schema for page A with multiple fields
const pageASchema = definePageSchema({
	type: "object",
	properties: {
		name: { type: "string" },
		age: { type: "number" },
		address: { type: "string" },
	},
});

// Define all nodes for the test wizard
const nodes: WizardNode[] = [
	{
		page: "pageA",
		form: pageASchema,
		schemaContext: pageASchema,
		next: "pageB",
	},
	{
		page: "pageB",
		form: {
			type: "object",
			properties: {
				email: { type: "string" },
				userType: { type: "string" },
			},
		},
		schemaContext: {
			type: "object",
			properties: {
				email: { type: "string" },
				userType: { type: "string" },
			},
		},
		previous: "pageA",
		// Conditional branching based on userType
		next: (state) => {
			const userType = state.userType as string | undefined;
			// Branch to pageE if userType is "premium", otherwise go to pageC
			if (userType === "premium") {
				return "pageE";
			}
			return "pageC";
		},
	},
	{
		page: "pageC",
		form: {
			type: "object",
			properties: {},
		},
		schemaContext: {
			type: "object",
			properties: {},
		},
		previous: "pageB",
		next: "pageD",
	},
	{
		page: "pageD",
		form: {
			type: "object",
			properties: {
				confirm: { type: "boolean" },
			},
		},
		schemaContext: {
			type: "object",
			properties: {
				confirm: { type: "boolean" },
			},
		},
		previous: "pageC",
	},
	// New branch page for premium users
	{
		page: "pageE",
		form: {
			type: "object",
			properties: {
				premiumFeature: { type: "string" },
			},
		},
		schemaContext: {
			type: "object",
			properties: {
				premiumFeature: { type: "string" },
			},
		},
		previous: "pageB",
		next: "pageD", // Both branches converge on pageD
	},
];

// Create the graph
const graph: WizardGraph = createWizardGraphFromNodes(nodes, "pageA");

const componentLoaders = new Map([
	["pageA", () => import("./pages/PageA")],
	["pageB", () => import("./pages/PageB")],
	["pageC", () => import("./pages/PageC")],
	["pageD", () => import("./pages/PageD")],
	["pageE", () => import("./pages/PageE")],
	["__expired__", () => import("./pages/Expired")],
	["__notfound__", () => import("./pages/PageNotFound")],
]);

const PAGE_WIDTH = "40rem";

export default function App() {
	return (
		<div className="w-full">
			<div
				style={{
					width: PAGE_WIDTH,
					maxWidth: "100%",
					marginLeft: "auto",
					marginRight: "auto",
				}}
			>
				<Wizard
					graph={graph}
					config={{
						componentLoaders,
						loadingFallback: <div />,
						unknownPageFallback: <div>Page not found</div>,
					}}
				/>
			</div>
		</div>
	);
}
