import { useEffect, useState } from "react";
import type { WizardGraph, WizardNode } from "react-maestro";
import {
	createPathParamsAdapter,
	createWizardGraphFromNodes,
	definePageSchema,
	Wizard,
} from "react-maestro";
import Landing from "./pages/Landing";

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

// Determine which route pattern to use based on current pathname
function getRouteConfig() {
	const pathname = window.location.pathname;

	// Pattern 1: /[id]/page/[page]
	// Example: /test123/page/pageA
	const pattern1Match = pathname.match(/^\/([^/]+)\/page\/([^/]+)$/);
	if (pattern1Match) {
		return {
			type: "pattern1" as const,
			adapter: createPathParamsAdapter({
				template: "/[id]/page/[page]",
			}),
			pageParamName: "page",
			uuidParamName: "id",
		};
	}

	// Pattern 2: /[id]/[type]/[someOtherOptions]/[page]
	// Example: /xyz789/premium/feature1/pageA
	const pattern2Match = pathname.match(
		/^\/([^/]+)\/([^/]+)\/([^/]+)\/([^/]+)$/,
	);
	if (pattern2Match) {
		return {
			type: "pattern2" as const,
			adapter: createPathParamsAdapter({
				template: "/[id]/[type]/[someOtherOptions]/[page]",
			}),
			pageParamName: "page",
			uuidParamName: "id",
		};
	}

	// Default: Query params
	return {
		type: "query" as const,
		adapter: undefined, // Uses default browserUrlParamsAdapter
		pageParamName: "page",
		uuidParamName: "id",
	};
}

export default function App() {
	const [routeConfig, setRouteConfig] = useState(() => getRouteConfig());
	const [showLanding, setShowLanding] = useState(() => {
		const pathname = window.location.pathname;
		const search = window.location.search;
		// Show landing only if path is "/" and no query params
		return (pathname === "/" || pathname === "") && !search;
	});

	// Listen for navigation changes
	useEffect(() => {
		const handlePopState = () => {
			const pathname = window.location.pathname;
			const search = window.location.search;
			setShowLanding((pathname === "/" || pathname === "") && !search);
			setRouteConfig(getRouteConfig());
		};

		// Also listen for custom route change events
		const handleRouteChange = () => {
			const pathname = window.location.pathname;
			const search = window.location.search;
			setShowLanding((pathname === "/" || pathname === "") && !search);
			setRouteConfig(getRouteConfig());
		};

		window.addEventListener("popstate", handlePopState);
		window.addEventListener("routechange", handleRouteChange);
		return () => {
			window.removeEventListener("popstate", handlePopState);
			window.removeEventListener("routechange", handleRouteChange);
		};
	}, []);

	if (showLanding) {
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
					<Landing />
				</div>
			</div>
		);
	}

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
				<div className="mb-4 p-2 bg-gray-100 rounded text-sm">
					<strong>Route:</strong>{" "}
					{routeConfig.type === "query" && "Query Params"}
					{routeConfig.type === "pattern1" && "/[id]/page/[page]"}
					{routeConfig.type === "pattern2" &&
						"/[id]/[type]/[someOtherOptions]/[page]"}
					{" | "}
					<button
						type="button"
						onClick={() => {
							window.history.pushState({}, "", "/");
							window.dispatchEvent(new PopStateEvent("popstate"));
							window.dispatchEvent(new CustomEvent("routechange"));
						}}
						className="text-blue-600 hover:underline"
					>
						← Back to Landing
					</button>
				</div>
				<Wizard
					graph={graph}
					config={{
						componentLoaders,
						urlParamsAdapter: routeConfig.adapter,
						pageParamName: routeConfig.pageParamName,
						uuidParamName: routeConfig.uuidParamName,
						loadingFallback: <div />,
						unknownPageFallback: <div>Page not found</div>,
					}}
				/>
			</div>
		</div>
	);
}
