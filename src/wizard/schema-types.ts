import type { WizardNode, WizardState } from "@/wizard/types";

/**
 * Helper to create a wizard node with typed state from a plain object.
 * The state type is inferred from the stateContext object.
 *
 * @example
 * const node = createWizardNode({
 *   page: "page1",
 *   stateContext: { name: "", age: 0 },
 *   next: (state) => {
 *     // state.name and state.age are properly typed
 *     return "page2";
 *   },
 * });
 */
export function createWizardNode<
	TStateContext extends Record<string, unknown>,
	TNode extends {
		page: string;
		form?: Record<string, unknown>;
		stateContext?: TStateContext;
		next?: (state: TStateContext & WizardState) => string | string[] | null;
		previous?: string;
		shouldSkip?: (state: TStateContext & WizardState) => boolean;
	},
>(node: TNode): WizardNode {
	return node as WizardNode;
}
