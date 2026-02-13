
import React, { useState } from 'react';
import { Surface } from '../types';
import { NumericalOptimizer } from '../engine/optimizer';
import { Play, RotateCcw, Target, Zap, CheckCircle2 } from 'lucide-react';

interface Props {
  surfaces: Surface[];
  onUpdate: (surfaces: Surface[]) => void;
}

export const OptimizationPanel: React.FC<Props> = ({ surfaces, onUpdate }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [targetFreq, setTargetFreq] = useState(30);
  const [iterations, setIterations] = useState(50);
  const [score, setScore] = useState<number | null>(null);

  const runOptimization = async () => {
    setIsOptimizing(true);
    const result = await NumericalOptimizer.optimize(
      surfaces,
      targetFreq,
      iterations,
      (updatedSurfaces, currentScore) => {
        onUpdate(updatedSurfaces);
        setScore(currentScore);
      }
    );
    setIsOptimizing(false);
  };

  const variablesCount = surfaces.filter(s => s.isVariable).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
          <Zap size={18} className="text-amber-500" />
          MTF Optimization Engine
        </h2>
      </div>

      <div className="p-6 space-y-6 overflow-auto">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Target Frequency (lp/mm)</label>
            <div className="flex items-center gap-2">
              <Target size={16} className="text-slate-400" />
              <input 
                type="number" 
                value={targetFreq}
                onChange={(e) => setTargetFreq(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Max Iterations</label>
            <div className="flex items-center gap-2">
              <RotateCcw size={16} className="text-slate-400" />
              <input 
                type="number" 
                value={iterations}
                onChange={(e) => setIterations(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-800">Optimization Status</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isOptimizing ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-green-100 text-green-700'}`}>
              {isOptimizing ? 'RUNNING' : 'READY'}
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Active Variables:</span>
              <span className="font-mono font-bold text-slate-800">{variablesCount} (Radii)</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Current Merit Score (MTF):</span>
              <span className="font-mono font-bold text-blue-600">
                {score ? (score * 100).toFixed(2) : NumericalOptimizer.calculateMerit(surfaces, targetFreq).toFixed(4)}%
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={runOptimization}
            disabled={isOptimizing || variablesCount === 0}
            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-sm
              ${isOptimizing || variablesCount === 0 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'}`}
          >
            {isOptimizing ? (
              <>
                <RotateCcw className="animate-spin" size={20} />
                Optimizing Lens...
              </>
            ) : (
              <>
                <Play size={20} fill="currentColor" />
                Run MTF Optimization
              </>
            )}
          </button>
          {variablesCount === 0 && (
            <p className="text-[10px] text-red-500 mt-2 text-center font-medium">
              * Please mark at least one surface radius as "Variable" (V) in the editor.
            </p>
          )}
        </div>

        {!isOptimizing && score && (
          <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded border border-green-100 animate-in fade-in zoom-in">
            <CheckCircle2 size={18} />
            <span>Optimization finished. Merit improved!</span>
          </div>
        )}
      </div>
    </div>
  );
};
