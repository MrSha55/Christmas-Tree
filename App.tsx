import React, { useState, Suspense } from 'react';
import { Experience } from './components/Experience';
import { TreeState } from './types';

// Simple Loading Component
const LoadingUI = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-yellow-600 border-t-yellow-200 rounded-full animate-spin mb-4 opacity-80"></div>
      <p className="text-yellow-200 font-serif tracking-[0.2em] text-sm animate-pulse">
        LOADING EXPERIENCE...
      </p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.TREE_SHAPE);

  const toggleState = () => {
    setTreeState((prev) => 
      prev === TreeState.TREE_SHAPE ? TreeState.SCATTERED : TreeState.TREE_SHAPE
    );
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      
      {/* 3D Scene Layer with Suspense for Asset Loading */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<LoadingUI />}>
          <Experience treeState={treeState} setTreeState={setTreeState} />
        </Suspense>
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8 md:p-12">
        
        {/* Header */}
        <header className="pointer-events-auto">
          <h1 className="text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 font-serif font-bold tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ fontFamily: '"Cinzel", serif' }}>
            NOËL
          </h1>
          <p className="text-emerald-400 text-sm tracking-[0.3em] mt-2 uppercase font-light">
            Luxury Edition
          </p>
        </header>

        {/* Footer / Controls */}
        <div className="flex flex-col items-center pointer-events-auto pb-8">
          
          {/* Instructions for Gestures */}
          <div className="mb-6 flex gap-4 text-[10px] md:text-xs text-yellow-200/60 uppercase tracking-widest font-mono border border-yellow-900/30 p-3 bg-black/60 backdrop-blur-sm rounded">
            <div className="flex flex-col items-center">
              <span className="text-lg mb-1">✊</span>
              <span>Drag</span>
            </div>
            <div className="w-px bg-yellow-900/50"></div>
            <div className="flex flex-col items-center">
              <span className="text-lg mb-1">🖐️</span>
              <span>Scatter</span>
            </div>
            <div className="w-px bg-yellow-900/50"></div>
             <div className="flex flex-col items-center">
              <span className="text-lg mb-1">✌️</span>
              <span>Build</span>
            </div>
          </div>

          <button
            onClick={toggleState}
            className="group relative px-12 py-4 bg-black/40 backdrop-blur-md border border-yellow-600/50 hover:border-yellow-400 text-yellow-100 transition-all duration-500 ease-out overflow-hidden rounded-sm"
          >
            <div className="absolute inset-0 w-0 bg-yellow-600/20 transition-all duration-[250ms] ease-out group-hover:w-full opacity-50" />
            <span className="relative z-10 font-serif tracking-widest uppercase text-sm md:text-base">
              {treeState === TreeState.TREE_SHAPE ? 'Scatter Magic' : 'Summon Tree'}
            </span>
            {/* Decorative corners */}
            <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          
          <div className="mt-6 text-white/30 text-[10px] tracking-widest uppercase">
            Drag to Rotate • Scroll to Zoom • Use Camera
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;