
import { Surface } from './types';

export const INITIAL_LENS: Surface[] = [
  {
    id: 's1',
    name: 'Front Lens (L1)',
    radius: 40,
    thickness: 8,
    material: 'BK7',
    refractiveIndex: 1.5168,
    semiDiameter: 25,
    comment: 'First crown element'
  },
  {
    id: 's2',
    name: 'Rear L1',
    radius: -100,
    thickness: 2,
    material: 'AIR',
    refractiveIndex: 1.0,
    semiDiameter: 25,
    comment: ''
  },
  {
    id: 's3',
    name: 'Flint Element (L2)',
    radius: -40,
    thickness: 4,
    material: 'SF2',
    refractiveIndex: 1.6477,
    semiDiameter: 22,
    comment: 'Corrective flint'
  },
  {
    id: 's4',
    name: 'Rear L2',
    radius: 80,
    thickness: 50,
    material: 'AIR',
    refractiveIndex: 1.0,
    semiDiameter: 22,
    comment: ''
  },
  {
    id: 's5',
    name: 'Image Plane',
    radius: Infinity,
    thickness: 0,
    material: 'AIR',
    refractiveIndex: 1.0,
    semiDiameter: 20,
    comment: ''
  }
];
