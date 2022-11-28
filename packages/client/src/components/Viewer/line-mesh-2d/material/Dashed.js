import number from "as-number";

export default function (opt = {}) {
  const ret = {
    transparent: true,
    uniforms: {
      thickness: { type: "f", value: number(opt.thickness, 0.1) },
      opacity: { type: "f", value: number(opt.opacity, 1.0) },
      diffuse: { type: "c", value: opt.diffuse },
      dashSteps: { type: "f", value: number(opt.dashSteps, 12) },
      dashDistance: { type: "f", value: number(opt.dashDistance, 0.2) },
      dashSmooth: { type: "f", value: 0.01 },
    },
    vertexShader: [
      "uniform float thickness;",
      "attribute float lineMiter;",
      "attribute vec2 lineNormal;",
      "attribute float lineDistance;",
      "varying float lineU;",

      "void main() {",
      "lineU = lineDistance;",
      "vec3 pointPos = position.xyz + vec3(lineNormal * thickness/2.0 * lineMiter, 0.0);",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( pointPos, 1.0 );",
      "}",
    ].join("\n"),
    fragmentShader: [
      "varying float lineU;",

      "uniform float opacity;",
      "uniform vec3 diffuse;",
      "uniform float dashSteps;",
      "uniform float dashSmooth;",
      "uniform float dashDistance;",

      "void main() {",
      "float lineUMod = mod(lineU, 1.0/dashSteps) * dashSteps;",
      "float dash = smoothstep(dashDistance, dashDistance+dashSmooth, length(lineUMod-0.5));",
      "gl_FragColor = vec4(diffuse * vec3(dash), opacity * dash);",
      "}",
    ].join("\n"),
    ...opt,
  };

  // remove to satisfy r73
  delete ret.thickness;
  delete ret.opacity;
  delete ret.diffuse;
  delete ret.dashDistance;
  delete ret.dashSteps;

  return ret;
}
