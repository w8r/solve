import React, { useState } from 'react';

import { useVis } from '../../../components/Viewer';
import { ProposalCtxMenu } from './ContextMenu/Proposal';

export function ProposalTools({}: {}) {
  const { setGraph, setSelectedNodes, setSelectedEdges } = useVis();
  const [nodeDialogVisible, setNodeDialogVisible] = useState(false);
  const [edgeDialogVisible, setEdgeDialogVisible] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  return (
    <>
      <ProposalCtxMenu onAccept={() => {}} />
    </>
  );
}
