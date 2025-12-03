import * as THREE from 'three';
import { ParticleData } from '../types';

/**
 * Generates random point inside a sphere
 */
export const getRandomSpherePoint = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

/**
 * Generates data for needles (the green part)
 */
export const generateNeedleData = (count: number): ParticleData[] => {
  const data: ParticleData[] = [];
  const treeHeight = 15;
  const maxRadius = 5;

  for (let i = 0; i < count; i++) {
    // 1. SCATTER POSITION
    const scatterPos = getRandomSpherePoint(18);

    // 2. TREE POSITION (Cone Spiral)
    const t = i / count; 
    const y = (0.5 - t) * treeHeight; 
    
    const radiusAtHeight = maxRadius * (t * 0.9 + 0.1); 
    
    // Golden Angle
    const angle = i * 2.39996; 
    
    const r = radiusAtHeight + (Math.random() - 0.5) * 0.5;

    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const treePos = new THREE.Vector3(x, y, z);

    const rotation = new THREE.Euler(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    data.push({
      scatterPosition: scatterPos,
      treePosition: treePos,
      rotation: rotation,
      scale: 0.5 + Math.random() * 0.5
    });
  }
  return data;
};

/**
 * Generates data for ornaments (the gold spheres)
 */
export const generateOrnamentData = (count: number): ParticleData[] => {
  const data: ParticleData[] = [];
  const treeHeight = 15;
  const maxRadius = 5.2; 

  for (let i = 0; i < count; i++) {
    const scatterPos = getRandomSpherePoint(20);

    const t = i / count;
    const y = (0.5 - t) * treeHeight;
    const radiusAtHeight = maxRadius * t; 
    
    const angle = i * 13; // Different prime for randomness distribution

    const x = Math.cos(angle) * radiusAtHeight;
    const z = Math.sin(angle) * radiusAtHeight;
    const treePos = new THREE.Vector3(x, y, z);

    data.push({
      scatterPosition: scatterPos,
      treePosition: treePos,
      rotation: new THREE.Euler(0, 0, 0),
      scale: 1
    });
  }
  return data;
};

/**
 * Generates data for gifts (scattered boxes)
 */
export const generateGiftData = (count: number): ParticleData[] => {
  const data: ParticleData[] = [];
  const treeHeight = 15;
  const maxRadius = 5.5;

  for (let i = 0; i < count; i++) {
    const scatterPos = getRandomSpherePoint(22);

    // Bias t towards 1 (bottom of tree) for gifts
    const biasedT = Math.pow(Math.random(), 0.5); 
    const y = (0.5 - biasedT) * treeHeight;
    
    const radiusAtHeight = maxRadius * biasedT;
    
    // Random angle
    const angle = Math.random() * Math.PI * 2;
    
    // Push them slightly out or in randomly
    const r = radiusAtHeight + (Math.random() - 0.5) * 1.0;

    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const treePos = new THREE.Vector3(x, y, z);

    // Random rotation for boxes
    const rotation = new THREE.Euler(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    data.push({
      scatterPosition: scatterPos,
      treePosition: treePos,
      rotation: rotation,
      scale: 0.8 + Math.random() * 0.6 // Varied box sizes
    });
  }
  return data;
};

/**
 * Generates data for the magic spiraling ribbon
 */
export const generateRibbonData = (count: number): ParticleData[] => {
  const data: ParticleData[] = [];
  const treeHeight = 16; // Slightly taller than tree
  const maxRadius = 6.0; // Wider than tree

  const loops = 6; // Number of spirals

  for (let i = 0; i < count; i++) {
    const scatterPos = getRandomSpherePoint(25);

    const t = i / count;
    const y = (0.5 - t) * treeHeight;
    
    // Tapering radius
    const radiusAtHeight = maxRadius * (t * 0.8 + 0.2);

    // Spiral calculation
    const angle = t * loops * Math.PI * 2;

    const x = Math.cos(angle) * radiusAtHeight;
    const z = Math.sin(angle) * radiusAtHeight;
    const treePos = new THREE.Vector3(x, y, z);

    data.push({
      scatterPosition: scatterPos,
      treePosition: treePos,
      rotation: new THREE.Euler(0, 0, 0),
      scale: 0.2 + Math.random() * 0.3
    });
  }
  return data;
};