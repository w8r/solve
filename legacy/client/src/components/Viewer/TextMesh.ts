import { Mesh, Vector3 } from 'three'; // 2.2.2-alpha.1
import {
  TextGeometry,
  TextGeometryParameters
} from 'three/examples/jsm/geometries/TextGeometry';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader'; // 2.2.2-alpha.1

import font from 'three/examples/fonts/droid/droid_sans_regular.typeface.json';

/**
 * @property font — an instance of THREE.Font.
 * @property size — Float. Size of the text. Default is 100.
 * @property height — Float. Thickness to extrude text. Default is 50.
 * @property curveSegments — Integer. Number of points on the curves. Default is 12.
 * @property bevelEnabled — Boolean. Turn on bevel. Default is False.
 * @property bevelThickness — Float. How deep into text bevel goes. Default is 10.
 * @property bevelSize — Float. How far from text outline is bevel. Default is 8.
 * @property bevelSegments — Integer. Number of bevel segments. Default is 3.
 */
interface Params extends TextGeometryParameters {
  text: string;
  font: Font;
}

export { font };

export class TextMesh extends Mesh {
  params: Params = { text: '' } as Params;
  size = new Vector3();

  get text() {
    return this.params.text;
  }

  set text(text: string) {
    this.update({ text });
  }

  update = (props: Partial<Params> = {}) => {
    this.params = { ...this.params, ...props };
    if (this.geometry) {
      this.geometry.dispose();
    }

    this.params.font = this.params.font || this.loadFontFromJson(font);

    if (!this.params.font) {
      console.warn(
        'TextMesh.updateWithParams: font is required to create TextGeometry!'
      );
      return;
    }
    this.geometry = new TextGeometry(
      this.params.text,
      this.params as TextGeometryParameters
    );
    this.geometry.computeBoundingBox();
    this.geometry.computeVertexNormals();
    // update size so that we can position the text correctly
    this.geometry.boundingBox?.getSize(this.size);
    return this.geometry;
  };

  loadFontFromJson = (json: any) => {
    const font = new FontLoader().parse(json);
    this.update({ font });
    return font;
  };
}
