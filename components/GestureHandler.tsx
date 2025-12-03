import React, { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
import { TreeState } from '../types';
import * as THREE from 'three';

interface GestureHandlerProps {
  setTreeState: (state: TreeState) => void;
  controlsRef: React.RefObject<any>;
}

export const GestureHandler: React.FC<GestureHandlerProps> = ({ setTreeState, controlsRef }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recognizerRef = useRef<GestureRecognizer | null>(null);
  const [loaded, setLoaded] = useState(false);
  const lastVideoTime = useRef(-1);
  
  // Interaction State
  const isDragging = useRef(false);
  const lastHandPos = useRef<{x: number, y: number} | null>(null);
  const gestureDebounce = useRef(0);

  useEffect(() => {
    // Only create video element once
    videoRef.current = document.createElement('video');
    videoRef.current.playsInline = true;
    videoRef.current.muted = true;

    const initMediaPipe = async () => {
      try {
        // Safety check for Secure Context (HTTPS or localhost)
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.warn("GestureHandler: Camera API not available. Use HTTPS or localhost. Gestures disabled.");
          return;
        }

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        
        recognizerRef.current = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });

        // Setup Camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          videoRef.current.addEventListener('loadeddata', () => {
            setLoaded(true);
          });
        }

      } catch (error) {
        console.error("GestureHandler Error (Camera/Model failed):", error);
        // We do not setLoaded(true), so the loop below simply skips. 
        // The app continues to work without gestures.
      }
    };

    initMediaPipe();

    return () => {
        // Cleanup stream
        if(videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, []);

  useFrame((state, delta) => {
    if (!loaded || !recognizerRef.current || !videoRef.current) return;

    // Safety: ensure video is actually playing and has dimensions
    if (videoRef.current.readyState < 2) return;

    if (videoRef.current.currentTime !== lastVideoTime.current) {
      lastVideoTime.current = videoRef.current.currentTime;
      
      try {
        const result = recognizerRef.current.recognizeForVideo(videoRef.current, Date.now());

        if (result.gestures.length > 0 && result.landmarks.length > 0) {
          const gesture = result.gestures[0][0].categoryName;
          const landmarks = result.landmarks[0];
          
          // Hand Center (Approximate using wrist (0) and middle finger mcp (9))
          const handX = 1 - (landmarks[0].x + landmarks[9].x) / 2; // Mirror X
          const handY = (landmarks[0].y + landmarks[9].y) / 2;

          // --- GESTURE LOGIC ---

          // 1. DRAG INTERACTION (Closed_Fist)
          if (gesture === 'Closed_Fist') {
            if (!isDragging.current) {
              // Start Drag
              isDragging.current = true;
              lastHandPos.current = { x: handX, y: handY };
            } else if (lastHandPos.current && controlsRef.current) {
              // Dragging
              const deltaX = (handX - lastHandPos.current.x) * 5; // Sensitivity
              const deltaY = (handY - lastHandPos.current.y) * 5;

              // Rotate Orbit Controls
              const controls = controlsRef.current;
              // Azimuth (Horizontal)
              controls.setAzimuthalAngle(controls.getAzimuthalAngle() - deltaX);
              // Polar (Vertical)
              controls.setPolarAngle(controls.getPolarAngle() - deltaY);
              
              lastHandPos.current = { x: handX, y: handY };
            }
          } else {
            isDragging.current = false;
            lastHandPos.current = null;
          }

          // 2. STATE SWITCHING (Debounced to prevent flickering)
          if (gestureDebounce.current <= 0) {
            if (gesture === 'Open_Palm') {
              setTreeState(TreeState.SCATTERED);
              gestureDebounce.current = 1.0; // Wait 1 second before next trigger
            } else if (gesture === 'Victory') {
              setTreeState(TreeState.TREE_SHAPE);
              gestureDebounce.current = 1.0;
            }
          } else {
              gestureDebounce.current -= delta;
          }
        } else {
            isDragging.current = false;
            lastHandPos.current = null;
        }
      } catch (e) {
        // Prevent recognition errors from crashing the loop
        console.warn("Gesture recognition frame error", e);
      }
    }
  });

  return (
    // Visual Debug: Small video feed in corner
    <group position={[0,0,0]}> 
       {/* Logic only, no 3D representation needed for the handler itself */}
    </group>
  );
};