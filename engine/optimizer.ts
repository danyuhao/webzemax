
import { Surface, MTFData } from '../types';
import { RayTracer } from './raytracer';

export class NumericalOptimizer {
  /**
   * Calculates a "Merit Score" based on MTF performance.
   * Higher is better.
   */
  static calculateMerit(surfaces: Surface[], targetFreq: number): number {
    const fields = [0, 7, 14];
    let totalMTF = 0;

    fields.forEach(angle => {
      const data = RayTracer.calculateMTF(surfaces, angle, targetFreq);
      // Get the last data point which corresponds to targetFreq
      const point = data[data.length - 1];
      totalMTF += (point.tangential + point.sagittal) / 2;
    });

    return totalMTF / fields.length;
  }

  /**
   * Performs a local search to improve MTF by adjusting radii.
   */
  static async optimize(
    surfaces: Surface[], 
    targetFreq: number, 
    iterations: number,
    onProgress: (surfaces: Surface[], score: number) => void
  ): Promise<Surface[]> {
    let currentSurfaces = JSON.parse(JSON.stringify(surfaces)) as Surface[];
    let currentScore = this.calculateMerit(currentSurfaces, targetFreq);
    
    const delta = 0.5; // Tweak amount in mm

    for (let iter = 0; iter < iterations; iter++) {
      let improved = false;

      for (let i = 0; i < currentSurfaces.length; i++) {
        const s = currentSurfaces[i];
        if (!s.isVariable || s.radius === Infinity) continue;

        const originalRadius = s.radius;

        // Try +delta
        s.radius = originalRadius + delta;
        let scorePlus = this.calculateMerit(currentSurfaces, targetFreq);

        // Try -delta
        s.radius = originalRadius - delta;
        let scoreMinus = this.calculateMerit(currentSurfaces, targetFreq);

        if (scorePlus > currentScore && scorePlus >= scoreMinus) {
          s.radius = originalRadius + delta;
          currentScore = scorePlus;
          improved = true;
        } else if (scoreMinus > currentScore) {
          s.radius = originalRadius - delta;
          currentScore = scoreMinus;
          improved = true;
        } else {
          s.radius = originalRadius; // Revert
        }
      }

      onProgress([...currentSurfaces], currentScore);
      
      // Artificial delay to show the process if needed, or just yield
      if (iter % 5 === 0) await new Promise(r => setTimeout(r, 10));
      
      if (!improved) break; // Local maximum reached
    }

    return currentSurfaces;
  }
}
