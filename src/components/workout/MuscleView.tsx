
import { useEffect, useRef, useState } from "react";
import { EXERCISE_CATEGORIES, type ExerciseCategory } from "@/lib/constants";
import { motion } from "framer-motion";
import * as THREE from "three";
import { cn } from "@/lib/utils";

interface MuscleViewProps {
  selectedCategory: ExerciseCategory | null;
  onMuscleSelect?: (category: ExerciseCategory) => void;
}

export function MuscleView({ selectedCategory, onMuscleSelect }: MuscleViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const muscleGroupsRef = useRef<{ [key: string]: THREE.Mesh }>({}); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf5f5f5);

    // Set up camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.z = 5;

    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    // Create muscle groups
    const createMuscleGroup = (name: ExerciseCategory, geometry: THREE.BufferGeometry, position: THREE.Vector3) => {
      const material = new THREE.MeshPhongMaterial({
        color: 0xcccccc,
        transparent: true,
        opacity: 0.8,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      mesh.userData.category = name;
      scene.add(mesh);
      muscleGroupsRef.current[name] = mesh;

      // Add click event handling
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      renderer.domElement.addEventListener('click', (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(mesh);

        if (intersects.length > 0 && onMuscleSelect) {
          onMuscleSelect(name);
        }
      });
    };

    // Create simplified but more anatomically correct muscle geometries
    const chestGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    createMuscleGroup("ΣΤΗΘΟΣ", chestGeometry, new THREE.Vector3(0, 1, 0));

    const backGeometry = new THREE.BoxGeometry(1, 1.5, 0.2);
    createMuscleGroup("ΠΛΑΤΗ", backGeometry, new THREE.Vector3(0, 0, -0.5));

    const bicepsGeometry = new THREE.CylinderGeometry(0.2, 0.15, 1);
    createMuscleGroup("ΔΙΚΕΦΑΛΑ", bicepsGeometry, new THREE.Vector3(1, 0.5, 0));

    const shouldersGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    createMuscleGroup("ΩΜΟΙ", shouldersGeometry, new THREE.Vector3(0.8, 1.2, 0));

    const legsGeometry = new THREE.CylinderGeometry(0.3, 0.2, 2);
    createMuscleGroup("ΠΟΔΙΑ", legsGeometry, new THREE.Vector3(0, -1.5, 0));

    const coreGeometry = new THREE.CylinderGeometry(0.4, 0.3, 1);
    createMuscleGroup("ΚΟΡΜΟΣ", coreGeometry, new THREE.Vector3(0, -0.2, 0));

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (sceneRef.current && cameraRef.current && rendererRef.current) {
        // Gentle rotation
        sceneRef.current.rotation.y += 0.001;
        
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();
    setIsLoading(false);

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [onMuscleSelect]);

  // Update muscle colors when category is selected
  useEffect(() => {
    if (!selectedCategory || !muscleGroupsRef.current) return;

    Object.entries(muscleGroupsRef.current).forEach(([category, mesh]) => {
      const material = mesh.material as THREE.MeshPhongMaterial;
      
      if (category === selectedCategory) {
        const categoryColor = new THREE.Color(EXERCISE_CATEGORIES[category as ExerciseCategory].color);
        material.color = categoryColor;
        material.opacity = 1;
      } else {
        material.color = new THREE.Color(0xcccccc);
        material.opacity = 0.3;
      }
    });
  }, [selectedCategory]);

  return (
    <div className="relative w-full h-full min-h-[400px] md:min-h-[600px]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-lg font-medium">Loading 3D model...</div>
        </div>
      )}
      <div 
        ref={containerRef} 
        className="w-full h-full"
      />
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-0 right-0 text-center"
        >
          <div className="inline-block px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm">
            {selectedCategory}
          </div>
        </motion.div>
      )}
    </div>
  );
}
