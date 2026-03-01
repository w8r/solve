import * as React from 'react';
import { createContext, FC, useContext, useState, useEffect } from 'react';
import { App } from './App';
import { Graph, GraphEdge, GraphNode, Id } from '../../types/graph';

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

  selectNode: (id: Id | Id[]) => void;
  selectEdge: (id: Id | Id[]) => void;
  clearSelection: () => void;
};

export const VisContext = createContext<VisState>({
  graph: { nodes: [], edges: [] }
} as any as VisState);

export const VisProvider: FC<{ value?: VisState }> = ({ children }) => {
  const [app, setApp] = useState<App | null>(null);
  const [graph, setGraph] = useState<Graph>({
    id: '',
    publicId: '',
    nodes: [],
    edges: []
  });
  const startSelection = (callback: (graph: Graph) => unknown) =>
    app?.startSelection(callback);
  const [selectedNodes, setSelectedNodes] = useState<GraphNode[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<GraphEdge[]>([]);

  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    setSelectedNodes(graph.nodes.filter((node) => node.attributes.selected));
    setSelectedEdges(graph.edges.filter((edge) => edge.attributes.selected));
  }, [graph]);

  const selectNode = (id: string | string[]) => {
    // add array to the selection
    if (Array.isArray(id)) {
      const set = new Set(id);
      const alreadySelected = new Set(selectedNodes.map((n) => n.id));
      const toAdd: GraphNode[] = [];
      graph.nodes.forEach((node) => {
        if (set.has(node.id) && !alreadySelected.has(node.id)) {
          node.attributes.selected = true;
          toAdd.push(node);
        }
      });
      setSelectedNodes([...selectedNodes, ...toAdd]);
      return;
    }
    graph.nodes.forEach((n) => {
      if (n.id === id) {
        n.attributes.selected = !n.attributes.selected;
        if (n.attributes.selected) setSelectedNodes([...selectedNodes, n]);
        else setSelectedNodes(selectedNodes.filter((n) => n.id !== id));
      }
    });
  };

  const selectEdge = (id: string | string[]) => {
    if (Array.isArray(id)) {
      const set = new Set(id);
      const alreadySelected = new Set(selectedEdges.map((e) => e._id));
      const toAdd: GraphEdge[] = [];
      graph.edges.forEach((edge) => {
        if (set.has(edge._id) && !alreadySelected.has(edge._id)) {
          edge.attributes.selected = true;
          toAdd.push(edge);
        }
      });
      setSelectedEdges([...selectedEdges, ...toAdd]);
      return;
    }
    graph.edges.forEach((e) => {
      if (e._id === id) {
        e.attributes.selected = !e.attributes.selected;
        if (e.attributes.selected) setSelectedEdges([...selectedEdges, e]);
        else setSelectedEdges(selectedEdges.filter((e) => e._id !== id));
      }
    });
  };

  const clearSelection = () => {
    setSelectedNodes([]);
    setSelectedEdges([]);
    graph.nodes.forEach((n) => {
      n.attributes.selected = false;
    });
    graph.edges.forEach((e) => {
      e.attributes.selected = false;
    });
    setGraph({ ...graph });
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
          selectEdge,
          clearSelection
        } as VisState
      }
    >
      {children}
    </VisContext.Provider>
  );
};

export const useVis = () => useContext<VisState>(VisContext);
