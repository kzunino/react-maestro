"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Flow: () => Flow,
  FlowContext: () => FlowContext,
  Presenter: () => Presenter,
  createFlowGraph: () => createFlowGraph,
  createPathParamsAdapter: () => createPathParamsAdapter,
  createPathParamsAdapterFromProps: () => createPathParamsAdapterFromProps,
  getAllNextPages: () => getAllNextPages,
  getNextNonSkippedPage: () => getNextNonSkippedPage,
  getNextPage: () => getNextPage,
  getNode: () => getNode,
  getPagesInOrder: () => getPagesInOrder,
  getPreviousNonSkippedPage: () => getPreviousNonSkippedPage,
  getPreviousPage: () => getPreviousPage,
  initializeFlow: () => initializeFlow,
  registerNode: () => registerNode,
  resolveNextPage: () => resolveNextPage,
  shouldSkipStep: () => shouldSkipStep,
  useFlow: () => useFlow,
  useFlowContext: () => useFlowContext,
  useUrlParams: () => useUrlParams,
  validateGraph: () => validateGraph
});
module.exports = __toCommonJS(index_exports);

// src/flow/Flow.tsx
var import_react4 = require("react");

// src/flow/FlowContext.tsx
var import_react = require("react");
var FlowContext = (0, import_react.createContext)(null);
function useFlowContext() {
  const context = (0, import_react.useContext)(FlowContext);
  if (!context) {
    throw new Error("useFlowContext must be used within a Flow component");
  }
  return context;
}

// src/flow/graphHelpers.ts
function createFlowGraph() {
  return {
    nodes: /* @__PURE__ */ new Map()
  };
}
function registerNode(graph, node) {
  if (graph.nodes.has(node.currentPage)) {
    throw new Error(
      `Node with currentPage "${node.currentPage}" already exists in graph`
    );
  }
  graph.nodes.set(node.currentPage, node);
  if (!graph.entryPoint) {
    graph.entryPoint = node.currentPage;
  }
}
function initializeFlow(nodes, entryPoint) {
  const graph = createFlowGraph();
  for (const node of nodes) {
    registerNode(graph, node);
  }
  if (entryPoint) {
    if (!graph.nodes.has(entryPoint)) {
      throw new Error(`Entry point "${entryPoint}" does not exist in nodes`);
    }
    graph.entryPoint = entryPoint;
  }
  return graph;
}
function getNode(graph, page) {
  return graph.nodes.get(page);
}
function shouldSkipStep(graph, page, state) {
  const node = getNode(graph, page);
  if (!node) {
    return false;
  }
  if (node.shouldSkip) {
    return node.shouldSkip(state);
  }
  return false;
}
function resolveNextPage(node, state) {
  if (!node.nextPage) {
    return null;
  }
  if (typeof node.nextPage === "function") {
    return node.nextPage(state);
  }
  return node.nextPage;
}
function getNextNonSkippedPage(graph, page, state, visited = /* @__PURE__ */ new Set()) {
  if (visited.has(page)) {
    console.warn(`Circular skip condition detected for page "${page}"`);
    return null;
  }
  visited.add(page);
  if (shouldSkipStep(graph, page, state)) {
    const node = getNode(graph, page);
    if (!node) {
      return null;
    }
    const nextPage = resolveNextPage(node, state);
    if (!nextPage || !graph.nodes.has(nextPage)) {
      return null;
    }
    return getNextNonSkippedPage(graph, nextPage, state, visited);
  }
  return page;
}
function getNextPage(graph, currentPage, state) {
  const currentNode = getNode(graph, currentPage);
  if (!currentNode) {
    return null;
  }
  const nextPage = resolveNextPage(currentNode, state);
  if (!nextPage) {
    return null;
  }
  if (!graph.nodes.has(nextPage)) {
    console.warn(`Next page "${nextPage}" does not exist in graph`);
    return null;
  }
  return getNextNonSkippedPage(graph, nextPage, state);
}
function getAllNextPages(graph, currentPage, state) {
  const nextPage = getNextPage(graph, currentPage, state);
  return nextPage ? [nextPage] : [];
}
function getPreviousNonSkippedPage(graph, page, state, visited = /* @__PURE__ */ new Set()) {
  if (visited.has(page)) {
    console.warn(`Circular skip condition detected for page "${page}"`);
    return null;
  }
  visited.add(page);
  const node = getNode(graph, page);
  if (!node) {
    return null;
  }
  if (!node.previousPageFallback) {
    return null;
  }
  if (!graph.nodes.has(node.previousPageFallback)) {
    console.warn(
      `Previous page "${node.previousPageFallback}" does not exist in graph`
    );
    return null;
  }
  if (shouldSkipStep(graph, node.previousPageFallback, state)) {
    return getPreviousNonSkippedPage(
      graph,
      node.previousPageFallback,
      state,
      visited
    );
  }
  return node.previousPageFallback;
}
function getPreviousPage(graph, currentPage, state) {
  const currentNode = getNode(graph, currentPage);
  if (!currentNode) {
    return null;
  }
  if (!currentNode.previousPageFallback) {
    return null;
  }
  if (!graph.nodes.has(currentNode.previousPageFallback)) {
    console.warn(
      `Previous page "${currentNode.previousPageFallback}" does not exist in graph`
    );
    return null;
  }
  return getPreviousNonSkippedPage(graph, currentPage, state);
}
function validateGraph(graph) {
  const errors = [];
  if (graph.entryPoint && !graph.nodes.has(graph.entryPoint)) {
    errors.push(`Entry point "${graph.entryPoint}" does not exist in graph`);
  }
  for (const [page, node] of graph.nodes.entries()) {
    if (node.previousPageFallback && !graph.nodes.has(node.previousPageFallback)) {
      errors.push(
        `Node "${page}" references non-existent previous page "${node.previousPageFallback}"`
      );
    }
    if (node.nextPage && typeof node.nextPage !== "function") {
      if (!graph.nodes.has(node.nextPage)) {
        errors.push(
          `Node "${page}" references non-existent next page "${node.nextPage}"`
        );
      }
    }
  }
  return {
    valid: errors.length === 0,
    errors
  };
}
function getPagesInOrder(graph) {
  const visited = /* @__PURE__ */ new Set();
  const result = [];
  function visit(page) {
    if (visited.has(page)) {
      return;
    }
    visited.add(page);
    const node = graph.nodes.get(page);
    if (!node) {
      return;
    }
    if (node.previousPageFallback) {
      visit(node.previousPageFallback);
    }
    result.push(page);
    if (node.nextPage && typeof node.nextPage !== "function") {
      visit(node.nextPage);
    }
  }
  if (graph.entryPoint) {
    visit(graph.entryPoint);
  }
  for (const page of graph.nodes.keys()) {
    if (!visited.has(page)) {
      visit(page);
    }
  }
  return result;
}

