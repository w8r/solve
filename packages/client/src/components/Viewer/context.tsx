import * as React from "react";
import { createContext, FC, useContext, useState } from "react";
import { App } from "./App";
import { Graph } from "./types";

export type VisState = {
  graph: Graph;
  setGraph: (graph: Graph) => void;
  app: App;
  setApp: (app: App) => void;
};

export const VisContext = createContext<VisState>({
  graph: { nodes: [], edges: [] },
} as any as VisState);

export const VisProvider: FC<{ value?: VisState }> = ({ children }) => {
  const [app, setApp] = useState<App | null>(null);
  const [graph, setGraph] = useState<Graph>({ nodes: [], edges: [] });
  return (
    <VisContext.Provider value={{ app, setApp, setGraph, graph } as VisState}>
      {children}
    </VisContext.Provider>
  );
};

export const useVis = () => useContext<VisState>(VisContext);
