
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Surface, RayPath } from '../types';
import { RayTracer } from '../engine/raytracer';
import { ZoomIn, ZoomOut, Maximize, MousePointer2, Ruler, Info } from 'lucide-react';

interface Props {
  surfaces: Surface[];
}

export const LensLayout: React.FC<Props> = ({ surfaces }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [hoveredSurface, setHoveredSurface] = useState<string | null>(null);

  const baseScale = 5;
  const padding = 100;
  
  // Calculate system bounds for initial view
  const systemLength = surfaces.reduce((acc, s) => acc + s.thickness, 0);
  const maxSD = Math.max(...surfaces.map(s => s.semiDiameter), 20);

  const viewWidth = 800;
  const viewHeight = 500;
  const centerY = viewHeight / 2;

  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(Math.max(prev * delta, 0.2), 10));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) setIsPanning(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setOffset(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsPanning(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const rayPaths = useMemo(() => {
    const paths: RayPath[] = [];
    const wavelengths = [656.3, 587.6, 486.1];
    const fieldAngles = [0, 5, 10];

    fieldAngles.forEach(angle => {
      wavelengths.forEach(wl => {
        for (let i = -2; i <= 2; i++) {
          const dy = (i / 2) * (surfaces[0]?.semiDiameter || 10) * 0.8;
          const angleRad = (angle * Math.PI) / 180;
          const ray = {
            origin: { x: 0, y: dy, z: -20 },
            direction: { x: 0, y: Math.sin(angleRad), z: Math.cos(angleRad) },
            intensity: 1,
            wavelength: wl
          };
          paths.push(RayTracer.traceRay(ray, surfaces));
        }
      });
    });
    return paths;
  }, [surfaces]);

  const renderElements = () => {
    let currentZ = 0;
    const elements = [];

    for (let i = 0; i < surfaces.length; i++) {
      const s1 = surfaces[i];
      const s2 = surfaces[i + 1];
      const x1 = currentZ * baseScale;
      const sd1 = s1.semiDiameter * baseScale;
      
      // Draw Surface line
      let d = "";
      if (s1.radius === Infinity || Math.abs(s1.radius) < 1e-6) {
        d = `M ${x1} ${centerY - sd1} L ${x1} ${centerY + sd1}`;
      } else {
        const r = s1.radius * baseScale;
        const sweep = s1.radius > 0 ? 0 : 1;
        d = `M ${x1} ${centerY - sd1} A ${Math.abs(r)} ${Math.abs(r)} 0 0 ${sweep} ${x1} ${centerY + sd1}`;
      }

      elements.push(
        <g key={`surf-${s1.id}`} 
           onMouseEnter={() => setHoveredSurface(s1.id)}
           onMouseLeave={() => setHoveredSurface(null)}
           className="cursor-help"
        >
          <path 
            d={d} 
            fill="none" 
            stroke={hoveredSurface === s1.id ? "#2563eb" : "#475569"} 
            strokeWidth={hoveredSurface === s1.id ? "3" : "1.5"}
            className="transition-all"
          />
          {showAnnotations && (
            <g className="pointer-events-none">
              {/* Vertex Crosshair */}
              <line x1={x1-3} y1={centerY} x2={x1+3} y2={centerY} stroke="#94a3b8" strokeWidth="0.5" />
              <line x1={x1} y1={centerY-3} x2={x1} y2={centerY+3} stroke="#94a3b8" strokeWidth="0.5" />
              
              {/* Surface Label */}
              <text x={x1} y={centerY - sd1 - 10} fontSize="8" fill="#64748b" textAnchor="middle" fontWeight="bold">
                {s1.name}
              </text>
              <text x={x1} y={centerY + sd1 + 15} fontSize="7" fill="#94a3b8" textAnchor="middle">
                R: {s1.radius === Infinity ? '∞' : s1.radius.toFixed(1)}
              </text>
            </g>
          )}
        </g>
      );

      // Draw Glass Shading if next surface exists and material is not AIR
      if (s2 && s1.material !== 'AIR') {
        const x2 = (currentZ + s1.thickness) * baseScale;
        const sd2 = s2.semiDiameter * baseScale;
        
        // Simple quadrilateral for glass block shading (approximated)
        elements.push(
          <path 
            key={`glass-${s1.id}`}
            d={`M ${x1} ${centerY - sd1} L ${x2} ${centerY - sd2} L ${x2} ${centerY + sd2} L ${x1} ${centerY + sd1} Z`}
            fill="#3b82f6" 
            fillOpacity="0.05"
            stroke="none"
          />
        );
      }

      currentZ += s1.thickness;
    }
    return elements;
  };

  const renderRays = () => {
    return rayPaths.map((path, idx) => {
      const points = path.points.map(p => `${p.z * baseScale},${centerY + p.y * baseScale}`).join(' ');
      return <polyline key={idx} points={points} fill="none" stroke={path.color} strokeWidth="0.6" strokeOpacity="0.5" />;
    });
  };

  return (
    <div className="bg-slate-50 rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full relative group">
      {/* Top Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="flex bg-white/90 backdrop-blur shadow-md rounded-lg border border-slate-200 p-1">
          <button onClick={() => setZoom(z => z * 1.2)} className="p-2 hover:bg-slate-100 rounded text-slate-600" title="Zoom In"><ZoomIn size={18}/></button>
          <button onClick={() => setZoom(z => z * 0.8)} className="p-2 hover:bg-slate-100 rounded text-slate-600" title="Zoom Out"><ZoomOut size={18}/></button>
          <button onClick={resetView} className="p-2 hover:bg-slate-100 rounded text-slate-600" title="Reset View"><Maximize size={18}/></button>
        </div>
        <div className="flex bg-white/90 backdrop-blur shadow-md rounded-lg border border-slate-200 p-1">
          <button 
            onClick={() => setShowAnnotations(!showAnnotations)} 
            className={`p-2 rounded transition-colors ${showAnnotations ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-600'}`}
            title="Toggle Annotations"
          >
            <Ruler size={18}/>
          </button>
        </div>
      </div>

      {/* Floating Info Badge */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur text-white px-3 py-1.5 rounded-full text-[10px] font-mono flex items-center gap-2 shadow-lg">
          <MousePointer2 size={12} />
          SCROLL TO ZOOM • DRAG TO PAN
        </div>
      </div>

      {/* Viewport */}
      <div className="flex-1 cursor-grab active:cursor-grabbing overflow-hidden outline-none"
           onWheel={handleWheel}
           onMouseDown={handleMouseDown}
           onMouseMove={handleMouseMove}
      >
        <svg 
          ref={svgRef}
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${viewWidth} ${viewHeight}`}
          className="bg-white"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          <g transform={`translate(${viewWidth/2 + offset.x}, ${centerY + offset.y}) scale(${zoom}) translate(${-systemLength*baseScale/2}, ${-centerY})`}>
            {/* Axis */}
            <line x1="-100" y1={centerY} x2={systemLength * baseScale + 100} y2={centerY} stroke="#e2e8f0" strokeDasharray="4,4" />
            
            {renderRays()}
            {renderElements()}

            {/* Scale Bar Approximation */}
            {showAnnotations && (
               <g transform={`translate(0, ${centerY + maxSD * baseScale + 40})`}>
                  <line x1="0" y1="0" x2="50" y2="0" stroke="#64748b" strokeWidth="1.5" />
                  <line x1="0" y1="-3" x2="0" y2="3" stroke="#64748b" strokeWidth="1" />
                  <line x1="50" y1="-3" x2="50" y2="3" stroke="#64748b" strokeWidth="1" />
                  <text x="25" y="12" fontSize="8" textAnchor="middle" fill="#64748b">10mm</text>
               </g>
            )}
          </g>
        </svg>
      </div>

      {/* Hover Info Tooltip */}
      {hoveredSurface && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur border border-blue-200 p-3 rounded-lg shadow-xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-blue-600 p-2 rounded text-white">
            <Info size={20} />
          </div>
          <div className="flex-1 grid grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Surface</p>
              <p className="text-sm font-semibold">{surfaces.find(s => s.id === hoveredSurface)?.name}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Radius</p>
              <p className="text-sm font-semibold">{surfaces.find(s => s.id === hoveredSurface)?.radius.toFixed(2)} mm</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Material</p>
              <p className="text-sm font-semibold">{surfaces.find(s => s.id === hoveredSurface)?.material} (n={surfaces.find(s => s.id === hoveredSurface)?.refractiveIndex})</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Semi-Diameter</p>
              <p className="text-sm font-semibold">{surfaces.find(s => s.id === hoveredSurface)?.semiDiameter.toFixed(2)} mm</p>
            </div>
          </div>
        </div>
      )}

      {/* Legend Overlay */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[10px] font-mono text-slate-500">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full" /> 656nm</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full" /> 587nm</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full" /> 486nm</span>
        </div>
        <div>ZOOM: {(zoom * 100).toFixed(0)}%</div>
      </div>
    </div>
  );
};
