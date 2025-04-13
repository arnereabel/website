import * as THREE from 'three';
import { gsap } from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { loadAboutContent, loadProjectsContent, loadExperienceContent, loadTravelContent, loadCertificationsContent, loadContactContent } from './content.js'; // Added loadCertificationsContent
import { createInteractiveProjectCards, createInteractiveTimeline, createInteractiveSocialLinks, createScrollAnimations, createTypingEffect } from './interactive.js';

// Main JavaScript file for the Three.js website

// Variables
let scene, camera, renderer, globe, particles; // Removed locationMarker
let controls;
let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let scrollY = 0;
let targetScrollY = 0;

// Loading Manager
const loadingManager = new THREE.LoadingManager();
const loadingScreen = document.querySelector('.loading-screen');
const loadingBar = document.querySelector('.loading-bar');
const container = document.querySelector('.container');

loadingManager.onProgress = (url, loaded, total) => {
  const progress = (loaded / total) * 100;
  loadingBar.style.width = `${progress}%`;
};

loadingManager.onLoad = () => {
  setTimeout(() => {
    loadingScreen.style.opacity = '0';
    container.classList.add('loaded');
    
    // Load content after loading screen fades
    loadContent();
    
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 1000);
  }, 1000);
};

// Initialize Three.js Scene
function init() {
  // Scene setup
  scene = new THREE.Scene();
  
  // Camera setup
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
  
  // Renderer setup
  renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true 
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  // Add renderer to DOM
  document.getElementById('globe-container').appendChild(renderer.domElement);
  
  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;
  
  // Create globe
  createGlobe();
  
  // Create particles
  createParticles();
  
  // Event listeners
  window.addEventListener('resize', onWindowResize);
  document.addEventListener('mousemove', onMouseMove);
  window.addEventListener('scroll', onScroll);
  
  // Interactive elements
  addInteractiveElements();
  
  // Start animation loop
  animate();
}

// Create 3D Globe
function createGlobe() {
  const globeGeometry = new THREE.SphereGeometry(2, 64, 64);
  
  // Earth texture
  const textureLoader = new THREE.TextureLoader(loadingManager);
  const globeTexture = textureLoader.load('./src/assets/earth.jpeg');
  const nightTexture = textureLoader.load('./src/assets/earth_night.jpeg');
  
  // Create custom shader material for day/night transition
  const globeMaterial = new THREE.ShaderMaterial({
    uniforms: {
      dayTexture: { value: globeTexture },
      nightTexture: { value: nightTexture },
      mixAmount: { value: 0.0 }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D dayTexture;
      uniform sampler2D nightTexture;
      uniform float mixAmount;
      
      varying vec2 vUv;
      varying vec3 vNormal;
      
      void main() {
        vec3 dayColor = texture2D(dayTexture, vUv).rgb;
        vec3 nightColor = texture2D(nightTexture, vUv).rgb;
        
        // Calculate light intensity based on normal
        float intensity = 1.05 - dot(vNormal, vec3(0.0, 0.0, 1.0));
        float dayMix = clamp(1.0 - intensity - mixAmount, 0.0, 1.0);
        
        // Mix day and night textures
        vec3 finalColor = mix(nightColor, dayColor, dayMix);
        
        // Add atmosphere glow at edges
        float atmosphereIntensity = pow(intensity, 1.5);
        vec3 atmosphereColor = vec3(0.54, 0.76, 0.29); // Green atmosphere color
        finalColor = mix(finalColor, atmosphereColor, atmosphereIntensity * 0.3);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  });
  
  globe = new THREE.Mesh(globeGeometry, globeMaterial);
  scene.add(globe);
  
  // Add atmosphere glow
  const atmosphereGeometry = new THREE.SphereGeometry(2.1, 64, 64);
  const atmosphereMaterial = new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
        gl_FragColor = vec4(0.54, 0.76, 0.29, 1.0) * intensity;
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true
  });
  
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  scene.add(atmosphere);
  
  // Add lights
  const ambientLight = new THREE.AmbientLight(0x404040, 1);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 3, 5);
  scene.add(directionalLight);
}

