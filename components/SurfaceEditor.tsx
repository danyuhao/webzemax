
import React from 'react';
import { Surface } from '../types';
import { Trash2, Plus, Lock, Unlock } from 'lucide-react';

interface Props {
  surfaces: Surface[];
  onChange: (surfaces: Surface[]) => void;
}

export const SurfaceEditor: React.FC<Props> = ({ surfaces, onChange }) => {
  const updateSurface = (id: string, field: keyof Surface, value: any) => {
    onChange(surfaces.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addSurface = () => {
    const newSurface: Surface = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Surface ${surfaces.length + 1}`,
      radius: Infinity,
      thickness: 10,
      material: 'AIR',
      refractiveIndex: 1.0,
      semiDiameter: 20,
      comment: '',
      isVariable: false
    };
    onChange([...surfaces, newSurface]);
  };

  const removeSurface = (id: string) => {
    onChange(surfaces.filter(s => s.id !== id));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h2 className="font-semibold text-slate-700 flex items-center gap-2 text-sm">
          Prescription Editor
        </h2>
        <button 
          onClick={addSurface}
          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors"
        >
          <Plus size={14} /> Add
        </button>
      </div>
      
      <div className="overflow-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead className="sticky top-0 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            <tr>
              <th className="px-3 py-2 border-b border-slate-200 w-8 text-center">V</th>
              <th className="px-3 py-2 border-b border-slate-200">Name</th>
              <th className="px-3 py-2 border-b border-slate-200">Radius</th>
              <th className="px-3 py-2 border-b border-slate-200">Thick</th>
              <th className="px-3 py-2 border-b border-slate-200">Glass</th>
              <th className="px-3 py-2 border-b border-slate-200">SD</th>
              <th className="px-3 py-2 border-b border-slate-200 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[11px] font-mono">
            {surfaces.map((s) => (
              <tr key={s.id} className={`hover:bg-blue-50/30 transition-colors ${s.isVariable ? 'bg-amber-50/30' : ''}`}>
                <td className="px-2 py-1 text-center">
                  <input 
                    type="checkbox"
                    checked={s.isVariable}
                    onChange={(e) => updateSurface(s.id, 'isVariable', e.target.checked)}
                    className="w-3 h-3 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    title="Optimization Variable"
                  />
                </td>
                <td className="px-3 py-1">
                  <input 
                    className="w-full bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                    value={s.name}
                    onChange={(e) => updateSurface(s.id, 'name', e.target.value)}
                  />
                </td>
                <td className="px-3 py-1">
                  <div className="flex items-center gap-1">
                    <input 
                      type="number"
                      step="0.1"
                      className="w-full bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded px-1 text-blue-700 font-bold"
                      value={s.radius === Infinity ? 0 : s.radius}
                      onChange={(e) => updateSurface(s.id, 'radius', parseFloat(e.target.value) || Infinity)}
                    />
                  </div>
                </td>
                <td className="px-3 py-1">
                  <input 
                    type="number"
                    step="0.1"
                    className="w-full bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                    value={s.thickness}
                    onChange={(e) => updateSurface(s.id, 'thickness', parseFloat(e.target.value) || 0)}
                  />
                </td>
                <td className="px-3 py-1">
                  <div className="flex gap-1">
                    <input 
                      placeholder="Glass"
                      className="w-14 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded px-1 text-slate-500"
                      value={s.material}
                      onChange={(e) => updateSurface(s.id, 'material', e.target.value)}
                    />
                    <input 
                      type="number"
                      step="0.0001"
                      className="w-12 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded px-1 text-slate-400"
                      value={s.refractiveIndex}
                      onChange={(e) => updateSurface(s.id, 'refractiveIndex', parseFloat(e.target.value) || 1.0)}
                    />
                  </div>
                </td>
                <td className="px-3 py-1">
                   <input 
                    type="number"
                    step="0.1"
                    className="w-full bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                    value={s.semiDiameter}
                    onChange={(e) => updateSurface(s.id, 'semiDiameter', parseFloat(e.target.value) || 0)}
                  />
                </td>
                <td className="px-3 py-1">
                  <button 
                    onClick={() => removeSurface(s.id)}
                    className="text-slate-300 hover:text-red-500 p-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-2 bg-slate-50 border-t border-slate-200 text-[9px] text-slate-400 flex justify-between">
         <span>V: Toggle optimization variable</span>
         <span>R=0: Infinity (Plane)</span>
      </div>
    </div>
  );
};
