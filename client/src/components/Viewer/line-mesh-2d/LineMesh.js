import getNormals from "polyline-normals";
import { BufferGeometry, BufferAttribute } from "three";

const VERTS_PER_POINT = 2;

export class LineMesh extends BufferGeometry {
  constructor(path, opt = {}) {
    super();

    if (Array.isArray(path)) {
      opt = opt || {};
    } else if (typeof path === "object") {
      opt = path;
      path = [];
    }

    this.setAttribute("position", new BufferAttribute(undefined, 3));
    this.setAttribute("lineNormal", new BufferAttribute(undefined, 2));
    this.setAttribute("lineMiter", new BufferAttribute(undefined, 1));
    if (opt.distances) {
      this.setAttribute("lineDistance", new BufferAttribute(undefined, 1));
    }
    if (typeof this.setIndex === "function") {
      this.setIndex(new BufferAttribute(undefined, 1));
    } else {
      this.setAttribute("index", new BufferAttribute(undefined, 1));
    }
    this.update(path, opt.closed);
  }

  update(path = [], closed) {
    var normals = getNormals(path, closed);

    if (closed) {
      path = path.slice();
      path.push(path[0]);
      normals.push(normals[0]);
    }

    const attrPosition = this.getAttribute("position");
    const attrNormal = this.getAttribute("lineNormal");
    const attrMiter = this.getAttribute("lineMiter");
    const attrDistance = this.getAttribute("lineDistance");
    const attrIndex =
      typeof this.getIndex === "function"
        ? this.getIndex()
        : this.getAttribute("index");

    const indexCount = Math.max(0, (path.length - 1) * 6);
    let count;
    if (
      !attrPosition.array ||
      path.length !== attrPosition.array.length / 3 / VERTS_PER_POINT
    ) {
      count = path.length * VERTS_PER_POINT;
      attrPosition.array = new Float32Array(count * 3);
      attrNormal.array = new Float32Array(count * 2);
      attrMiter.array = new Float32Array(count);
      attrIndex.array = new Uint16Array(indexCount);

      if (attrDistance) {
        attrDistance.array = new Float32Array(count);
      }
    }

    if (undefined !== attrPosition.count) {
      attrPosition.count = count;
    }
    attrPosition.needsUpdate = true;

    if (undefined !== attrNormal.count) {
      attrNormal.count = count;
    }
    attrNormal.needsUpdate = true;

    if (undefined !== attrMiter.count) {
      attrMiter.count = count;
    }
    attrMiter.needsUpdate = true;

    if (undefined !== attrIndex.count) {
      attrIndex.count = indexCount;
    }
    attrIndex.needsUpdate = true;

    if (attrDistance) {
      if (undefined !== attrDistance.count) {
        attrDistance.count = count;
      }
      attrDistance.needsUpdate = true;
    }

    var index = 0;
    var c = 0;
    var dIndex = 0;
    var indexArray = attrIndex.array;

    path.forEach((point, pointIndex, list) => {
      var i = index;
      indexArray[c++] = i + 0;
      indexArray[c++] = i + 1;
      indexArray[c++] = i + 2;
      indexArray[c++] = i + 2;
      indexArray[c++] = i + 1;
      indexArray[c++] = i + 3;

      attrPosition.setXYZ(index++, point[0], point[1], 0);
      attrPosition.setXYZ(index++, point[0], point[1], 0);

      if (attrDistance) {
        var d = pointIndex / (list.length - 1);
        attrDistance.setX(dIndex++, d);
        attrDistance.setX(dIndex++, d);
      }
    });

    let nIndex = 0;
    let mIndex = 0;
    normals.forEach(([norm, miter]) => {
      attrNormal.setXY(nIndex++, norm[0], norm[1]);
      attrNormal.setXY(nIndex++, norm[0], norm[1]);

      attrMiter.setX(mIndex++, -miter);
      attrMiter.setX(mIndex++, miter);
    });
  }
}
