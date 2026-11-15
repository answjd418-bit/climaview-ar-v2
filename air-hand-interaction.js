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
  const status = document.getElementById('air-hand-status');
  let lastStatus = '';
  function showStatus(message) {
    if (status && lastStatus !== message) status.textContent = lastStatus = message;
  }
  if (!field || !video || !scene) return;

  const nodes = [...field.querySelectorAll('.air-floating-particle')];
  const particles = nodes.map((image, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'air-hand-particle';
    // Keep the exact existing layout, PNG type, brightness, and drift variables.
    wrapper.style.cssText = image.style.cssText;
    // Wider, more noticeable travel and brisker independent movement.
    const get = (key) => parseFloat(image.style.getPropertyValue(key)) || 0;
    const factor = 1.9;
    for (const [dest, source] of [['--dx','--dx'],['--dy','--dy'],['--dx-half','--dx-half'],['--dy-half','--dy-half']]) {
      wrapper.style.setProperty(dest, `${(get(source)*factor).toFixed(2)}px`);
    }
    const duration = parseFloat(image.style.getPropertyValue('--duration')) || 13;
    wrapper.style.setProperty('--duration', `${(duration*0.63).toFixed(2)}s`);
    // CSS variables are inherited, so use wrapper variables for child drift.
    image.style.removeProperty('--dx'); image.style.removeProperty('--dy');
    image.style.removeProperty('--dx-half'); image.style.removeProperty('--dy-half');
    image.style.removeProperty('--duration');
    image.before(wrapper);
    wrapper.appendChild(image);
    const x = parseFloat(image.style.getPropertyValue('--px')) / 100;
    const y = parseFloat(image.style.getPropertyValue('--py')) / 100;
    return { image, wrapper, x, y, px: 0, py: 0, vx: 0, vy: 0, seed: index };
  });
  field.classList.add('hand-reactive');

  let model = null;
  let modelLoading = false;
  let retryAt = 0;
  let loadAttempts = 0;
  let trackedHands = 0;
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
    if (model || modelLoading || !enabled() || performance.now() < retryAt) return;
    if (video.readyState < 2 || !video.videoWidth) {
      showStatus('카메라 영상 연결을 확인해 주세요');
      return;
    }
    modelLoading = true;
    showStatus('손 인식 모델 불러오는 중…');
    const bundles = [
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/vision_bundle.mjs',
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs'
    ];
    let failure;
    try {
      for (const bundleUrl of bundles) {
        try {
          const { FilesetResolver, HandLandmarker } = await import(bundleUrl);
          const version = bundleUrl.match(/@([0-9.]+)\//)[1];
          const vision = await FilesetResolver.forVisionTasks(
            `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${version}/wasm`
          );
          const options = {
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
              delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            numHands: 2,
            minHandDetectionConfidence: 0.35,
            minHandPresenceConfidence: 0.4,
            minTrackingConfidence: 0.4
          };
          try {
            model = await HandLandmarker.createFromOptions(vision, options);
          } catch (gpuError) {
            options.baseOptions.delegate = 'CPU';
            model = await HandLandmarker.createFromOptions(vision, options);
          }
          showStatus('손을 카메라 앞에서 움직여 보세요');
          console.info('[ClimaView] hand tracking ready');
          break;
        } catch (error) {
          failure = error;
        }
      }
      if (!model) throw failure || Error('Could not load MediaPipe');
      loadAttempts = 0;
    } catch (error) {
      loadAttempts++;
      // Retry on network interruption; no permanent failure latch.
      retryAt = performance.now() + Math.min(30000, 4000 * loadAttempts);
      showStatus('손 인식 연결 실패 · 네트워크 확인 후 재시도');
      console.warn('[ClimaView] Hand model loading failed', error);
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
    // Keep recognition coordinates aligned with the flipped camera preview.
    const videoMirror = getComputedStyle(video).transform !== 'none';
    if (videoMirror) x = sw - x;
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
      trackedHands = next.length;
      showStatus(trackedHands ? `손 ${trackedHands}개 인식 중 · 입자를 훑어보세요` : '손을 카메라 앞에서 움직여 보세요');
    } catch (error) {
      // A bad video frame must not permanently disable the filter.
      console.warn('[ClimaView] Temporary hand detection failure', error);
      showStatus('손 인식 재시도 중…');
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
    if (!model && !modelLoading && video.readyState >= 2) void loadHandModel();
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
