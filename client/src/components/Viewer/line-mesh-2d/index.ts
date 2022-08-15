export { LineMesh } from "./LineMesh";
import basicShader from "./material/Basic";
import dashShader from "./material/Dashed";
import { ShaderMaterial, DoubleSide, Color } from "three";

export const basicMaterial = ({
  thickness = 0.1,
  color = new Color(0x5cd7ff),
  opacity = 1.0,
}) =>
  new ShaderMaterial(
    basicShader({
      side: DoubleSide,
      diffuse: color,
      thickness,
      opacity,
    })
  );

export const dashedMaterial = ({
  thickness = 0.1,
  opacity = 1.0,
  color = new Color(0x5cd7ff),
  dashSteps = 12,
  dashDistance = 0.2,
}) =>
  new ShaderMaterial(
    dashShader({
      side: DoubleSide,
      thickness: thickness,
      opacity,
      diffuse: color,
      dashSteps,
      dashDistance,
    })
  );
