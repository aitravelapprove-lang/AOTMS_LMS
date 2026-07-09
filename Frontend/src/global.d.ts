export { };

declare module '*.glb';
declare module '*.png';

declare module 'meshline' {
  import { BufferGeometry, ShaderMaterial } from 'three';
  export class MeshLineGeometry extends BufferGeometry {
    constructor();
    setPoints(points: number[] | Float32Array | THREE.Vector3[]): void;
  }
  export class MeshLineMaterial extends ShaderMaterial {
    constructor(parameters?: Record<string, unknown>);
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: import('@react-three/fiber').Object3DNode<unknown, unknown>;
      meshLineMaterial: import('@react-three/fiber').Object3DNode<unknown, unknown>;
    }
  }
}
