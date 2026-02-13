
export interface Surface {
  id: string;
  name: string;
  radius: number; // 0 for infinity (plane)
  thickness: number;
  material: string;
  refractiveIndex: number;
  semiDiameter: number;
  comment: string;
  isVariable?: boolean; // New: for optimization
}

export interface Ray {
  origin: { x: number; y: number; z: number };
  direction: { x: number; y: number; z: number };
  intensity: number;
  wavelength: number; // in nm
}

export interface Intersection {
  point: { x: number; y: number; z: number };
  normal: { x: number; y: number; z: number };
  t: number;
}

export interface LensSystem {
  surfaces: Surface[];
}

export interface RayPath {
  points: { x: number; y: number; z: number }[];
  color: string;
}

export interface MTFData {
  frequency: number;
  tangential: number;
  sagittal: number;
  fieldAngle: number;
}