// Create particle effect
function createParticles() {
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 2000;
  
  const posArray = new Float32Array(particlesCount * 3);
  const scaleArray = new Float32Array(particlesCount);
  
  for(let i = 0; i < particlesCount; i++) {
    // Position
    posArray[i * 3] = (Math.random() - 0.5) * 20;
    posArray[i * 3 + 1] = (Math.random() - 0.5) * 20;
    posArray[i * 3 + 2] = (Math.random() - 0.5) * 20;
    
    // Scale (for size variation)
    scaleArray[i] = Math.random();
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  particlesGeometry.setAttribute('scale', new THREE.BufferAttribute(scaleArray, 1));
  
  // Custom shader material for particles
  const particlesMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0xcddc39) },
      time: { value: 0 }
    },
    vertexShader: `
      attribute float scale;
      uniform float time;
      
      void main() {
        vec3 pos = position;
        
        // Add subtle movement
        pos.x += sin(time * 0.2 + position.z * 0.5) * 0.1;
        pos.y += cos(time * 0.1 + position.x * 0.5) * 0.1;
        pos.z += sin(time * 0.3 + position.y * 0.5) * 0.1;
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = scale * 2.0 * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      
      void main() {
        // Create circular particles
        if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
        
        // Add glow effect
        float distFromCenter = length(gl_PointCoord - vec2(0.5, 0.5));
        float glow = 0.5 - distFromCenter;
        
        gl_FragColor = vec4(color, glow * 2.0);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  
  particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);
}

// Add interactive elements
function addInteractiveElements() {
  // Interactive globe rotation based on scroll
  window.addEventListener('scroll', () => {
    targetScrollY = window.scrollY;
  });
  
  // Interactive elements for sections
  const sections = document.querySelectorAll('section');
  
  sections.forEach(section => {
    section.addEventListener('mouseenter', () => {
      // Slow down globe rotation when hovering over sections
      gsap.to(controls, {
        autoRotateSpeed: 0.2,
        duration: 1
      });
      
      // Change particle color based on section
      if (section.id === 'about') {
        gsap.to(particles.material.uniforms.color.value, {
          r: 0.54, g: 0.76, b: 0.29,
          duration: 1
        });
      } else if (section.id === 'projects') {
        gsap.to(particles.material.uniforms.color.value, {
          r: 0.8, g: 0.86, b: 0.22,
          duration: 1
        });
      } else if (section.id === 'experience') {
        gsap.to(particles.material.uniforms.color.value, {
          r: 0.3, g: 0.69, b: 0.31,
          duration: 1
        });
      } else if (section.id === 'travel') {
        gsap.to(particles.material.uniforms.color.value, {
          r: 0.76, g: 0.69, b: 0.18,
          duration: 1
        });
      } else if (section.id === 'contact') {
        gsap.to(particles.material.uniforms.color.value, {
          r: 0.56, g: 0.75, b: 0.24,
          duration: 1
        });
      }
    });
    
    section.addEventListener('mouseleave', () => {
      // Reset globe rotation speed
      gsap.to(controls, {
        autoRotateSpeed: 0.5,
        duration: 1
      });
      
      // Reset particle color
      gsap.to(particles.material.uniforms.color.value, {
        r: 0.8, g: 0.86, b: 0.22,
        duration: 1
      });
    });
  });
  
  // Day/night cycle based on scroll position
  window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    const documentHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercentage = scrollPosition / documentHeight;
    
    // Update globe material mix amount based on scroll
    if (globe && globe.material.uniforms) {
      gsap.to(globe.material.uniforms.mixAmount, {
        value: scrollPercentage,
        duration: 1
      });
    }
  });
}

// Handle window resize
function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Handle mouse movement
function onMouseMove(event) {
  targetMouseX = (event.clientX - windowHalfX) * 0.0005;
  targetMouseY = (event.clientY - windowHalfY) * 0.0005;
}

// Handle scroll
function onScroll() {
  targetScrollY = window.scrollY;
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Smooth mouse movement
  mouseX += (targetMouseX - mouseX) * 0.05;
  mouseY += (targetMouseY - mouseY) * 0.05;
  
  // Smooth scroll
  scrollY += (targetScrollY - scrollY) * 0.05;
  
  // Rotate globe based on mouse position with damping
  if (globe) {
    gsap.to(globe.rotation, {
      x: -mouseY * 0.5,
      y: mouseX * 0.5 + scrollY * 0.001,
      duration: 2
    });
  }
  
  // Update particle animation
  if (particles && particles.material.uniforms) {
    particles.material.uniforms.time.value += 0.01;
    particles.rotation.y += 0.0005;
  }
  
  // Update controls
  controls.update();
  
  // Render scene
  renderer.render(scene, camera);
}

// Load content for website sections
function loadContent() {
  loadAboutContent();
  loadProjectsContent();
  loadExperienceContent();
  loadTravelContent();
  loadCertificationsContent(); // Call the new function
  loadContactContent();
  
  // Add interactive elements after content is loaded
  createInteractiveProjectCards();
  createInteractiveTimeline();
  createInteractiveSocialLinks();
  createScrollAnimations();
  createTypingEffect();
}

// Initialize when DOM is loaded
window.addEventListener('DOMContentLoaded', init);

// Smooth scrolling for navigation links
document.querySelectorAll('nav a').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    window.scrollTo({
      top: targetElement.offsetTop,
      behavior: 'smooth'
    });
  });
});