// src/flow/flowStateManagers.ts
var STORAGE_PREFIX = "flow:";
var WizardStateManager = class {
  constructor(prefix = STORAGE_PREFIX) {
    this.prefix = prefix;
  }
  /**
   * Gets the storage key for a wizard UUID
   */
  getStorageKey(uuid) {
    return `${this.prefix}${uuid}`;
  }
  /**
   * Gets all page state entries for a wizard UUID
   */
  getPageStateEntries(uuid) {
    if (typeof window === "undefined" || !window.sessionStorage) {
      return [];
    }
    const storageKey = this.getStorageKey(uuid);
    const stored = window.sessionStorage.getItem(storageKey);
    if (!stored) {
      return [];
    }
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.warn(`Failed to parse state for UUID "${uuid}":`, error);
      return [];
    }
  }
  /**
   * Saves all page state entries for a wizard UUID
   */
  setPageStateEntries(uuid, entries) {
    if (typeof window === "undefined" || !window.sessionStorage) {
      return;
    }
    const storageKey = this.getStorageKey(uuid);
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(entries));
    } catch (error) {
      console.error(`Failed to save state for UUID "${uuid}":`, error);
    }
  }
  /**
   * Pre-registers all expected state keys from the graph
   * This allows us to see all expected state upfront
   */
  preRegisterState(graph, uuid) {
    if (typeof window === "undefined" || !window.sessionStorage) {
      return;
    }
    const entries = this.getPageStateEntries(uuid);
    const pages = getPagesInOrder(graph);
    const existingPages = new Set(entries.map((e) => e.page));
    for (const page of pages) {
      if (!existingPages.has(page)) {
        entries.push({ page, state: {} });
      }
    }
    this.setPageStateEntries(uuid, entries);
  }
  /**
   * Gets state for a specific page
   */
  getState(uuid, page) {
    const entries = this.getPageStateEntries(uuid);
    const entry = entries.find((e) => e.page === page);
    return entry?.state || {};
  }
  /**
   * Sets state for a specific page
   */
  setState(uuid, page, key, value) {
    const entries = this.getPageStateEntries(uuid);
    let entry = entries.find((e) => e.page === page);
    if (!entry) {
      entry = { page, state: {} };
      entries.push(entry);
    }
    entry.state[key] = value;
    this.setPageStateEntries(uuid, entries);
  }
  /**
   * Sets multiple state values for a page at once
   */
  setStateBatch(uuid, page, updates) {
    const entries = this.getPageStateEntries(uuid);
    let entry = entries.find((e) => e.page === page);
    if (!entry) {
      entry = { page, state: {} };
      entries.push(entry);
    }
    Object.assign(entry.state, updates);
    this.setPageStateEntries(uuid, entries);
  }
  /**
   * Gets accumulated state from all pages, keyed by page.
   * Each page has its own namespace so the same key (e.g. "name") won't overwrite.
   */
  getAllState(_graph, uuid) {
    const byPage = {};
    const entries = this.getPageStateEntries(uuid);
    for (const entry of entries) {
      byPage[entry.page] = { ...entry.state };
    }
    return byPage;
  }
  /**
   * Gets state for all pages up to and including the specified page, keyed by page
   */
  getStateUpTo(_graph, uuid, page) {
    const byPage = {};
    const entries = this.getPageStateEntries(uuid);
    const pages = getPagesInOrder(_graph);
    for (const p of pages) {
      const entry = entries.find((e) => e.page === p);
      if (entry) {
        byPage[p] = { ...entry.state };
      }
      if (p === page) break;
    }
    return byPage;
  }
  /**
   * Checks if state exists for a specific UUID
   */
  hasState(uuid) {
    if (typeof window === "undefined" || !window.sessionStorage) {
      return false;
    }
    const storageKey = this.getStorageKey(uuid);
    const stored = window.sessionStorage.getItem(storageKey);
    return stored !== null && stored !== "";
  }
  /**
   * Clears all wizard state for a specific UUID
   */
  clearState(uuid) {
    if (typeof window === "undefined" || !window.sessionStorage) {
      return;
    }
    const storageKey = this.getStorageKey(uuid);
    window.sessionStorage.removeItem(storageKey);
  }
  /**
   * Clears state for a specific page within a wizard UUID
   */
  clearPageState(uuid, page) {
    const entries = this.getPageStateEntries(uuid);
    const filtered = entries.filter((e) => e.page !== page);
    this.setPageStateEntries(uuid, filtered);
  }
};
var defaultStateManager = new WizardStateManager();

