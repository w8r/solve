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

  selectNode: (id: string) => void;
  selectEdge: (id: string) => void;
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

  const selectNode = (id: string) => {
    graph.nodes.forEach((n) => {
      if (n.id === id) {
        n.attributes.selected = !n.attributes.selected;
        if (n.attributes.selected) setSelectedNodes([...selectedNodes, n]);
        else setSelectedNodes(selectedNodes.filter((n) => n.id !== id));
      }
    });
  };

  const selectEdge = (id: string) => {
    graph.edges.forEach((e) => {
      if (e._id === id) {
        e.attributes.selected = !e.attributes.selected;
        if (e.attributes.selected) setSelectedEdges([...selectedEdges, e]);
        else setSelectedEdges(selectedEdges.filter((e) => e._id !== id));
      }
    });
  };

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
          setSelectedEdges,

          selectNode,
          selectEdge
        } as VisState
      }
    >
      {children}
    </VisContext.Provider>
  );
};

export const useVis = () => useContext<VisState>(VisContext);
