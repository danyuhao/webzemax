
import { Surface, Ray, Intersection, RayPath, MTFData } from '../types';

export class RayTracer {
  static traceRay(ray: Ray, surfaces: Surface[]): RayPath {
    const path: { x: number; y: number; z: number }[] = [{ ...ray.origin }];
    let currentRay = { ...ray };
    let currentZ = ray.origin.z;

    for (let i = 0; i < surfaces.length; i++) {
      const surface = surfaces[i];
      const nextIntersection = this.findIntersection(currentRay, surface, currentZ);
      
      if (!nextIntersection) break;
      path.push(nextIntersection.point);

      const n1 = i === 0 ? 1.0 : surfaces[i - 1].refractiveIndex;
      const n2 = surface.refractiveIndex;
      
      const refractedDir = this.refract(currentRay.direction, nextIntersection.normal, n1, n2);
      if (!refractedDir) break;

      currentRay = {
        origin: nextIntersection.point,
        direction: refractedDir,
        intensity: currentRay.intensity,
        wavelength: currentRay.wavelength
      };
      currentZ += surface.thickness;
    }

    return { points: path, color: this.getWavelengthColor(ray.wavelength) };
  }

  /**
   * Calculates Geometric MTF for a specific field angle
   */
  static calculateMTF(surfaces: Surface[], fieldAngleDeg: number, maxFreq: number = 100): MTFData[] {
    const angleRad = (fieldAngleDeg * Math.PI) / 180;
    const wl = 587.6; // d-line
    const gridCount = 12; // 12x12 ray grid
    const sd = surfaces[0].semiDiameter;
    
    // 1. Collect intercepts at image plane
    const intercepts: {dy: number, dx: number}[] = [];
    const refRay = this.traceRay({
      origin: { x: 0, y: 0, z: -10 },
      direction: { x: 0, y: Math.sin(angleRad), z: Math.cos(angleRad) },
      intensity: 1, wavelength: wl
    }, surfaces);
    
    const refPoint = refRay.points[refRay.points.length - 1];

    for (let i = -gridCount; i <= gridCount; i++) {
      for (let j = -gridCount; j <= gridCount; j++) {
        const px = (i / gridCount) * sd;
        const py = (j / gridCount) * sd;
        if (px*px + py*py > sd*sd) continue;

        const ray = {
          origin: { x: px, y: py, z: -10 },
          direction: { x: 0, y: Math.sin(angleRad), z: Math.cos(angleRad) },
          intensity: 1, wavelength: wl
        };
        const path = this.traceRay(ray, surfaces);
        if (path.points.length === surfaces.length + 1) {
          const p = path.points[path.points.length - 1];
          intercepts.push({ dx: p.x - refPoint.x, dy: p.y - refPoint.y });
        }
      }
    }

    // 2. Compute MTF vs Frequency
    const results: MTFData[] = [];
    for (let f = 0; f <= maxFreq; f += maxFreq / 20) {
      let sumT_cos = 0, sumT_sin = 0;
      let sumS_cos = 0, sumS_sin = 0;
      
      intercepts.forEach(p => {
        const phaseT = 2 * Math.PI * f * p.dy;
        const phaseS = 2 * Math.PI * f * p.dx;
        sumT_cos += Math.cos(phaseT);
        sumT_sin += Math.sin(phaseT);
        sumS_cos += Math.cos(phaseS);
        sumS_sin += Math.sin(phaseS);
      });

      const count = intercepts.length || 1;
      results.push({
        frequency: f,
        tangential: Math.sqrt(sumT_cos**2 + sumT_sin**2) / count,
        sagittal: Math.sqrt(sumS_cos**2 + sumS_sin**2) / count,
        fieldAngle: fieldAngleDeg
      });
    }

    return results;
  }

  private static findIntersection(ray: Ray, surface: Surface, surfaceStartZ: number): Intersection | null {
    const R = surface.radius;
    const isPlane = Math.abs(R) < 1e-6 || R === Infinity;
    const zOffset = surfaceStartZ;

    if (isPlane) {
      const t = (zOffset - ray.origin.z) / ray.direction.z;
      if (t < 0) return null;
      return {
        point: { x: ray.origin.x + ray.direction.x * t, y: ray.origin.y + ray.direction.y * t, z: zOffset },
        normal: { x: 0, y: 0, z: -1 },
        t
      };
    } else {
      const cx = 0, cy = 0, cz = zOffset + R;
      const oc = { x: ray.origin.x - cx, y: ray.origin.y - cy, z: ray.origin.z - cz };
      const a = ray.direction.x**2 + ray.direction.y**2 + ray.direction.z**2;
      const b = 2 * (oc.x * ray.direction.x + oc.y * ray.direction.y + oc.z * ray.direction.z);
      const c = oc.x**2 + oc.y**2 + oc.z**2 - R**2;
      const disc = b * b - 4 * a * c;
      if (disc < 0) return null;
      let t = (-b - Math.sqrt(disc)) / (2 * a);
      if (t < 0) t = (-b + Math.sqrt(disc)) / (2 * a);
      if (t < 0) return null;
      const p = { x: ray.origin.x + ray.direction.x * t, y: ray.origin.y + ray.direction.y * t, z: ray.origin.z + ray.direction.z * t };
      const n = { x: (p.x - cx) / R, y: (p.y - cy) / R, z: (p.z - cz) / R };
      const flip = (n.x * ray.direction.x + n.y * ray.direction.y + n.z * ray.direction.z) > 0 ? -1 : 1;
      return { point: p, normal: { x: n.x * flip, y: n.y * flip, z: n.z * flip }, t };
    }
  }

  private static refract(incident: any, normal: any, n1: number, n2: number) {
    const ratio = n1 / n2;
    const cosI = -(incident.x * normal.x + incident.y * normal.y + incident.z * normal.z);
    const sin2T = ratio * ratio * (1 - cosI * cosI);
    if (sin2T > 1) return null;
    const cosT = Math.sqrt(1 - sin2T);
    return {
      x: ratio * incident.x + (ratio * cosI - cosT) * normal.x,
      y: ratio * incident.y + (ratio * cosI - cosT) * normal.y,
      z: ratio * incident.z + (ratio * cosI - cosT) * normal.z
    };
  }

  private static getWavelengthColor(wl: number): string {
    if (wl < 450) return '#4B0082';
    if (wl < 495) return '#0000FF';
    if (wl < 570) return '#00FF00';
    if (wl < 590) return '#FFFF00';
    if (wl < 620) return '#FFA500';
    return '#FF0000';
  }
}
