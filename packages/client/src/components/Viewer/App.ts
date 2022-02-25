import { ExpoWebGLRenderingContext, GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import { positionThreeCamera, pointOnLine } from './utils';
import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  CircleGeometry,
  Mesh,
  MeshBasicMaterial,
  Color,
  Vector3,
  Shape,
  ShaderMaterial
} from 'three';

// @ts-ignore
import { Text } from 'troika-three-text';
import { Quadtree, quadtree } from 'd3-quadtree';
import type { Graph, GraphEdge, GraphNode } from '../../types/graph';
import { LineMesh, basicMaterial, dashedMaterial } from './line-mesh-2d';
import EventEmitter from 'eventemitter3';
import throttle from 'lodash.throttle';
import inside from 'point-in-polygon';

const FOV = 80;
const LASSO_THROTTLE = 50;

function getEdgePoints(source: GraphNode, target: GraphNode) {
  const sx = source.attributes.x;
  const sy = source.attributes.y;
  const tx = target.attributes.x;
  const ty = target.attributes.y;
  const sr = source.attributes.r;
  const tr = target.attributes.r;

  return [
    [sx, sy, 0],
    [tx, ty, 0]
  ];

  // special case for the arrows and other stuff

  // const d = Math.sqrt(Math.pow(tx - sx, 2) + Math.pow(ty - sy, 2));
  // //const arrowLength = d * 0.1;
  // const t1 = sr / d;
  // const t2 = 1 - tr / d;
  // //const t3 = 1 - (tr + arrowLength) / d;

  // const p0 = pointOnLine(sx, sy, tx, ty, t1);
  // const p1 = pointOnLine(sx, sy, tx, ty, t2);

  // return [
  //   [p0.x, p0.y, 0],
  //   [p1.x, p1.y, 0],
  // ];
}

function getArrowPoints(
  source: GraphNode,
  target: GraphNode,
  arrowLength: number
) {
  const sx = source.attributes.x;
  const sy = source.attributes.y;
  const tx = target.attributes.x;
  const ty = target.attributes.y;
  const sr = source.attributes.r;
  const tr = target.attributes.r;

  const d = Math.sqrt(Math.pow(tx - sx, 2) + Math.pow(ty - sy, 2));

  arrowLength = Math.min(d * 0.1, arrowLength / 2);
  const t1 = sr / d;
  const t2 = 1 - tr / d;

  const B = pointOnLine(sx, sy, tx, ty, t2);
  const A = pointOnLine(sx, sy, tx, ty, t1);

  const dir = new Vector3(B.x - A.x, B.y - A.y, 0).normalize();

  const w = arrowLength / 2;
  const h = arrowLength;

  const vx = -dir.y;
  const vy = dir.x;

  const v1x = B.x - h * dir.x - w * vx;
  const v1y = B.y - h * dir.y - w * vy;

  const v2x = B.x - h * dir.x + w * vx;
  const v2y = B.y - h * dir.y + w * vy;

  return [
    [v1x, v1y],
    [B.x, B.y],
    [v2x, v2y]
  ];
}

type Id = number | string;

export class App extends EventEmitter {
  // TODO: solve later
  // @ts-ignore
  private gl: ExpoWebGLRenderingContext;
  // @ts-ignore
  private renderer: WebGLRenderer;

  private scene: Scene = new Scene();
  private camera: PerspectiveCamera = new PerspectiveCamera();
  private nodeMeshes: Mesh[] = [];
  private edgeMeshes: Mesh[] = [];
  private width: number = 0;
  private height: number = 0;
  private idToMesh = new Map<Id, Mesh>();
  private idToText = new Map<Id, Text>();
  private edgesBySource = new Map<Id, GraphEdge[]>();
  private edgesByTarget = new Map<Id, GraphEdge[]>();
  private idToNode = new Map<Id, GraphNode>();
  private idToEdge = new Map<Id, GraphEdge>();
  private lasso?: Mesh<LineMesh>;
  private nodes: GraphNode[] = [];
  private edges: GraphEdge[] = [];
  // @ts-ignore;
  private nodeQ: Quadtree<GraphNode>;

  private frameTimer = 0;
  private dppx = 1;

  private x = 0;
  private y = 0;
  private k = 0;

  private selection: [number, number][] = [];

  constructor(
    gl: ExpoWebGLRenderingContext,
    dppx: number,
    sceneColor = 0x10505b
  ) {
    super();
    this.gl = gl;
    this.dppx = dppx;

    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    this.width = width;
    this.height = height;

    const renderer = (this.renderer = new Renderer({ gl }));
    const scene = (this.scene = new Scene());
    const aspect = width / height;
    const camera = (this.camera = new PerspectiveCamera(
      FOV,
      aspect,
      1e-5,
      1e6
    ));

    renderer.setSize(width, height);
    renderer.pixelRatio = dppx;
    renderer.setClearColor(sceneColor);

    camera.position.set(0, 0, 1);

    renderer.render(scene, camera);

    gl.endFrameEXP();
    this.start();
    return this;
  }

