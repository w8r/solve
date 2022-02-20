import React, { FC } from 'react';
import { useEffect } from 'react';
import { useVis, VisProvider } from './context';
import { Viewer } from './Viewer';
//import sampleGraph from "../assets/data/triangle.json";

type VisProps = { width: number; height: number };

const Wrapper = ({ width, height }: VisProps) => {
  const { graph, setGraph } = useVis();
  useEffect(() => {
    //setGraph({ nodes: [], edges: []});
  });
  if (graph.nodes.length === 0) return null;
  return <Viewer width={width} height={height} graph={graph} />;
};

export { VisProvider, Viewer, useVis };

export const Vis: FC<VisProps> = (props) => (
  <VisProvider>
    <Wrapper {...props} />
  </VisProvider>
);
