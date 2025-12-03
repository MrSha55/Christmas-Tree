import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { TreeParticles } from './TreeParticles';
import { TreeState } from '../types';
import { GestureHandler } from './GestureHandler';

interface ExperienceProps {
  treeState: TreeState;
  setTreeState: (state: TreeState) => void;
}

export const Experience: React.FC<ExperienceProps> = ({ treeState, setTreeState }) => {
  const controlsRef = useRef<any>(null);

  return (
    <Canvas
      camera={{ position: [0, 0, 25], fov: 45 }}
      dpr={[1, 2]} // Optimize for high DPI screens
      gl={{ antialias: false, toneMappingExposure: 1.5 }}
    >
      <color attach="background" args={['#000500']} />
      
      {/* Controls */}
      <OrbitControls 
        ref={controlsRef}
        enablePan={false} 
        minDistance={10} 
        maxDistance={40} 
        autoRotate 
        autoRotateSpeed={0.5}
        enableDamping={true}
        dampingFactor={0.05}
      />

      <GestureHandler setTreeState={setTreeState} controlsRef={controlsRef} />

      {/* Environment & Lighting */}
      <Environment preset="city" />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#fff5b6" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ff00" />
      <spotLight 
        position={[0, 20, 0]} 
        angle={0.5} 
        penumbra={1} 
        intensity={2} 
        color="#ffd700" 
        castShadow 
      />

      {/* Particles */}
      <TreeParticles state={treeState} />
      
      {/* Background Ambience */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={12} size={4} speed={0.4} opacity={0.5} color="#ffd700" />

      {/* Post Processing for Cinematic Look */}
      <EffectComposer disableNormalPass>
        {/* High Bloom for that magical glow */}
        <Bloom 
          luminanceThreshold={0.8} 
          mipmapBlur 
          intensity={1.5} 
          radius={0.4}
        />
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};