// src/flow/NodePresenter.tsx
var import_react2 = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
function Presenter({ page, node, componentLoaders }) {
  const Component = (0, import_react2.useMemo)(() => {
    if (!page) {
      return null;
    }
    const loader = componentLoaders.get(page);
    if (!loader) {
      return null;
    }
    return (0, import_react2.lazy)(loader);
  }, [page, componentLoaders]);
  if (page === "__expired__" || page === "__notfound__") {
    if (!Component) {
      console.warn(
        `No component loader found for page "${page}". Add it to your componentLoaders map.`
      );
      return null;
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react2.Suspense, { fallback: null, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Component, {}) });
  }
  if (!page || !node) {
    return null;
  }
  if (!Component) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react2.Suspense, { fallback: null, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Component, {}) });
}

// src/flow/useURLParams.ts
var import_react3 = require("react");
var browserUrlParamsAdapter = {
  getParam: (key) => {
    if (typeof window === "undefined") {
      return null;
    }
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  },
  setParam: (key, value) => {
    if (typeof window === "undefined") {
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.pushState({}, "", url.toString());
  },
  replaceParam: (key, value) => {
    if (typeof window === "undefined") {
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.replaceState({}, "", url.toString());
  },
  getAllParams: () => {
    if (typeof window === "undefined") {
      return {};
    }
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params.entries()) {
      result[key] = value;
    }
    return result;
  },
  replaceParams: (params) => {
    if (typeof window === "undefined") {
      return;
    }
    const url = new URL(window.location.href);
    url.search = "";
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    window.history.replaceState({}, "", url.toString());
  }
};
function useUrlParams(adapter = browserUrlParamsAdapter) {
  const [params, setParams] = (0, import_react3.useState)(
    () => adapter.getAllParams()
  );
  (0, import_react3.useEffect)(() => {
    if (typeof window === "undefined") {
      return;
    }
    setParams(adapter.getAllParams());
    const handlePopState = () => {
      setParams(adapter.getAllParams());
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [adapter]);
  const getParam = (0, import_react3.useCallback)(
    (key) => {
      return adapter.getParam(key);
    },
    [adapter]
  );
  const setParam = (0, import_react3.useCallback)(
    (key, value) => {
      adapter.setParam(key, value);
      setParams(adapter.getAllParams());
    },
    [adapter]
  );
  const replaceParam = (0, import_react3.useCallback)(
    (key, value) => {
      adapter.replaceParam(key, value);
      setParams(adapter.getAllParams());
    },
    [adapter]
  );
  const getAllParams = (0, import_react3.useCallback)(() => {
    return adapter.getAllParams();
  }, [adapter]);
  const replaceParams = (0, import_react3.useCallback)(
    (newParams) => {
      adapter.replaceParams(newParams);
      setParams(adapter.getAllParams());
    },
    [adapter]
  );
  return {
    getParam,
    setParam,
    replaceParam,
    getAllParams,
    replaceParams,
    params
  };
}

// src/flow/Flow.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function generateShortUuid() {
  const uuid = crypto.randomUUID().replace(/-/g, "");
  return uuid.slice(-5);
}
function Flow({ graph, config = {} }) {
  const {
    urlParamsAdapter,
    pageParamName = "page",
    uuidParamName = "id",
    onPageChange,
    enableState = true,
    componentLoaders
  } = config;
  const stateManager = defaultStateManager;
  const [memoryEntries, setMemoryEntries] = (0, import_react4.useState)([]);
  const mergeEntries = (0, import_react4.useCallback)((entries) => {
    const byPage = {};
    for (const e of entries) {
      byPage[e.page] = { ...e.state };
    }
    return byPage;
  }, []);
  const componentLoadersMap = (0, import_react4.useMemo)(() => {
    if (componentLoaders) {
      return componentLoaders;
    }
    return /* @__PURE__ */ new Map();
  }, [componentLoaders]);
  const urlParams = useUrlParams(urlParamsAdapter);
  const [flowUuid, setFlowUuid] = (0, import_react4.useState)(() => {
    const existingUuid = urlParams.getParam(uuidParamName);
    if (existingUuid) {
      return existingUuid;
    }
    const newUuid = generateShortUuid();
    if (typeof window !== "undefined") {
      urlParams.setParam(uuidParamName, newUuid);
    }
    return newUuid;
  });
  (0, import_react4.useEffect)(() => {
    const urlUuid = urlParams.getParam(uuidParamName);
    if (urlUuid && urlUuid !== flowUuid) {
      setFlowUuid(urlUuid);
    } else if (!urlUuid) {
      urlParams.setParam(uuidParamName, flowUuid);
    }
  }, [flowUuid, uuidParamName, urlParams]);
  const [currentPage, setCurrentPage] = (0, import_react4.useState)(null);
  const [isValidating, setIsValidating] = (0, import_react4.useState)(true);
  const [isCheckingSkip, setIsCheckingSkip] = (0, import_react4.useState)(false);
  const skipCheckRef = (0, import_react4.useRef)(false);
  const hasInitializedRef = (0, import_react4.useRef)(false);
  const [stateVersion, setStateVersion] = (0, import_react4.useState)(0);
  const allState = (0, import_react4.useMemo)(() => {
    if (enableState) {
      const _ = stateVersion;
      return stateManager.getAllState(graph, flowUuid);
    }
    return mergeEntries(memoryEntries);
  }, [
    enableState,
    stateVersion,
    graph,
    stateManager,
    flowUuid,
    mergeEntries,
    memoryEntries
  ]);
  (0, import_react4.useEffect)(() => {
    if (!isValidating) {
      return;
    }
    const urlPage = urlParams.getParam(pageParamName);
    const entryPoint = graph.entryPoint || null;
    const isEntryPoint = urlPage === entryPoint;
    if (isEntryPoint || !urlPage) {
      const initialPage = urlPage || entryPoint;
      setCurrentPage(initialPage);
      setIsValidating(false);
      onPageChange?.(initialPage, null, allState);
      return;
    }
    if (!graph.nodes.has(urlPage)) {
      setCurrentPage("__notfound__");
      setIsValidating(false);
      onPageChange?.("__notfound__", null, allState);
      return;
    }
    if (enableState) {
      const uuidExists = stateManager.hasState(flowUuid);
      if (!uuidExists) {
        setCurrentPage("__expired__");
        setIsValidating(false);
        onPageChange?.("__expired__", null, allState);
        return;
      }
    }
    setCurrentPage(urlPage);
    setIsValidating(false);
    onPageChange?.(urlPage, null, allState);
  }, [
    isValidating,
    urlParams,
    pageParamName,
    graph,
    flowUuid,
    stateManager,
    enableState,
    onPageChange,
    allState
  ]);
  (0, import_react4.useEffect)(() => {
    if (isValidating) {
      return;
    }
    const urlPage = urlParams.params[pageParamName] ?? null;
    const entryPoint = graph.entryPoint || null;
    const isEntryPoint = urlPage === entryPoint;
    const uuidExists = enableState ? stateManager.hasState(flowUuid) : false;
    if (urlPage && !graph.nodes.has(urlPage)) {
      if (currentPage !== "__notfound__") {
        setCurrentPage("__notfound__");
        onPageChange?.("__notfound__", currentPage, allState);
      }
      return;
    }
    if (enableState && !uuidExists && urlPage && !isEntryPoint) {
      if (currentPage !== "__expired__") {
        setCurrentPage("__expired__");
        onPageChange?.("__expired__", currentPage, allState);
      }
      return;
    }
    if ((currentPage === "__expired__" || currentPage === "__notfound__") && urlPage && graph.nodes.has(urlPage)) {
      setCurrentPage(urlPage);
      onPageChange?.(urlPage, currentPage, allState);
    }
    if (currentPage === "__expired__" || currentPage === "__notfound__") {
      if (urlPage && urlPage !== currentPage && graph.nodes.has(urlPage) && (enableState ? uuidExists : true)) {
        setCurrentPage(urlPage);
        onPageChange?.(urlPage, currentPage, allState);
      } else {
        return;
      }
    }
    if (enableState) {
      if (!hasInitializedRef.current && !uuidExists && (isEntryPoint || !urlPage)) {
        stateManager.preRegisterState(graph, flowUuid);
        hasInitializedRef.current = true;
        setStateVersion((prev) => prev + 1);
      } else if (uuidExists) {
        hasInitializedRef.current = true;
      }
    } else {
      hasInitializedRef.current = true;
    }
    if (urlPage && urlPage !== currentPage && graph.nodes.has(urlPage)) {
      if (shouldSkipStep(graph, urlPage, allState)) {
        const prevFromCurrent = currentPage ? getPreviousPage(graph, currentPage, allState) : null;
        const isGoingBack = prevFromCurrent === urlPage;
        const targetPage = isGoingBack ? getPreviousPage(graph, urlPage, allState) : getNextPage(graph, urlPage, allState);
        if (targetPage) {
          urlParams.replaceParam(pageParamName, targetPage);
          setCurrentPage(targetPage);
          onPageChange?.(targetPage, currentPage, allState);
        }
      } else {
        setCurrentPage(urlPage);
        onPageChange?.(urlPage, currentPage, allState);
      }
    } else if (!urlPage) {
      if (entryPoint && entryPoint !== currentPage) {
        const previousPage = currentPage;
        setCurrentPage(entryPoint);
        urlParams.setParam(pageParamName, entryPoint);
        onPageChange?.(entryPoint, previousPage, allState);
      } else if (!entryPoint && currentPage) {
        const previousPage = currentPage;
        setCurrentPage(null);
        onPageChange?.(null, previousPage, allState);
      }
    }
  }, [
    urlParams.params,
    graph,
    currentPage,
    allState,
    onPageChange,
    pageParamName,
    urlParams,
    stateManager,
    flowUuid,
    isValidating,
    enableState
  ]);
  (0, import_react4.useEffect)(() => {
    skipCheckRef.current = false;
    if (!currentPage) {
      return;
    }
    if (shouldSkipStep(graph, currentPage, allState)) {
      setIsCheckingSkip(true);
      skipCheckRef.current = true;
      const nextPage = getNextPage(graph, currentPage, allState);
      if (nextPage) {
        urlParams.replaceParam(pageParamName, nextPage);
        setCurrentPage(nextPage);
        onPageChange?.(nextPage, currentPage, allState);
      }
      setIsCheckingSkip(false);
    }
  }, [currentPage, graph, allState, pageParamName, urlParams, onPageChange]);
  const goToNext = (0, import_react4.useCallback)(() => {
    if (!currentPage) {
      return;
    }
    const nextPage = getNextPage(graph, currentPage, allState);
    if (!nextPage) {
      return;
    }
    const previousPage = currentPage;
    const currentNode2 = getNode(graph, currentPage);
    const directNext = currentNode2 ? resolveNextPage(currentNode2, allState) : null;
    const isSkipping = directNext !== null && directNext !== nextPage;
    if (isSkipping) {
      urlParams.replaceParam(pageParamName, nextPage);
    } else {
      urlParams.setParam(pageParamName, nextPage);
    }
    setCurrentPage(nextPage);
    onPageChange?.(nextPage, previousPage, allState);
  }, [graph, currentPage, allState, onPageChange, pageParamName, urlParams]);
  const goToPrevious = (0, import_react4.useCallback)(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    }
  }, []);
  const goToPage = (0, import_react4.useCallback)(
    (page) => {
      if (!graph.nodes.has(page)) {
        console.warn(`Page "${page}" does not exist in graph`);
        return;
      }
      const previousPage = currentPage;
      setCurrentPage(page);
      urlParams.setParam(pageParamName, page);
      onPageChange?.(page, previousPage, allState);
    },
    [graph, currentPage, allState, onPageChange, pageParamName, urlParams]
  );
  const skipToPage = (0, import_react4.useCallback)(
    (page) => {
      if (!graph.nodes.has(page)) {
        console.warn(`Page "${page}" does not exist in graph`);
        return;
      }
      const previousPage = currentPage;
      setCurrentPage(page);
      urlParams.replaceParam(pageParamName, page);
      onPageChange?.(page, previousPage, allState);
    },
    [graph, currentPage, allState, onPageChange, pageParamName, urlParams]
  );
  const skipCurrentPage = (0, import_react4.useCallback)(() => {
    if (!currentPage) {
      return;
    }
    setIsCheckingSkip(true);
    skipCheckRef.current = true;
    const nextPage = getNextPage(graph, currentPage, allState);
    if (nextPage) {
      urlParams.replaceParam(pageParamName, nextPage);
      setCurrentPage(nextPage);
      onPageChange?.(nextPage, currentPage, allState);
    }
    setIsCheckingSkip(false);
  }, [currentPage, graph, allState, pageParamName, urlParams, onPageChange]);
  const completeFlow = (0, import_react4.useCallback)(() => {
    if (enableState) {
      stateManager.clearState(flowUuid);
    } else {
      setMemoryEntries([]);
    }
  }, [enableState, stateManager, flowUuid]);
  const updateState = (0, import_react4.useCallback)(
    (key, value) => {
      if (!currentPage) return;
      if (enableState) {
        stateManager.setState(flowUuid, currentPage, key, value);
        setStateVersion((prev) => prev + 1);
      } else {
        setMemoryEntries((prev) => {
          const next = [...prev];
          const i = next.findIndex((e) => e.page === currentPage);
          const entry = i >= 0 ? { ...next[i] } : { page: currentPage, state: {} };
          entry.state = { ...entry.state, [key]: value };
          if (i >= 0) next[i] = entry;
          else next.push(entry);
          return next;
        });
      }
    },
    [currentPage, enableState, stateManager, flowUuid]
  );
  const updateStateBatch = (0, import_react4.useCallback)(
    (updates) => {
      if (!currentPage) return;
      if (enableState) {
        stateManager.setStateBatch(flowUuid, currentPage, updates);
        setStateVersion((prev) => prev + 1);
      } else {
        setMemoryEntries((prev) => {
          const next = [...prev];
          const i = next.findIndex((e) => e.page === currentPage);
          const entry = i >= 0 ? { ...next[i] } : { page: currentPage, state: {} };
          entry.state = { ...entry.state, ...updates };
          if (i >= 0) next[i] = entry;
          else next.push(entry);
          return next;
        });
      }
    },
    [currentPage, enableState, stateManager, flowUuid]
  );
  const getPageState = (0, import_react4.useCallback)(
    (page) => {
      if (enableState) {
        return stateManager.getState(flowUuid, page);
      }
      const entry = memoryEntries.find((e) => e.page === page);
      return entry?.state ?? {};
    },
    [enableState, stateManager, flowUuid, memoryEntries]
  );
  const getCurrentNode = (0, import_react4.useCallback)(() => {
    if (!currentPage) {
      return void 0;
    }
    return getNode(graph, currentPage);
  }, [graph, currentPage]);
  const getNodeByPage = (0, import_react4.useCallback)(
    (page) => {
      return getNode(graph, page);
    },
    [graph]
  );
  const hasNext = (0, import_react4.useCallback)(() => {
    if (!currentPage) {
      return false;
    }
    return getNextPage(graph, currentPage, allState) !== null;
  }, [graph, currentPage, allState]);
  const contextValue = (0, import_react4.useMemo)(
    () => ({
      currentPage,
      state: allState,
      goToNext,
      goToPrevious,
      goToPage,
      skipToPage,
      updateState,
      updateStateBatch,
      getPageState,
      getCurrentNode,
      getNode: getNodeByPage,
      hasNext,
      skipCurrentPage,
      completeFlow,
      getUrlParam: urlParams.getParam,
      getAllUrlParams: urlParams.getAllParams,
      urlParams: urlParams.params
    }),
    [
      currentPage,
      allState,
      goToNext,
      goToPrevious,
      goToPage,
      skipToPage,
      updateState,
      updateStateBatch,
      getPageState,
      getCurrentNode,
      getNodeByPage,
      hasNext,
      skipCurrentPage,
      completeFlow,
      urlParams
    ]
  );
  const currentNode = getCurrentNode();
  if (isValidating) {
    return null;
  }
  if (isCheckingSkip) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(FlowContext.Provider, { value: contextValue, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", {}) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(FlowContext.Provider, { value: contextValue, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    Presenter,
    {
      page: currentPage,
      node: currentNode,
      componentLoaders: componentLoadersMap
    }
  ) });
}

