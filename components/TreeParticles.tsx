import React, { useRef, useMemo, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeState } from '../types';
import { 
  generateNeedleData, 
  generateOrnamentData, 
  generateGiftData, 
  generateRibbonData 
} from '../utils/math';
import { easing } from 'maath';

interface TreeParticlesProps {
  state: TreeState;
}

const NEEDLE_COUNT = 3000;
const ORNAMENT_COUNT = 120;
const GIFT_COUNT = 80;
const RIBBON_COUNT = 400;

const DUMMY = new THREE.Object3D();
const COLOR_1 = new THREE.Color();

export const TreeParticles: React.FC<TreeParticlesProps> = ({ state }) => {
  const needleMeshRef = useRef<THREE.InstancedMesh>(null);
  const ornamentMeshRef = useRef<THREE.InstancedMesh>(null);
  const giftMeshRef = useRef<THREE.InstancedMesh>(null);
  const ribbonMeshRef = useRef<THREE.InstancedMesh>(null);

  // Generate constant data once
  const needles = useMemo(() => generateNeedleData(NEEDLE_COUNT), []);
  const ornaments = useMemo(() => generateOrnamentData(ORNAMENT_COUNT), []);
  const gifts = useMemo(() => generateGiftData(GIFT_COUNT), []);
  const ribbon = useMemo(() => generateRibbonData(RIBBON_COUNT), []);

  // Factor to interpolate between 0 (Scattered) and 1 (Tree)
  const factor = useRef(0);

  // Initial layout and coloring
  useLayoutEffect(() => {
    // Needles
    if (needleMeshRef.current) {
      needles.forEach((data, i) => {
        DUMMY.position.copy(data.scatterPosition);
        DUMMY.rotation.copy(data.rotation);
        DUMMY.scale.setScalar(data.scale);
        DUMMY.updateMatrix();
        needleMeshRef.current!.setMatrixAt(i, DUMMY.matrix);
      });
      needleMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Ornaments
    if (ornamentMeshRef.current) {
      ornaments.forEach((data, i) => {
        DUMMY.position.copy(data.scatterPosition);
        DUMMY.scale.setScalar(data.scale);
        DUMMY.updateMatrix();
        ornamentMeshRef.current!.setMatrixAt(i, DUMMY.matrix);
      });
      ornamentMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Gifts (Random Colors: Red or Gold)
    if (giftMeshRef.current) {
      gifts.forEach((data, i) => {
        DUMMY.position.copy(data.scatterPosition);
        DUMMY.rotation.copy(data.rotation);
        DUMMY.scale.setScalar(data.scale);
        DUMMY.updateMatrix();
        giftMeshRef.current!.setMatrixAt(i, DUMMY.matrix);

        // Assign random color: 60% Red, 40% Gold
        const isRed = Math.random() > 0.4;
        COLOR_1.set(isRed ? "#8a0000" : "#FFD700");
        giftMeshRef.current!.setColorAt(i, COLOR_1);
      });
      giftMeshRef.current.instanceMatrix.needsUpdate = true;
      if (giftMeshRef.current.instanceColor) giftMeshRef.current.instanceColor.needsUpdate = true;
    }

    // Ribbon
    if (ribbonMeshRef.current) {
      ribbon.forEach((data, i) => {
        DUMMY.position.copy(data.scatterPosition);
        DUMMY.scale.setScalar(data.scale);
        DUMMY.updateMatrix();
        ribbonMeshRef.current!.setMatrixAt(i, DUMMY.matrix);
      });
      ribbonMeshRef.current.instanceMatrix.needsUpdate = true;
    }

  }, [needles, ornaments, gifts, ribbon]);

  useFrame((stateThree, delta) => {
    const target = state === TreeState.TREE_SHAPE ? 1 : 0;
    
    // Smooth damp towards target state
    easing.damp(factor, 'current', target, 1.2, delta);
    const t = factor.current;
    const time = stateThree.clock.elapsedTime;

    // --- Update Needles ---
    if (needleMeshRef.current) {
      for (let i = 0; i < NEEDLE_COUNT; i++) {
        const { scatterPosition, treePosition, rotation, scale } = needles[i];
        
        DUMMY.position.lerpVectors(scatterPosition, treePosition, t);
        
        // Gentle float
        if (t < 0.9) {
          DUMMY.position.y += Math.sin(time + scatterPosition.x) * 0.02 * (1 - t);
          DUMMY.rotation.x += 0.01 * (1 - t);
        }
        DUMMY.rotation.copy(rotation);
        DUMMY.scale.setScalar(scale * (0.8 + 0.2 * t)); 
        DUMMY.updateMatrix();
        needleMeshRef.current.setMatrixAt(i, DUMMY.matrix);
      }
      needleMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // --- Update Ornaments ---
    if (ornamentMeshRef.current) {
      for (let i = 0; i < ORNAMENT_COUNT; i++) {
        const { scatterPosition, treePosition, scale } = ornaments[i];
        DUMMY.position.lerpVectors(scatterPosition, treePosition, t);
        DUMMY.rotation.y += 0.01;
        DUMMY.scale.setScalar(scale * (0.5 + 0.5 * t));
        DUMMY.updateMatrix();
        ornamentMeshRef.current.setMatrixAt(i, DUMMY.matrix);
      }
      ornamentMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // --- Update Gifts ---
    if (giftMeshRef.current) {
      for (let i = 0; i < GIFT_COUNT; i++) {
        const { scatterPosition, treePosition, rotation, scale } = gifts[i];
        DUMMY.position.lerpVectors(scatterPosition, treePosition, t);
        
        // Gifts rotate slowly
        DUMMY.rotation.copy(rotation);
        DUMMY.rotation.y += time * 0.1; 
        DUMMY.rotation.z += Math.sin(time * 0.5) * 0.05;

        DUMMY.scale.setScalar(scale * (0.6 + 0.4 * t)); // Grow as they land
        DUMMY.updateMatrix();
        giftMeshRef.current.setMatrixAt(i, DUMMY.matrix);
      }
      giftMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // --- Update Ribbon Lights ---
    if (ribbonMeshRef.current) {
      for (let i = 0; i < RIBBON_COUNT; i++) {
        const { scatterPosition, treePosition, scale } = ribbon[i];
        DUMMY.position.lerpVectors(scatterPosition, treePosition, t);
        
        // Add dynamic swirl effect when in tree mode
        if (t > 0.5) {
            // Revolve around Y axis
            const angleOffset = time * 0.5; // Speed of swirl
            const x = DUMMY.position.x;
            const z = DUMMY.position.z;
            
            // Apply rotation around 0,0,0 (approximate since we are updating matrix directly)
            // But since we lerp every frame, we need to modify the lerped result
            // A simple way is to convert the treePosition polar coordinate and add offset, 
            // but here we just modify the final position.
            
            const radius = Math.sqrt(x*x + z*z);
            const currentAngle = Math.atan2(z, x);
            DUMMY.position.x = Math.cos(currentAngle + angleOffset) * radius;
            DUMMY.position.z = Math.sin(currentAngle + angleOffset) * radius;
            
            // Bob up and down slightly
            DUMMY.position.y += Math.sin(time * 2 + i) * 0.1;
        }

        // Pulse scale
        const pulse = 1 + Math.sin(time * 3 + i) * 0.3;
        DUMMY.scale.setScalar(scale * pulse);
        
        DUMMY.updateMatrix();
        ribbonMeshRef.current.setMatrixAt(i, DUMMY.matrix);
      }
      ribbonMeshRef.current.instanceMatrix.needsUpdate = true;
    }

  });

  return (
    <group>
      {/* Needles - Emerald Green, slightly metallic */}
      <instancedMesh ref={needleMeshRef} args={[undefined, undefined, NEEDLE_COUNT]}>
        <tetrahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial 
          color="#024020" 
          roughness={0.6} 
          metalness={0.4}
          emissive="#001a0d"
          emissiveIntensity={0.2}
        />
      </instancedMesh>

      {/* Ornaments - Gold */}
      <instancedMesh ref={ornamentMeshRef} args={[undefined, undefined, ORNAMENT_COUNT]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color="#FFD700" 
          roughness={0.1} 
          metalness={1}
          emissive="#b8860b"
          emissiveIntensity={0.5} 
        />
      </instancedMesh>

      {/* Gifts - Mixed Colors (Red/Gold) */}
      <instancedMesh ref={giftMeshRef} args={[undefined, undefined, GIFT_COUNT]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial 
          roughness={0.2} 
          metalness={0.8}
        />
      </instancedMesh>

      {/* Ribbon Lights - Glowing Particles */}
      <instancedMesh ref={ribbonMeshRef} args={[undefined, undefined, RIBBON_COUNT]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial 
          color="#fffbd0"
          emissive="#fffbd0"
          emissiveIntensity={2}
          toneMapped={false} 
        />
      </instancedMesh>
    </group>
  );
};