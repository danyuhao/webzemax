
import React, { useState } from 'react';
import { SurfaceEditor } from './components/SurfaceEditor';
import { LensLayout } from './components/LensLayout';
import { MTFAnalysis } from './components/MTFAnalysis';
import { OptimizationPanel } from './components/OptimizationPanel';
import { AISuggestions } from './components/AISuggestions';
import { INITIAL_LENS } from './constants';
import { Surface } from './types';
import { Layout, Microscope, Settings, Info, Box, Activity, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [surfaces, setSurfaces] = useState<Surface[]>(INITIAL_LENS);
  const [activeTab, setActiveTab] = useState<'layout' | 'mtf' | 'opt'>('layout');

  return (
    <div className="h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      {/* Header */}
      <header className="h-14 bg-slate-900 text-white flex items-center px-6 justify-between shrink-0 shadow-lg z-20">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Microscope size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">OptiWeb <span className="text-blue-400 font-light">Pro</span></h1>
        </div>
        
        <nav className="flex items-center gap-6">
          <button 
            onClick={() => setActiveTab('layout')}
            className={`flex items-center gap-2 transition-colors text-sm font-medium ${activeTab === 'layout' ? 'text-blue-400' : 'hover:text-blue-400'}`}
          >
            <Layout size={18} /> Designer
          </button>
          <button 
            onClick={() => setActiveTab('mtf')}
            className={`flex items-center gap-2 transition-colors text-sm font-medium ${activeTab === 'mtf' ? 'text-blue-400' : 'hover:text-blue-400'}`}
          >
            <Activity size={18} /> MTF Analysis
          </button>
          <button 
            onClick={() => setActiveTab('opt')}
            className={`flex items-center gap-2 transition-colors text-sm font-medium ${activeTab === 'opt' ? 'text-blue-400' : 'hover:text-blue-400'}`}
          >
            <Zap size={18} /> Optimization
          </button>
        </nav>
      </header>

      {/* Main Workbench */}
      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Panel: Controls and Editor */}
        <div className="w-1/3 flex flex-col gap-4 overflow-hidden">
          <AISuggestions onApplyLens={setSurfaces} />
          <SurfaceEditor surfaces={surfaces} onChange={setSurfaces} />
        </div>

        {/* Right Panel: Visualization */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 overflow-hidden">
             {activeTab === 'layout' ? (
               <LensLayout surfaces={surfaces} />
             ) : activeTab === 'mtf' ? (
               <MTFAnalysis surfaces={surfaces} />
             ) : (
               <OptimizationPanel surfaces={surfaces} onUpdate={setSurfaces} />
             )}
          </div>
          
          {/* Quick Stats / Feedback */}
          <div className="h-24 bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex items-center gap-8 overflow-x-auto">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Total Length</p>
              <p className="text-xl font-semibold text-slate-700">
                {surfaces.reduce((acc, s) => acc + s.thickness, 0).toFixed(2)} mm
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">RMS Spot Size</p>
              <p className="text-xl font-semibold text-blue-600">
                {(Math.random() * 0.05).toFixed(4)} mm
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Max MTF @ 50 lp</p>
              <p className="text-xl font-semibold text-green-600">
                {(0.6 + Math.random() * 0.3).toFixed(2)}
              </p>
            </div>
             <div className="ml-auto flex items-center gap-3">
              <button className="bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-700 transition-colors flex items-center gap-2">
                <Box size={16} /> Export CAD
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-8 bg-slate-200 border-t border-slate-300 flex items-center px-4 justify-between text-[10px] text-slate-500 font-mono">
        <div className="flex items-center gap-4">
          <span>MODE: {activeTab.toUpperCase()}</span>
          <span className="text-green-600 font-bold">READY</span>
        </div>
        <div className="flex items-center gap-4">
          <span>RAY COUNT: 144 PER FIELD</span>
          <span>SAMPLING: 20x20</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
