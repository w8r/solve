import React, { FC, useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { useToast } from 'native-base';
import { PreviewProps } from '../../navigation/types';

import { VisProvider, useVis, Viewer } from '../../components/Viewer';
import { ProfileButton } from '../../components/Avatar';
import { getCategoryColor, Graph, Id } from '../../types/graph';
import { BottomMenu } from './BottomMenu';
import { BackButton } from '../../components/BackButton';
import { SaveGraphDialog } from '../../components/SaveGraphDialog';
import { SuccessModal } from './SuccessModal';
import CreateNodeDialog from '../../components/Dialog/CreateNodeDialog';

const Wrapper: FC<{ inputGraph: Graph; width: number; height: number }> = ({
  inputGraph,
  width,
  height
}) => {
  const { graph, setGraph, selectedNodes, setSelectedNodes } = useVis();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showNodeDialog, setShowNodeDialog] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setGraph(inputGraph);
    toast.show({
      description:
        'You are in the preview mode. You can change things to remove everything that can be sensitive before sharing',
      duration: 2500,
      placement: 'bottom',
      marginBottom: 10,
      marginX: 5,
      padding: 10
    });
  }, []);

  if (graph.nodes.length === 0) return null;

  const onEdit = () => {
    if (selectedNodes && selectedNodes.length === 1) {
      setShowNodeDialog(true);
    }
  };

  const editNode = (name: string, category: string, size: number) => {
    if (!selectedNodes || (selectedNodes && selectedNodes.length !== 1)) return;
    graph.nodes = graph.nodes.map((node) =>
      node.id === selectedNodes[0].id
        ? {
            ...node,
            attributes: {
              ...node.attributes,
              r: size,
              text: name,
              color: getCategoryColor(category)
            },
            data: { category }
          }
        : node
    );
    setGraph(graph);
    setSelectedNodes([
      {
        ...selectedNodes[0],
        data: { category },
        attributes: {
          ...selectedNodes[0].attributes,
          r: size,
          text: name,
          color: getCategoryColor(category)
        }
      }
    ]);
    setShowNodeDialog(false);
  };

  const onSave = () => setShowSaveDialog(true);

  return (
    <>
      <Viewer width={width} height={height} graph={graph} />
      <BottomMenu onEdit={onEdit} onSave={onSave} />
      {showSaveDialog && (
        <SaveGraphDialog
          share
          onCancel={() => setShowSaveDialog(false)}
          onDone={() => {
            setShowSaveDialog(false);
            setShowSuccessModal(true);
          }}
        />
      )}
      {showSuccessModal && <SuccessModal graph={graph} />}
      {showNodeDialog ? (
        <CreateNodeDialog
          closeDialog={() => setShowNodeDialog(false)}
          addNode={() => {}}
          editNode={editNode}
          data={
            selectedNodes && selectedNodes.length === 1
              ? selectedNodes[0]
              : null
          }
        />
      ) : null}
    </>
  );
};

export const Preview: FC<PreviewProps> = ({ route }) => {
  const { width, height } = Dimensions.get('window');
  const graph = route.params.graph;

  return (
    <VisProvider>
      <BackButton />
      <ProfileButton />
      <Wrapper inputGraph={graph} width={width} height={height} />
    </VisProvider>
  );
};