  public startSelection(cb: (Graph: Graph) => unknown) {
    this.once('selection', cb);
    this.selection.length = 0;
  }

  public updateLasso = throttle((sx: number, sy: number) => {
    if (this.lasso) this.scene.remove(this.lasso);
    const { x, y } = this.screenToWorld(sx, sy);
    this.selection.push([x, y]);

    const material = dashedMaterial({
      thickness: 0.5,
      color: new Color('white'),
      opacity: 0.5,
      dashSteps: this.selection.length
    });
    const geometry = new LineMesh(this.selection, {
      distances: true
    });
    const mesh = new Mesh(geometry, material);
    this.lasso = mesh;
    this.scene.add(mesh);
  }, LASSO_THROTTLE);

  public stopSelection() {
    if (this.lasso) {
      this.scene.remove(this.lasso);
      this.lasso?.remove();
    }
    this.emit('selection', this.queryPolygon(this.selection));
    this.selection.length = 0;
  }

  queryPolygon(coords: [number, number][]) {
    const set = new Set();
    const nodes = this.nodes.filter((node) => {
      const isIn = inside([node.attributes.x, node.attributes.y], coords);
      if (isIn) set.add(node.id);
      return isIn;
    });
    const edges = this.edges.filter(
      (edge) => set.has(edge.source) && set.has(edge.target)
    );
    return { nodes, edges };
  }

  setGraph({ nodes, edges }: Graph) {
    const { scene } = this;
    scene.clear();

    this.edgeMeshes = [];
    this.nodeMeshes = [];
    this.idToMesh.clear();
    this.idToText.clear();
    this.edgesBySource.clear();
    this.edgesByTarget.clear();
    this.idToNode.clear();
    this.idToEdge.clear();

    const circle = new CircleGeometry(1, 32);

    const idToMesh = this.idToMesh;
    const idToNode = this.idToNode;

    this.nodeQ = quadtree<GraphNode>()
      .x((d) => d.attributes.x)
      .y((d) => d.attributes.y);
    nodes.forEach((node, i) => {
      const {
        id,
        attributes: { x, y, r, color: rgbColor }
      } = node;

      const material = new MeshBasicMaterial({
        color: new Color(node.attributes.selected ? 'cyan' : rgbColor),
        transparent: true
      });
      const mesh = new Mesh(circle, material);
      mesh.renderOrder = 1;
      mesh.position.x = x;
      mesh.position.y = y;
      mesh.position.z = 0;
      mesh.scale.x = mesh.scale.y = r;

      idToMesh.set(id, mesh);
      idToNode.set(id, node);

      if (node.attributes.text) {
        const text = new Text();

        text.renderOrder = 2;
        // // Set properties to configure:
        text.text = 'Hello world!';
        text.fontSize = 2;
        text.position.z = 0;
        text.position.x = x;
        text.position.y = y - r;
        text.anchorX = 'center';
        text.anchorY = 'top';
        text.color = new Color(0xffffff);

        this.idToText.set(id, text);
        scene.add(text);
      }
      this.nodeMeshes.push(mesh);
      scene.add(mesh);
      this.nodeQ.add(node);
    });

    const idToEdge = this.idToEdge;
    const edgesBySource = this.edgesBySource;
    const edgesByTarget = this.edgesByTarget;

    edges.forEach((edge) => {
      const {
        _id: id,
        source,
        target,
        attributes: { color: rgbColor, width }
      } = edge;
      const sourceNode = idToNode.get(source) as GraphNode;
      const targetNode = idToNode.get(target) as GraphNode;

      // adjacent edges
      let edgeSet = edgesBySource.get(source) || [];
      edgesBySource.set(source, edgeSet);
      edgeSet.push(edge);
      edgeSet = edgesByTarget.get(target) || [];
      edgesByTarget.set(target, edgeSet);
      edgeSet.push(edge);

      const points = getEdgePoints(sourceNode, targetNode);
      const material = basicMaterial({
        thickness: edge.attributes.width,
        color: new Color(rgbColor)
      });
      //const dashMaterial = dashedMaterial({ thickness: 2 });
      const geometry = new LineMesh(points, {
        distances: true
      });
      const mesh = new Mesh(geometry, material);
      scene.add(mesh);
      mesh.renderOrder = 0;
      idToMesh.set(id, mesh);
      idToEdge.set(id, edge);
      this.edgeMeshes.push(mesh);

      // arrows
      const arrowMaterial = basicMaterial({
        thickness: (2 * edge.attributes.width) / 3,
        color: new Color(rgbColor)
      });
      const arrowPoints = getArrowPoints(
        sourceNode,
        targetNode,
        targetNode.attributes.r
      );

      const arrowGeometry = new LineMesh(arrowPoints, {
        distances: true
      });
      const arrowMesh = new Mesh(arrowGeometry, arrowMaterial);
      scene.add(arrowMesh);
      idToMesh.set(id + 'arrow', arrowMesh);
    });

    this.edgesBySource = edgesBySource;
    this.edgesByTarget = edgesByTarget;
    this.idToNode = idToNode;
    this.idToEdge = idToEdge;

    this.nodes = nodes;
    this.edges = edges;
  }

