import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(50, 50, 50);
    scene.add(pointLight);

    // 3. Particles
    const particleGroup = new THREE.Group();
    const colors = ['#6C63FF', '#00F5D4', '#38BDF8'];
    const geometry = new THREE.SphereGeometry(0.3, 16, 16);
    
    for (let i = 0; i < 120; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const material = new THREE.MeshPhongMaterial({ 
        color, 
        transparent: true, 
        opacity: 0.6 
      });
      
      const sphere = new THREE.Mesh(geometry, material);
      
      // Random position in 200x200x100 space
      sphere.position.x = (Math.random() - 0.5) * 200;
      sphere.position.y = (Math.random() - 0.5) * 200;
      sphere.position.z = (Math.random() - 0.5) * 100;
      
      particleGroup.add(sphere);
    }
    
    scene.add(particleGroup);

    // 4. Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.001;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.001;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 5. Window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 6. Animation loop
    let targetRotationX = 0;
    let targetRotationY = 0;
    
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Base rotation
      particleGroup.rotation.y += 0.0003;
      
      // Mouse interaction (lerp factor 0.02)
      targetRotationY = mouseX * 0.5;
      targetRotationX = mouseY * 0.5;
      
      particleGroup.rotation.y += (targetRotationY - particleGroup.rotation.y) * 0.02;
      particleGroup.rotation.x += (targetRotationX - particleGroup.rotation.x) * 0.02;

      renderer.render(scene, camera);
    };
    
    animate();

    // 7. Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  );
};

export default ThreeBackground;
