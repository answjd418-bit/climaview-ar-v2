"use strict";
/**
 * ClimaView air particles: screen-space camera AR filter with hand-sweep repulsion.
 * Uses the EXISTING air-float-*.png graphics and the existing camera feed.
 * Requires HTTPS (or localhost), camera permission, and an online model/CDN on first use.
 * No camera image is uploaded by this module; inference runs in the browser.
 * This is a 2D camera-filter effect, not real-world depth occlusion or 3D anchoring.
 */
(function initializeAirHandInteraction() {
  const field = document.getElementById('air-particle-field');
  const video = document.getElementById('camera-feed');
  const scene = document.getElementById('scene');
  if (!field || !video || !scene) return;

  const nodes = [...field.querySelectorAll('.air-floating-particle')];
  const particles = nodes.map((image, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'air-hand-particle';
    // Keep the exact existing layout, PNG type, brightness, and drift variables.
    wrapper.style.cssText = image.style.cssText;
    image.before(wrapper);
    wrapper.appendChild(image);
    const x = parseFloat(image.style.getPropertyValue('--px')) / 100;
    const y = parseFloat(image.style.getPropertyValue('--py')) / 100;
    return { image, wrapper, x, y, px: 0, py: 0, vx: 0, vy: 0, seed: index };
  });
  field.classList.add('hand-reactive');

  let model = null;
  let modelLoading = false;
  let modelFailed = false;
  let previousHands = [];
  let lastDetect = 0;
  let lastVideoTime = -1;
  let lastFrame = 0;
  let running = true;
  const handTargets = [];
  let pointer = null;

  const enabled = () => document.body.dataset.arGraphics === 'on' &&
    document.body.dataset.selectedRisk === 'air';
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  async function loadHandModel() {
    if (model || modelLoading || modelFailed || !enabled()) return;
    if (video.readyState < 2 || !video.videoWidth) return;
    modelLoading = true;
    try {
      const { FilesetResolver, HandLandmarker } = await import(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/vision_bundle.mjs'
      );
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm'
      );
      const options = {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.55,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      };
      try {
        model = await HandLandmarker.createFromOptions(vision, options);
      } catch (gpuError) {
        options.baseOptions.delegate = 'CPU';
        model = await HandLandmarker.createFromOptions(vision, options);
      }
      console.info('[ClimaView] AR air hand tracking ready');
    } catch (error) {
      modelFailed = true;
      console.warn('[ClimaView] 손 인식을 불러오지 못했습니다. 입자 부유 효과는 유지됩니다.', error);
    } finally {
      modelLoading = false;
    }
  }

  // Coordinate mapping: object-fit: cover camera crop -> 1366x1024 scene coordinates.
  function toScenePoint(point) {
    const sw = scene.clientWidth, sh = scene.clientHeight;
    const vw = video.videoWidth, vh = video.videoHeight;
    if (!vw || !vh || !sw || !sh) return { x: point.x * sw, y: point.y * sh };
    const scale = Math.max(sw / vw, sh / vh);
    const sourceWidth = vw * scale;
    const sourceHeight = vh * scale;
    let x = (point.x * sourceWidth - (sourceWidth - sw) / 2);
    let y = (point.y * sourceHeight - (sourceHeight - sh) / 2);
    if (getComputedStyle(video).transform !== 'none') {
      const t = getComputedStyle(video).transform;
      // Mirror handling for common CSS scaleX(-1) front-camera filters.
      if (/matrix\(-1(?:\.0+)?,/.test(t)) x = sw - x;
    }
    return { x, y };
  }

  function detect(now) {
    if (!enabled() || !model || video.readyState < 2) { handTargets.length = 0; return; }
    if (now - lastDetect < 85 || video.currentTime === lastVideoTime) return;
    lastDetect = now;
    lastVideoTime = video.currentTime;
    try {
      const result = model.detectForVideo(video, now);
      const next = [];
      handTargets.length = 0;
      (result.landmarks || []).forEach((landmarks, handIndex) => {
        // Use the palm center plus finger points for a broad, natural sweep volume.
        const palmIndices = [0, 5, 9, 13, 17];
        const palm = palmIndices.reduce((acc, idx) => {
          const point = toScenePoint(landmarks[idx]);
          acc.x += point.x / palmIndices.length;
          acc.y += point.y / palmIndices.length;
          return acc;
        }, { x: 0, y: 0 });
        const previous = previousHands[handIndex];
        const dx = previous ? clamp(palm.x - previous.x, -110, 110) : 0;
        const dy = previous ? clamp(palm.y - previous.y, -110, 110) : 0;
        const speed = Math.hypot(dx, dy);
        next.push(palm);
        handTargets.push({ x: palm.x, y: palm.y, dx, dy, radius: 155 + Math.min(55, speed * 0.45) });
        [4, 8, 12, 16, 20].forEach(index => {
          const tip = toScenePoint(landmarks[index]);
          handTargets.push({ x: tip.x, y: tip.y, dx: dx * 0.65, dy: dy * 0.65, radius: 73 });
        });
      });
      previousHands = next;
    } catch (error) {
      // Transient video-frame issues should never break the existing UI.
      handTargets.length = 0;
    }
  }

  // Desktop mouse / iPad touch test fallback. Does not intercept GUI clicks.
  scene.addEventListener('pointermove', event => {
    if (!enabled() || event.target.closest('.gui-layer, .air-ar-card, .air-detail-card')) return;
    const bounds = scene.getBoundingClientRect();
    const x = (event.clientX - bounds.left) * scene.clientWidth / bounds.width;
    const y = (event.clientY - bounds.top) * scene.clientHeight / bounds.height;
    const previous = pointer;
    pointer = { x, y, dx: previous ? clamp(x - previous.x, -70, 70) : 0,
      dy: previous ? clamp(y - previous.y, -70, 70) : 0, time: performance.now() };
  }, { passive: true });
  scene.addEventListener('pointerleave', () => { pointer = null; });

  function tick(now) {
    if (!running) return;
    requestAnimationFrame(tick);
    const dt = Math.min(2, (now - (lastFrame || now)) / 16.67);
    lastFrame = now;
    if (!enabled()) {
      previousHands = [];
      handTargets.length = 0;
      pointer = null;
      for (const item of particles) {
        if (item.px || item.py) {
          item.px = 0; item.py = 0; item.vx = 0; item.vy = 0;
          item.wrapper.style.removeProperty('--push-x');
          item.wrapper.style.removeProperty('--push-y');
        }
      }
      return;
    }
    if (!model && !modelLoading && !modelFailed && video.readyState >= 2) void loadHandModel();
    detect(now);
    const targets = handTargets.slice();
    if (pointer && now - pointer.time < 135) targets.push({ ...pointer, radius: 120 });
    const width = scene.clientWidth, height = scene.clientHeight;
    for (const item of particles) {
      // Respect existing year-based pollutant visibility.
      if (item.image.classList.contains('air-particle-inactive')) continue;
      const px = item.x * width + item.px, py = item.y * height + item.py;
      for (const hand of targets) {
        const diffX = px - hand.x, diffY = py - hand.y;
        const dist = Math.hypot(diffX, diffY);
        if (dist >= hand.radius) continue;
        const power = (1 - dist / hand.radius) ** 2;
        const inv = 1 / Math.max(dist, 10);
        const motion = Math.min(16, Math.hypot(hand.dx, hand.dy) * 0.22);
        // A gentle outward push; moving hands add directional flow.
        const strength = (2.0 + motion) * power * dt;
        item.vx += (diffX * inv * strength + hand.dx * 0.11 * power) * dt;
        item.vy += (diffY * inv * strength + hand.dy * 0.11 * power) * dt;
      }
      // Spring-back with damping: particles drift back toward their AR positions.
      item.vx = (item.vx - item.px * 0.012 * dt) * Math.pow(0.91, dt);
      item.vy = (item.vy - item.py * 0.012 * dt) * Math.pow(0.91, dt);
      item.px = clamp(item.px + item.vx * dt, -175, 175);
      item.py = clamp(item.py + item.vy * dt, -175, 175);
      if (Math.abs(item.px) + Math.abs(item.py) > 0.04) {
        item.wrapper.style.setProperty('--push-x', item.px.toFixed(1) + 'px');
        item.wrapper.style.setProperty('--push-y', item.py.toFixed(1) + 'px');
      }
    }
  }
  document.addEventListener('visibilitychange', () => {
    previousHands = []; handTargets.length = 0;
    if (document.hidden) lastVideoTime = -1;
  });
  requestAnimationFrame(tick);
})();
