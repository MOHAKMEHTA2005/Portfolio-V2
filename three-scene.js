/**
 * ============================================================================
 * MOHAK MEHTA PORTFOLIO — THREE.JS 3D VISUALS (Part 3)
 * - Hero 3D interactive tech polyhedral matrix & orbiting data rings
 * - Background subtle 3D particle constellation with neural interconnects
 * - Scroll-linked rotational dynamics & mouse parallax
 * - Color synchronization with CSS variables (:root)
 * ============================================================================
 */

(function () {
  'use strict';

  // Check if WebGL is supported
  function isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  if (!isWebGLAvailable() || typeof THREE === 'undefined') {
    console.warn('WebGL not available or Three.js not loaded. Graceful fallback active.');
    const heroContainer = document.getElementById('hero3DContainer');
    if (heroContainer) {
      heroContainer.classList.add('fallback-mode');
    }
    return;
  }

  // Helper to get CSS variable hex colors
  function getThemeColor(varName, defaultHex) {
    const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    if (val && (val.startsWith('#') || val.startsWith('rgb'))) {
      return new THREE.Color(val);
    }
    return new THREE.Color(defaultHex);
  }

  // ---------------------------------------------------------------------------
  // 1. BACKGROUND 3D PARTICLE FIELD CONSTELLATION
  // ---------------------------------------------------------------------------
  const bgCanvas = document.getElementById('bg3dCanvas');
  let bgRenderer, bgScene, bgCamera, bgParticles, bgLines;
  const particleCount = window.innerWidth < 768 ? 40 : 80;
  const particlePositions = new Float32Array(particleCount * 3);
  const particleVelocities = [];

  function initBackgroundScene() {
    if (!bgCanvas) return;

    bgScene = new THREE.Scene();
    bgCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    bgCamera.position.z = 400;

    bgRenderer = new THREE.WebGLRenderer({
      canvas: bgCanvas,
      alpha: true,
      antialias: false, // Low overhead for background
      powerPreference: 'low-power'
    });
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // Particle geometries and initial positions
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 800;
      const y = (Math.random() - 0.5) * 800;
      const z = (Math.random() - 0.5) * 400;

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.4,
        y: (Math.random() - 0.5) * 0.4,
        z: (Math.random() - 0.5) * 0.2
      });
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const pColor = getThemeColor('--color-primary', '#8ece34');
    const particleMaterial = new THREE.PointsMaterial({
      color: pColor,
      size: 3.5,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    bgParticles = new THREE.Points(particleGeometry, particleMaterial);
    bgScene.add(bgParticles);

    // Dynamic interconnecting lines geometry
    const maxLineSegments = particleCount * 6;
    const linePositions = new Float32Array(maxLineSegments * 6);
    const lineColors = new Float32Array(maxLineSegments * 6);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });

    bgLines = new THREE.LineSegments(lineGeometry, lineMaterial);
    bgScene.add(bgLines);
  }

  function updateBackgroundParticles() {
    if (!bgParticles || !bgLines) return;

    const positions = bgParticles.geometry.attributes.position.array;
    const linePositions = bgLines.geometry.attributes.position.array;
    const lineColors = bgLines.geometry.attributes.color.array;
    let lineIndex = 0;

    const primaryColor = getThemeColor('--color-primary', '#8ece34');
    const secondaryColor = getThemeColor('--color-secondary', '#d254f3');

    for (let i = 0; i < particleCount; i++) {
      // Update positions
      positions[i * 3] += particleVelocities[i].x;
      positions[i * 3 + 1] += particleVelocities[i].y;
      positions[i * 3 + 2] += particleVelocities[i].z;

      // Boundary bouncing
      if (Math.abs(positions[i * 3]) > 420) particleVelocities[i].x *= -1;
      if (Math.abs(positions[i * 3 + 1]) > 420) particleVelocities[i].y *= -1;
      if (Math.abs(positions[i * 3 + 2]) > 220) particleVelocities[i].z *= -1;

      // Find neighbors to connect
      for (let j = i + 1; j < particleCount; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;

        const maxDist = 135;
        if (distSq < maxDist * maxDist && lineIndex < linePositions.length - 6) {
          const alpha = 1.0 - Math.sqrt(distSq) / maxDist;

          linePositions[lineIndex] = positions[i * 3];
          linePositions[lineIndex + 1] = positions[i * 3 + 1];
          linePositions[lineIndex + 2] = positions[i * 3 + 2];

          linePositions[lineIndex + 3] = positions[j * 3];
          linePositions[lineIndex + 4] = positions[j * 3 + 1];
          linePositions[lineIndex + 5] = positions[j * 3 + 2];

          const colorMix = (i % 2 === 0 ? primaryColor : secondaryColor);
          lineColors[lineIndex] = colorMix.r * alpha;
          lineColors[lineIndex + 1] = colorMix.g * alpha;
          lineColors[lineIndex + 2] = colorMix.b * alpha;

          lineColors[lineIndex + 3] = colorMix.r * alpha;
          lineColors[lineIndex + 4] = colorMix.g * alpha;
          lineColors[lineIndex + 5] = colorMix.b * alpha;

          lineIndex += 6;
        }
      }
    }

    bgParticles.geometry.attributes.position.needsUpdate = true;
    bgLines.geometry.setDrawRange(0, lineIndex / 3);
    bgLines.geometry.attributes.position.needsUpdate = true;
    bgLines.geometry.attributes.color.needsUpdate = true;
  }

  // ---------------------------------------------------------------------------
  // 2. HERO INTERACTIVE 3D OBJECT (Cyber Polyhedral Lattice & Orbiting Rings)
  // ---------------------------------------------------------------------------
  const heroCanvas = document.getElementById('hero3dCanvas');
  let heroRenderer, heroScene, heroCamera;
  let heroCoreMesh, heroWireMesh, heroOuterRing1, heroOuterRing2, heroSatellitesGroup;
  let mouseX = 0, mouseY = 0;
  let targetRotationX = 0, targetRotationY = 0;
  let currentScrollY = 0;

  function initHeroScene() {
    if (!heroCanvas) return;

    const width = heroCanvas.clientWidth || 380;
    const height = heroCanvas.clientHeight || 340;

    heroScene = new THREE.Scene();
    heroCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    heroCamera.position.z = 4.8;

    heroRenderer = new THREE.WebGLRenderer({
      canvas: heroCanvas,
      alpha: true,
      antialias: true
    });
    heroRenderer.setSize(width, height);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const colorPrimary = getThemeColor('--color-primary', '#8ece34');
    const colorSecondary = getThemeColor('--color-secondary', '#d254f3');
    const colorAccent = getThemeColor('--color-accent', '#00f0ff');

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    heroScene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(colorPrimary, 2.2, 10);
    pointLight1.position.set(2, 3, 3);
    heroScene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(colorSecondary, 2.0, 10);
    pointLight2.position.set(-2, -2, 2);
    heroScene.add(pointLight2);

    // 1. Inner Glowing Icosahedron Core
    const coreGeo = new THREE.IcosahedronGeometry(1.0, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: colorSecondary,
      roughness: 0.25,
      metalness: 0.85,
      wireframe: false,
      emissive: colorSecondary,
      emissiveIntensity: 0.25
    });
    heroCoreMesh = new THREE.Mesh(coreGeo, coreMat);
    heroScene.add(heroCoreMesh);

    // 2. Outer Wireframe Cage (Dodecahedron)
    const wireGeo = new THREE.DodecahedronGeometry(1.45, 0);
    const wireMat = new THREE.MeshBasicMaterial({
      color: colorPrimary,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    heroWireMesh = new THREE.Mesh(wireGeo, wireMat);
    heroScene.add(heroWireMesh);

    // 3. Concentric Orbiting Cyber-Rings
    const ringGeo1 = new THREE.TorusGeometry(1.9, 0.02, 16, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: colorAccent,
      transparent: true,
      opacity: 0.6
    });
    heroOuterRing1 = new THREE.Mesh(ringGeo1, ringMat1);
    heroOuterRing1.rotation.x = Math.PI / 3;
    heroScene.add(heroOuterRing1);

    const ringGeo2 = new THREE.TorusGeometry(2.2, 0.015, 16, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: colorPrimary,
      transparent: true,
      opacity: 0.5
    });
    heroOuterRing2 = new THREE.Mesh(ringGeo2, ringMat2);
    heroOuterRing2.rotation.y = Math.PI / 4;
    heroOuterRing2.rotation.x = -Math.PI / 6;
    heroScene.add(heroOuterRing2);

    // 4. Orbiting Data Nodes / Satellites
    heroSatellitesGroup = new THREE.Group();
    const satCount = 6;
    const satGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const satMat = new THREE.MeshStandardMaterial({
      color: colorPrimary,
      emissive: colorPrimary,
      emissiveIntensity: 0.6
    });

    for (let s = 0; s < satCount; s++) {
      const sat = new THREE.Mesh(satGeo, satMat);
      const angle = (s / satCount) * Math.PI * 2;
      const radius = 2.0;
      sat.position.set(Math.cos(angle) * radius, (Math.sin(s) * 0.5), Math.sin(angle) * radius);
      heroSatellitesGroup.add(sat);
    }
    heroScene.add(heroSatellitesGroup);

    // Mouse Tracking for Hero Scene
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onWindowScroll, { passive: true });
  }

  function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  function onWindowScroll() {
    currentScrollY = window.scrollY || window.pageYOffset;
  }

  // Update Theme Colors in 3D Scene when Theme Changes
  window.update3DThemeColors = function () {
    const colorPrimary = getThemeColor('--color-primary', '#8ece34');
    const colorSecondary = getThemeColor('--color-secondary', '#d254f3');
    const colorAccent = getThemeColor('--color-accent', '#00f0ff');

    if (heroWireMesh) heroWireMesh.material.color = colorPrimary;
    if (heroCoreMesh) {
      heroCoreMesh.material.color = colorSecondary;
      heroCoreMesh.material.emissive = colorSecondary;
    }
    if (heroOuterRing1) heroOuterRing1.material.color = colorAccent;
    if (heroOuterRing2) heroOuterRing2.material.color = colorPrimary;
    if (bgParticles) bgParticles.material.color = colorPrimary;
  };

  // ---------------------------------------------------------------------------
  // 3. MAIN RENDER LOOP WITH SCROLL & MOUSE EASING
  // ---------------------------------------------------------------------------
  let animationFrameId;

  function animate() {
    animationFrameId = requestAnimationFrame(animate);

    // Check if document is hidden to conserve resources
    if (document.hidden) return;

    // 1. Render Background Particles
    if (bgRenderer && bgScene && bgCamera) {
      updateBackgroundParticles();
      bgScene.rotation.y += 0.0006;
      bgScene.rotation.x = mouseY * 0.05;
      bgRenderer.render(bgScene, bgCamera);
    }

    // 2. Render Hero 3D Object
    if (heroRenderer && heroScene && heroCamera) {
      targetRotationY += 0.005;
      targetRotationX += 0.003;

      // Scroll-linked rotational influence
      const scrollRotation = currentScrollY * 0.002;

      // Smooth Lerping with Mouse Coordinates
      const targetMouseRotX = mouseY * 0.4 + scrollRotation * 0.3;
      const targetMouseRotY = mouseX * 0.5 + scrollRotation;

      if (heroCoreMesh) {
        heroCoreMesh.rotation.x += (targetMouseRotX - heroCoreMesh.rotation.x) * 0.05 + 0.006;
        heroCoreMesh.rotation.y += (targetMouseRotY - heroCoreMesh.rotation.y) * 0.05 + 0.008;
      }

      if (heroWireMesh) {
        heroWireMesh.rotation.x += (-targetMouseRotX - heroWireMesh.rotation.x) * 0.04 - 0.004;
        heroWireMesh.rotation.y += (-targetMouseRotY - heroWireMesh.rotation.y) * 0.04 - 0.006;
      }

      if (heroOuterRing1) {
        heroOuterRing1.rotation.z += 0.01;
        heroOuterRing1.rotation.y = targetMouseRotY * 0.3;
      }

      if (heroOuterRing2) {
        heroOuterRing2.rotation.z -= 0.008;
        heroOuterRing2.rotation.x = targetMouseRotX * 0.3;
      }

      if (heroSatellitesGroup) {
        heroSatellitesGroup.rotation.y -= 0.012;
      }

      heroRenderer.render(heroScene, heroCamera);
    }
  }

  // ---------------------------------------------------------------------------
  // 4. RESIZE HANDLER
  // ---------------------------------------------------------------------------
  function onWindowResize() {
    // Resize background scene
    if (bgCamera && bgRenderer) {
      bgCamera.aspect = window.innerWidth / window.innerHeight;
      bgCamera.updateProjectionMatrix();
      bgRenderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Resize hero scene
    if (heroCanvas && heroCamera && heroRenderer) {
      const width = heroCanvas.clientWidth;
      const height = heroCanvas.clientHeight;
      if (width && height) {
        heroCamera.aspect = width / height;
        heroCamera.updateProjectionMatrix();
        heroRenderer.setSize(width, height);
      }
    }
  }

  window.addEventListener('resize', onWindowResize, { passive: true });

  // Initialize both scenes on page load
  window.addEventListener('DOMContentLoaded', () => {
    initBackgroundScene();
    initHeroScene();
    animate();
  });

})();
