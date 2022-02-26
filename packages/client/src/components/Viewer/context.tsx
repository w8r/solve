import * as React from 'react';
import { createContext, FC, useContext, useState } from 'react';
import { App } from './App';
import { Graph, GraphEdge, GraphNode } from '../../types/graph';

export type VisState = {
  graph: Graph;
  setGraph: (graph: Graph) => void;
  app: App;
  setApp: (app: App) => void;
  isSelecting: boolean;
  setIsSelecting: (isSelecting: boolean) => void;
  startSelection: (cb: (graph: Graph) => void) => void;

  selectedNodes: GraphNode[];
  setSelectedNodes: (selectedNodes: GraphNode[]) => void;

  selectedEdges: GraphEdge[];
  setSelectedEdges: (selectedEdges: GraphEdge[]) => void;
};

export const VisContext = createContext<VisState>({
  graph: { nodes: [], edges: [] }
} as any as VisState);

export const VisProvider: FC<{ value?: VisState }> = ({ children }) => {
  const [app, setApp] = useState<App | null>(null);
  const [graph, setGraph] = useState<Graph>({ id: '', nodes: [], edges: [] });
  const startSelection = (callback: (graph: Graph) => unknown) =>
    app?.startSelection(callback);
  const [selectedNodes, setSelectedNodes] = useState<GraphNode[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<GraphEdge[]>([]);

  const [isSelecting, setIsSelecting] = useState(false);
  return (
    <VisContext.Provider
      value={
        {
          app,
          setApp,
          setGraph,
          graph,
          startSelection,
          isSelecting,
          setIsSelecting,

          selectedNodes,
          setSelectedNodes,
          selectedEdges,
          setSelectedEdges
        } as VisState
      }
    >
      {children}
    </VisContext.Provider>
  );
};

export const useVis = () => useContext<VisState>(VisContext);
