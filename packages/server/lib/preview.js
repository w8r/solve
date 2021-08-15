const sharp = require('sharp');

function svg({ nodes = [], edges = [] }) {
  const nodesMap = new Map();
  const bbox = [Infinity, Infinity, -Infinity, -Infinity];
  const margin = 25;

  const nodeColor = '#404040';
  const edgeColor = '#909090';

  if (nodes.length === 0) {
    nodes = [{
      attributes: {
        x: 0, y: 0, radius: 10,
        color: 'none',
        strokeWidth: 1,
        strokeColor: nodeColor
      }
    }];
    bbox[0] = -100; bbox[1] = -100;
    bbox[2] = 100; bbox[3] = 100;
  }

  const renderedNodes = nodes.map(node => {
    nodesMap.set(node.id, node);
    const attrs = node.attributes || {};
    const { x = 0, y = 0, radius = 5 } = attrs;

    bbox[0] = Math.min(x - radius, bbox[0]);
    bbox[1] = Math.min(y - radius, bbox[1]);
    bbox[2] = Math.max(x + radius, bbox[2]);
    bbox[3] = Math.max(y + radius, bbox[3]);

    const strokeColor = (attrs.strokeColor) ?
      ` stroke="${attrs.strokeColor}"` : '';
    const strokeWidth = attrs.strokeWidth ?
      ` stroke-width="${attrs.strokeWidth}"` : '';

    return `<circle
      cx="${x}" cy="${y}"
      r="${radius}" fill="${attrs.color || nodeColor}" ${strokeColor} ${strokeWidth} />`.replace(/\s+/g, ' ');
  });

  bbox[0] -= margin;
  bbox[1] -= margin;
  bbox[2] += margin;
  bbox[3] += margin;

  const renderedEdges = edges.map(edge => {
    const source = nodesMap.get(edge.source);
    const target = nodesMap.get(edge.target);

    source.attrributes = source.attributes || {};
    target.attrributes = target.attributes || {};

    const sx = source.attributes.x || 0;
    const sy = source.attributes.y || 0;
    const tx = target.attributes.x || 0;
    const ty = target.attributes.y || 0;

    return `<line x1="${sx}" y1="${sy}" x2="${tx}" y2="${ty}" stroke="${edgeColor}" />`;
  });

  return Promise.resolve(`
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="${bbox[0]} ${bbox[1]} ${bbox[2] - bbox[0]} ${bbox[3] - bbox[1]}"
      width="500" height="500">
      <g>${renderedEdges.join('\n')}</g>
      <g>${renderedNodes.join('\n')}</g>
    </svg>
 `.trim());
};

function png(graph) {
  return svg(graph)
    .then(svgString => sharp(Buffer.from(svgString)).png())
    .then(pngbuff => pngbuff.toBuffer());
}

module.exports = { svg, png };

