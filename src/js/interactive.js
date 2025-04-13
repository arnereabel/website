import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { gsap } from 'gsap';

// Function to create and add 3D text to the scene
function create3DText(scene, text, position, rotation, size = 0.1, color = 0xcddc39) {
  const fontLoader = new FontLoader();
  
  return new Promise((resolve) => {
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
      const textGeometry = new TextGeometry(text, {
        font: font,
        size: size,
        height: 0.02,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.01,
        bevelSize: 0.005,
        bevelOffset: 0,
        bevelSegments: 5
      });
      
      textGeometry.center();
      
      const textMaterial = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.3,
        roughness: 0.4
      });
      
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textMesh.position.set(position.x, position.y, position.z);
      textMesh.rotation.set(rotation.x, rotation.y, rotation.z);
      
      scene.add(textMesh);
      resolve(textMesh);
    });
  });
}

// Function to create interactive project cards
function createInteractiveProjectCards() {
  const projectCards = document.querySelectorAll('.project-card');
  
  projectCards.forEach(card => {
    // Add hover effect
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        y: -10,
        scale: 1.03,
        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)',
        duration: 0.3
      });
    });
    
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        duration: 0.3
      });
    });
    
    // Add click effect
    card.addEventListener('click', () => {
      gsap.to(card, {
        scale: 0.98,
        duration: 0.1,
        onComplete: () => {
          gsap.to(card, {
            scale: 1.03,
            duration: 0.1
          });
        }
      });
    });
  });
}

// Function to create interactive timeline for experience section
function createInteractiveTimeline() {
  const timelineItems = document.querySelectorAll('.experience-item');
  
  timelineItems.forEach((item, index) => {
    // Set initial state
    gsap.set(item, {
      opacity: 0,
      x: index % 2 === 0 ? -50 : 50
    });
    
    // Create scroll trigger
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          gsap.to(item, {
            opacity: 1,
            x: 0,
            duration: 0.8,
            delay: index * 0.2
          });
          observer.unobserve(item);
        }
      });
    }, { threshold: 0.2 });
    
    observer.observe(item);
  });
}

// Function to create interactive social links
function createInteractiveSocialLinks() {
  const socialLinks = document.querySelectorAll('.social-link');
  
  socialLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      gsap.to(link, {
        backgroundColor: '#cddc39',
        scale: 1.2,
        duration: 0.3
      });
    });
    
    link.addEventListener('mouseleave', () => {
      gsap.to(link, {
        backgroundColor: '#1e1e1e',
        scale: 1,
        duration: 0.3
      });
    });
  });
}

// Function to create scroll animations for sections
function createScrollAnimations() {
  const sections = document.querySelectorAll('section > *:not(#globe-container)');
  
  sections.forEach((section) => {
    // Set initial state
    gsap.set(section, {
      opacity: 0,
      y: 30
    });
    
    // Create scroll trigger
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          gsap.to(section, {
            opacity: 1,
            y: 0,
            duration: 0.8
          });
          observer.unobserve(section);
        }
      });
    }, { threshold: 0.1 });
    
    observer.observe(section);
  });
}

// Function to create typing effect for hero section
function createTypingEffect() {
  const heroText = document.querySelector('.hero-content p');
  const originalText = heroText.textContent;
  
  // Clear the text initially
  heroText.textContent = '';
  
  // Create typing effect
  let i = 0;
  const typingInterval = setInterval(() => {
    if (i < originalText.length) {
      heroText.textContent += originalText.charAt(i);
      i++;
    } else {
      clearInterval(typingInterval);
      
      // Add blinking cursor effect
      const cursor = document.createElement('span');
      cursor.className = 'typing-cursor';
      cursor.textContent = '|';
      heroText.appendChild(cursor);
      
      // Blink the cursor
      setInterval(() => {
        cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
      }, 500);
    }
  }, 100);
}

// Export all functions
export {
  create3DText,
  createInteractiveProjectCards,
  createInteractiveTimeline,
  createInteractiveSocialLinks,
  createScrollAnimations,
  createTypingEffect
};