  selectNode() {}

  highlight(graph: Graph | null) {
    this.nodes.forEach(({ id }) => {
      // TODO: findout why this is not working
      const obj = this.idToMesh.get(id)?.material as MeshBasicMaterial;
    });
    return;

    if (graph === null) {
      console.log(this.nodes, this.edges);
      this.nodes.forEach(
        ({ id }) =>
          ((this.idToMesh.get(id)?.material as MeshBasicMaterial).opacity = 1)
      );
      this.edges.forEach(({ _id: id }) => {
        console.log(id);
        const mesh = this.idToMesh.get(id);
        const arrowMesh = this.idToMesh.get(id + 'arrow');
        if (mesh) {
          // (mesh.material as ShaderMaterial).opacity = 1;
          // if (arrowMesh) (arrowMesh.material as ShaderMaterial).opacity = 1;
        }
      });
    } else {
      const included = new Set(graph.nodes.map((node) => node.id));
      const set = new Set();
      this.nodes.forEach((node) => {
        if (!included.has(node.id)) {
          (
            this.idToMesh.get(node.id)?.material as MeshBasicMaterial
          ).opacity = 0.15;
        } else set.add(node.id);
      });
      this.edges
        .filter((edge) => !set.has(edge.source) && !set.has(edge.target))
        .forEach(
          ({ id }) =>
            ((this.idToMesh.get(id)?.material as ShaderMaterial).opacity = 0.15)
        );
    }
  }

  moveNode(node: GraphNode, x: number, y: number) {
    node.attributes.x = x;
    node.attributes.y = y;
    const nodeMesh = this.idToMesh.get(node.id) as Mesh;
    nodeMesh.position.x = x;
    nodeMesh.position.y = y;

    const edgeSet = [
      ...(this.edgesBySource.get(node.id) || []),
      ...(this.edgesByTarget.get(node.id) || [])
    ];
    edgeSet?.forEach(({ _id: id, source, target }) => {
      const s = this.idToNode.get(source) as GraphNode;
      const t = this.idToNode.get(target) as GraphNode;
      const mesh = this.idToMesh.get(id) as Mesh<LineMesh>;
      const points = getEdgePoints(s, t);

      const arrow = this.idToMesh.get(id + 'arrow') as Mesh<LineMesh>;
      const arrowPoints = getArrowPoints(s, t, t.attributes.r);
      arrow.geometry.update(arrowPoints);
      mesh.geometry.update(points);
    });
    const textMesh = this.idToText.get(node.id);
    if (textMesh) {
      textMesh.position.x = x;
      textMesh.position.y = y - node.attributes.r;
    }
  }

  start() {
    this.frame();
    return this;
  }

  stop() {
    cancelAnimationFrame(this.frameTimer);
  }

  update() {
    // this.frame();
    // move items here
  }

  getElementAt(x: number, y: number) {
    const pos = this.screenToWorld(x, y);
    const node = this.nodeQ.find(pos.x, pos.y, 10);
    if (node) {
      const dx = node.attributes.x - pos.x;
      const dy = node.attributes.y - pos.y;
      const r = node.attributes.r;
      if (dx * dx + dy * dy > r * r) return null;
    }
    return node;
  }

  screenToWorld(sx: number, sy: number) {
    const x = (sx - this.width / (2 * this.dppx) - this.x) / this.k;
    const y = -(sy - this.height / (2 * this.dppx) - this.y) / this.k;
    return { x, y };
  }

  setView(x: number, y: number, k: number) {
    if (!this.gl) return;
    this.x = x;
    this.y = y;
    this.k = k;

    // rotation around Z can be added here
    positionThreeCamera(
      this.camera,
      { x, y, k },
      this.gl.drawingBufferWidth / this.dppx,
      this.gl.drawingBufferHeight / this.dppx,
      FOV
    );
  }

  frame = () => {
    if (!this.gl) return;
    this.renderer.render(this.scene, this.camera);
    this.gl.endFrameEXP();
    this.frameTimer = requestAnimationFrame(this.frame);
  };

  _frame = () => {
    if (!this.gl) return;
    this.update();
    this.renderer.render(this.scene, this.camera);
    this.gl.endFrameEXP();
  };

  async destroy() {
    this.renderer.dispose();
    // @ts-ignore
    delete this.gl;
  }
}