// src/flow/pathParamHelpers.ts
function parsePathTemplate(template) {
  const matches = template.match(/\[([^\]]+)\]/g);
  if (!matches) {
    return [];
  }
  return matches.map((match) => match.slice(1, -1));
}
function buildPath(template, params) {
  let path = template;
  for (const [key, value] of Object.entries(params)) {
    path = path.replace(`[${key}]`, encodeURIComponent(value));
  }
  return path;
}
function parsePath(path, template) {
  const params = {};
  const paramNames = parsePathTemplate(template);
  if (paramNames.length === 0) {
    return params;
  }
  const pattern = template.replace(/\[([^\]]+)\]/g, "([^/]+)").replace(/\//g, "\\/");
  const regex = new RegExp(`${pattern}$`);
  const matches = path.match(regex);
  if (matches) {
    for (let i = 0; i < paramNames.length; i++) {
      const value = matches[i + 1];
      if (value) {
        params[paramNames[i]] = decodeURIComponent(value);
      }
    }
  }
  return params;
}
function createPathParamsAdapter(config) {
  const fullTemplate = config.basePath ? `${config.basePath}${config.template}` : config.template;
  const paramNames = parsePathTemplate(fullTemplate);
  const getCurrentPath = () => {
    if (typeof window === "undefined") {
      return "";
    }
    return window.location.pathname;
  };
  const getCurrentParams = () => {
    const path = getCurrentPath();
    return parsePath(path, fullTemplate);
  };
  const buildFullPath = (params) => {
    const currentParams = getCurrentParams();
    const mergedParams = { ...currentParams, ...params };
    for (const paramName of paramNames) {
      if (!mergedParams[paramName]) {
        const currentValue = getCurrentParams()[paramName];
        if (currentValue) {
          mergedParams[paramName] = currentValue;
        }
      }
    }
    const newPath = buildPath(fullTemplate, mergedParams);
    const currentPath = getCurrentPath();
    const templateStart = currentPath.indexOf(fullTemplate.split("[")[0]);
    if (templateStart > 0) {
      const prefix = currentPath.slice(0, templateStart);
      return prefix + newPath;
    }
    return newPath;
  };
  return {
    getParam: (key) => {
      const params = getCurrentParams();
      return params[key] || null;
    },
    setParam: (key, value) => {
      if (typeof window === "undefined") {
        return;
      }
      if (!paramNames.includes(key)) {
        console.warn(
          `Parameter "${key}" is not defined in path template: ${fullTemplate}`
        );
        return;
      }
      const newPath = buildFullPath({ [key]: value });
      window.history.pushState({}, "", newPath);
    },
    replaceParam: (key, value) => {
      if (typeof window === "undefined") {
        return;
      }
      if (!paramNames.includes(key)) {
        console.warn(
          `Parameter "${key}" is not defined in path template: ${fullTemplate}`
        );
        return;
      }
      const newPath = buildFullPath({ [key]: value });
      window.history.replaceState({}, "", newPath);
    },
    getAllParams: () => {
      return getCurrentParams();
    },
    replaceParams: (params) => {
      if (typeof window === "undefined") {
        return;
      }
      for (const key of Object.keys(params)) {
        if (!paramNames.includes(key)) {
          console.warn(
            `Parameter "${key}" is not defined in path template: ${fullTemplate}`
          );
        }
      }
      const newPath = buildFullPath(params);
      window.history.replaceState({}, "", newPath);
    }
  };
}
function createPathParamsAdapterFromProps(_pathParams, config) {
  const fullTemplate = config.basePath ? `${config.basePath}${config.template}` : config.template;
  const paramNames = parsePathTemplate(fullTemplate);
  const getCurrentPath = () => {
    if (typeof window === "undefined") {
      return "";
    }
    return window.location.pathname;
  };
  const getCurrentParamsFromUrl = () => {
    const path = getCurrentPath();
    return parsePath(path, fullTemplate);
  };
  const getParams = () => {
    return getCurrentParamsFromUrl();
  };
  const buildFullPath = (params) => {
    const current = getParams();
    const mergedParams = { ...current, ...params };
    return buildPath(fullTemplate, mergedParams);
  };
  return {
    getParam: (key) => {
      const params = getParams();
      return params[key] || null;
    },
    setParam: (key, value) => {
      if (typeof window === "undefined") {
        return;
      }
      if (!paramNames.includes(key)) {
        console.warn(
          `Parameter "${key}" is not defined in path template: ${fullTemplate}`
        );
        return;
      }
      const newPath = buildFullPath({ [key]: value });
      window.history.pushState({}, "", newPath);
    },
    replaceParam: (key, value) => {
      if (typeof window === "undefined") {
        return;
      }
      if (!paramNames.includes(key)) {
        console.warn(
          `Parameter "${key}" is not defined in path template: ${fullTemplate}`
        );
        return;
      }
      const newPath = buildFullPath({ [key]: value });
      window.history.replaceState({}, "", newPath);
    },
    getAllParams: () => {
      return { ...getParams() };
    },
    replaceParams: (params) => {
      if (typeof window === "undefined") {
        return;
      }
      for (const key of Object.keys(params)) {
        if (!paramNames.includes(key)) {
          console.warn(
            `Parameter "${key}" is not defined in path template: ${fullTemplate}`
          );
        }
      }
      const newPath = buildFullPath(params);
      window.history.replaceState({}, "", newPath);
    }
  };
}

// src/flow/useFlow.ts
var import_react5 = require("react");
function useFlow() {
  const ctx = useFlowContext();
  const stateKey = (0, import_react5.useCallback)(
    (key) => {
      const pageState = ctx.currentPage ? ctx.getPageState(ctx.currentPage) : {};
      const value = pageState[key] ?? void 0;
      const setValue = (newValue) => ctx.updateState(key, newValue);
      return [value, setValue];
    },
    [ctx.currentPage, ctx.getPageState, ctx.updateState]
  );
  return {
    ...ctx,
    stateKey,
    hasNext: ctx.hasNext()
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Flow,
  FlowContext,
  Presenter,
  createFlowGraph,
  createPathParamsAdapter,
  createPathParamsAdapterFromProps,
  getAllNextPages,
  getNextNonSkippedPage,
  getNextPage,
  getNode,
  getPagesInOrder,
  getPreviousNonSkippedPage,
  getPreviousPage,
  initializeFlow,
  registerNode,
  resolveNextPage,
  shouldSkipStep,
  useFlow,
  useFlowContext,
  useUrlParams,
  validateGraph
});
//# sourceMappingURL=index.cjs.map