
import React, { useMemo } from 'react';
import { Surface, MTFData } from '../types';
import { RayTracer } from '../engine/raytracer';

interface Props {
  surfaces: Surface[];
}

export const MTFAnalysis: React.FC<Props> = ({ surfaces }) => {
  const maxFreq = 100;
  const padding = 50;
  const width = 600;
  const height = 400;

  const fields = [0, 7, 14]; // Degrees
  const colors = ['#2563eb', '#16a34a', '#dc2626'];

  const mtfSeries = useMemo(() => {
    return fields.map(f => RayTracer.calculateMTF(surfaces, f, maxFreq));
  }, [surfaces]);

  const renderGrid = () => {
    const lines = [];
    // Horizontal
    for (let i = 0; i <= 10; i++) {
      const y = padding + (i / 10) * (height - 2 * padding);
      lines.push(
        <g key={`h${i}`}>
          <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e2e8f0" strokeWidth="1" />
          <text x={padding - 10} y={y + 4} fontSize="10" textAnchor="end" fill="#94a3b8">{(1 - i / 10).toFixed(1)}</text>
        </g>
      );
    }
    // Vertical
    for (let i = 0; i <= 5; i++) {
      const x = padding + (i / 5) * (width - 2 * padding);
      lines.push(
        <g key={`v${i}`}>
          <line x1={x} y1={padding} x2={x} y2={height - padding} stroke="#e2e8f0" strokeWidth="1" />
          <text x={x} y={height - padding + 15} fontSize="10" textAnchor="middle" fill="#94a3b8">{i * (maxFreq / 5)}</text>
        </g>
      );
    }
    return lines;
  };

  const renderCurves = () => {
    return mtfSeries.map((data, idx) => {
      const tPoints = data.map(d => {
        const x = padding + (d.frequency / maxFreq) * (width - 2 * padding);
        const y = height - padding - d.tangential * (height - 2 * padding);
        return `${x},${y}`;
      }).join(' ');

      const sPoints = data.map(d => {
        const x = padding + (d.frequency / maxFreq) * (width - 2 * padding);
        const y = height - padding - d.sagittal * (height - 2 * padding);
        return `${x},${y}`;
      }).join(' ');

      return (
        <g key={idx}>
          <polyline points={tPoints} fill="none" stroke={colors[idx]} strokeWidth="2" />
          <polyline points={sPoints} fill="none" stroke={colors[idx]} strokeWidth="1.5" strokeDasharray="4,2" />
        </g>
      );
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h2 className="font-semibold text-slate-700">Modulation Transfer Function (Geometric)</h2>
        <div className="flex gap-4 text-[10px] font-bold">
           <span className="flex items-center gap-1"><div className="w-3 h-0.5 bg-slate-400" /> Tangential</span>
           <span className="flex items-center gap-1"><div className="w-3 h-0.5 border-t border-dashed border-slate-400" /> Sagittal</span>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative">
          <svg width={width} height={height} className="overflow-visible">
            {renderGrid()}
            {renderCurves()}
            
            {/* Axis Labels */}
            <text x={width/2} y={height - 5} textAnchor="middle" className="text-[12px] fill-slate-500 font-medium">Spatial Frequency (cycles/mm)</text>
            <text x={15} y={height/2} textAnchor="middle" transform={`rotate(-90, 15, ${height/2})`} className="text-[12px] fill-slate-500 font-medium">Modulation</text>
          </svg>
          
          {/* Legend */}
          <div className="absolute top-12 right-12 bg-white/80 p-2 border border-slate-100 rounded text-[10px] shadow-sm">
            {fields.map((f, i) => (
              <div key={f} className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i] }} />
                <span className="text-slate-600">Field {f}°</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
