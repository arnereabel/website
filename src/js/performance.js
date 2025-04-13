// Mobile navigation functionality
document.addEventListener('DOMContentLoaded', function() {
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileNavToggle && navLinks) {
    mobileNavToggle.addEventListener('click', function() {
      navLinks.classList.toggle('active');
      
      // Toggle hamburger to X
      this.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
      item.addEventListener('click', function() {
        navLinks.classList.remove('active');
        mobileNavToggle.classList.remove('active');
      });
    });
  }
});

// Performance optimizations
function optimizePerformance() {
  // Detect device capabilities
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Apply optimizations based on device capabilities
  if (isMobile || isLowEndDevice) {
    // Reduce particle count
    if (window.reduceParticleCount && typeof window.reduceParticleCount === 'function') {
      window.reduceParticleCount();
    }
    
    // Lower globe geometry detail
    if (window.lowerGlobeDetail && typeof window.lowerGlobeDetail === 'function') {
      window.lowerGlobeDetail();
    }
    
    // Disable some animations
    document.body.classList.add('reduced-animations');
  }
  
  // Respect user's motion preferences
  if (prefersReducedMotion) {
    document.body.classList.add('reduced-motion');
  }
  
  // Lazy load images
  const lazyImages = document.querySelectorAll('img[data-src]');
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
}

// Add performance optimization functions to window for access from Three.js code
window.reduceParticleCount = function() {
  if (window.particles && window.particles.geometry) {
    const currentCount = window.particles.geometry.attributes.position.count;
    const newCount = Math.floor(currentCount / 2);
    
    // Create new geometry with fewer particles
    const newPositions = new Float32Array(newCount * 3);
    const oldPositions = window.particles.geometry.attributes.position.array;
    
    for (let i = 0; i < newCount * 3; i++) {
      newPositions[i] = oldPositions[i];
    }
    
    window.particles.geometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
  }
};

window.lowerGlobeDetail = function() {
  if (window.globe) {
    // Replace with lower detail geometry
    const lowDetailGeometry = new THREE.SphereGeometry(2, 32, 32); // Lower segment count
    window.globe.geometry.dispose();
    window.globe.geometry = lowDetailGeometry;
  }
};

// Call optimization function when page loads
window.addEventListener('load', optimizePerformance);

// Optimize rendering based on visibility
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    // Page is hidden, reduce animation frame rate
    window.isPageVisible = false;
  } else {
    // Page is visible again, restore animation frame rate
    window.isPageVisible = true;
  }
});

// Throttle scroll events for better performance
let scrollTimeout;
window.addEventListener('scroll', function() {
  if (!scrollTimeout) {
    scrollTimeout = setTimeout(function() {
      scrollTimeout = null;
      // Handle scroll events here
      window.targetScrollY = window.scrollY;
    }, 20);
  }
});

// Resize handler with debounce
let resizeTimeout;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function() {
    // Handle resize events here
    if (window.onWindowResize && typeof window.onWindowResize === 'function') {
      window.onWindowResize();
    }
  }, 100);
});

// Export optimization functions
export { optimizePerformance };
