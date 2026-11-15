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

  // Add lightweight repeats of the existing transparent PNGs. These are NOT
  // additional data readings: their number/opacity depicts relative pollution.
  // Every clone also participates in hand collision and gravity simulation.
  const originals = [...field.querySelectorAll('.air-floating-particle')];
  const repeatSources = [13, 15, 17, 19, 21, 24, 27, 29, 30, 31, 33, 34, 1, 7, 11, 14, 22, 2, 3, 25, 6, 10, 5, 9, 8, 23, 18, 20];
  const repeats = repeatSources.map((sourceIndex, index) => {
    const source = originals[sourceIndex % originals.length];
    const image = source.cloneNode(true);
    image.classList.add('air-density-extra', 'air-particle-inactive');
    image.dataset.extraIndex = String(index);
    image.alt = '';
    // Golden-angle spacing distributes the copies instead of clustering them.
    const angle = (index * 137.50776) * Math.PI / 180;
    const ring = 0.18 + 0.28 * Math.sqrt((index + 0.5) / repeatSources.length);
    const x = Math.max(4, Math.min(96, 50 + Math.cos(angle) * ring * 100));
    const y = Math.max(5, Math.min(95, 50 + Math.sin(angle) * ring * 95));
    image.style.setProperty('--px', x.toFixed(2) + '%');
    image.style.setProperty('--py', y.toFixed(2) + '%');
    const baseWidth = parseFloat(source.style.getPropertyValue('--pw')) || 24;
    image.style.setProperty('--pw', Math.max(12, baseWidth * (0.43 + (index % 5) * 0.095)).toFixed(0) + 'px');
    image.style.setProperty('--duration', (11.2 + (index % 7) * 1.3).toFixed(2) + 's');
    image.style.setProperty('--delay', -(index * 1.8).toFixed(2) + 's');
    image.style.setProperty('--dx', (Math.sin(angle) * 35).toFixed(1) + 'px');
    image.style.setProperty('--dy', (-18 - (index % 6) * 7).toFixed(1) + 'px');
    image.style.setProperty('--dx-half', (Math.sin(angle) * 16).toFixed(1) + 'px');
    image.style.setProperty('--dy-half', (-11 - (index % 6) * 4).toFixed(1) + 'px');
    image.style.setProperty('--rotation', ((index % 2 ? -1 : 1) * (index % 9 + 2)) + 'deg');
    image.style.setProperty('--rotation-half', ((index % 2 ? -1 : 1) * (index % 9 + 2) / 2) + 'deg');
    image.style.setProperty('--particle-opacity', (0.36 + (index % 6) * 0.055).toFixed(2));
    field.appendChild(image);
    return image;
  });

  const nodes = [...originals, ...repeats];
  const particles = nodes.map((image, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'air-hand-particle';
    wrapper.style.cssText = image.style.cssText;
    const get = (key) => parseFloat(image.style.getPropertyValue(key)) || 0;
    const factor = 1.9;
    for (const [dest, source] of [['--dx','--dx'],['--dy','--dy'],['--dx-half','--dx-half'],['--dy-half','--dy-half']]) {
      wrapper.style.setProperty(dest, `${(get(source)*factor).toFixed(2)}px`);
    }
    const duration = parseFloat(image.style.getPropertyValue('--duration')) || 13;
    wrapper.style.setProperty('--duration', `${(duration*0.78).toFixed(2)}s`);
    image.style.removeProperty('--dx'); image.style.removeProperty('--dy');
    image.style.removeProperty('--dx-half'); image.style.removeProperty('--dy-half');
    image.style.removeProperty('--duration');
    image.before(wrapper);
    wrapper.appendChild(image);
    // A loose cloud at rest: bring source anchors into a shared atmospheric zone.
    // The underlying images, pollutant counts and per-year visibility are untouched.
    const originalX = parseFloat(wrapper.style.getPropertyValue('--px')) / 100;
    const originalY = parseFloat(wrapper.style.getPropertyValue('--py')) / 100;
    const x = Math.max(.12, Math.min(.88, .50 + (originalX - .50) * .72));
    const y = Math.max(.12, Math.min(.88, .49 + (originalY - .49) * .76));
    wrapper.style.setProperty('--px', (x * 100).toFixed(3) + '%');
    wrapper.style.setProperty('--py', (y * 100).toFixed(3) + '%');
    const size = parseFloat(wrapper.style.getPropertyValue('--pw')) || 28;
    return {
      image, wrapper, x, y, size, px: 0, py: 0, vx: 0, vy: 0, seed: index,
      // Larger atmospheric particles feel slightly heavier; tiny particles float longer.
      gravity: 0.024 + Math.min(size, 110) / 110 * 0.038,
      windPhase: index * 2.39996,
      energy: 0,
      extra: image.classList.contains('air-density-extra')
    };
  });

  // The existing application updates this attribute after switching years.
  // Keep its core pollutant mapping and data untouched; add only visual density.
  function syncDensity() {
    const intensity = Math.max(0, Math.min(100, Number(field.dataset.intensity) || 0));
    const density = intensity / 100;
    // Current -> 2030 -> 2050 -> 2090: stronger haze and more small particles.
    field.style.setProperty('--air-density-alpha', (0.68 + density * 0.40).toFixed(3));
    field.style.setProperty('--air-haze-opacity', Math.max(0, (density - 0.38) * 0.21).toFixed(3));
    const extraCount = Math.round(repeats.length * Math.max(0, (density - 0.46) / 0.54));
    repeats.forEach((image, index) => {
      // Spread extras evenly through the scene at each intermediate step.
      const rank = (index * 11) % repeats.length;
      image.classList.toggle('air-particle-inactive', rank >= extraCount);
    });
  }
  const densityObserver = new MutationObserver(syncDensity);
  densityObserver.observe(field, { attributes: true, attributeFilter: ['data-intensity'] });
  syncDensity();
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
        handTargets.push({ x: palm.x, y: palm.y, dx, dy, radius: 240 + Math.min(85, speed * 0.65), palm: true });
        [4, 8, 12, 16, 20].forEach(index => {
          const tip = toScenePoint(landmarks[index]);
          handTargets.push({ x: tip.x, y: tip.y, dx: dx * 0.65, dy: dy * 0.65, radius: 102, palm: false });
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
          item.px = 0; item.py = 0; item.vx = 0; item.vy = 0; item.energy = 0;
          item.wrapper.style.removeProperty('--scatter-energy');
          item.wrapper.style.removeProperty('--push-x');
          item.wrapper.style.removeProperty('--push-y');
        }
      }
      return;
    }
    if (!model && !modelLoading && video.readyState >= 2) void loadHandModel();
    detect(now);
    const targets = handTargets.slice();
    if (pointer && now - pointer.time < 220) targets.push({ ...pointer, radius: 245, palm: true });
    const width = scene.clientWidth, height = scene.clientHeight;
    for (const item of particles) {
      // Respect the original year-by-year pollutant visibility and density system.
      if (item.image.classList.contains('air-particle-inactive')) continue;
      const seconds = now / 1000;
      const phase = item.windPhase;
      const originX = item.x * width;
      const originY = item.y * height;
      const worldX = originX + item.px;
      const worldY = originY + item.py;
      let targetX = Math.sin(seconds * 0.23 + phase) * 18
        + Math.sin(seconds * 0.11 + phase * 1.7) * 10;
      let targetY = Math.cos(seconds * 0.19 + phase) * 13
        + Math.sin(seconds * 0.09 + phase * 1.4) * 8;
      let interaction = 0;
      // Wide, soft field: open hands and rapid swipes "scatter" the cloud.
      // Force is positional, not a one-shot explosion impulse, so gathering
      // is smooth when the hand leaves the camera frame.
      for (const hand of targets) {
        const dx = worldX - hand.x;
        const dy = worldY - hand.y;
        const distance = Math.hypot(dx, dy);
        if (distance >= hand.radius) continue;
        const falloff = 1 - distance / hand.radius;
        const strength = falloff * falloff * (3 - 2 * falloff);
        const velocity = Math.min(135, Math.hypot(hand.dx, hand.dy));
        const intensity = (hand.palm ? 1 : .35) * strength;
        const angle = distance > 2 ? Math.atan2(dy, dx) : phase;
        const spread = 230 + Math.min(125, velocity * 1.05);
        targetX += Math.cos(angle) * spread * intensity + hand.dx * 1.25 * intensity;
        targetY += Math.sin(angle) * spread * intensity + hand.dy * 1.25 * intensity;
        interaction = Math.max(interaction, intensity);
      }
      // Critically damped motion: very responsive when approached, smoother
      // as the particles re-form into their loose original cluster.
      const stiffness = interaction > .015 ? .125 : .034;
      const damping = interaction > .015 ? .69 : .79;
      const accelerationX = (targetX - item.px) * stiffness;
      const accelerationY = (targetY - item.py) * stiffness;
      item.vx = clamp((item.vx + accelerationX * dt) * Math.pow(damping, dt), -23, 23);
      item.vy = clamp((item.vy + accelerationY * dt) * Math.pow(damping, dt), -23, 23);
      item.px = clamp(item.px + item.vx * dt, -340, 340);
      item.py = clamp(item.py + item.vy * dt, -290, 290);
      // Brief visual shimmer underscores the scattering, without modifying
      // the base PNG colors or year-related opacity.
      item.energy += (interaction - item.energy) * Math.min(1, (interaction ? .20 : .07) * dt);
      item.wrapper.style.setProperty('--push-x', item.px.toFixed(1) + 'px');
      item.wrapper.style.setProperty('--push-y', item.py.toFixed(1) + 'px');
      item.wrapper.style.setProperty('--scatter-energy', item.energy.toFixed(3));
    }
  }
  document.addEventListener('visibilitychange', () => {
    previousHands = []; handTargets.length = 0;
    if (document.hidden) lastVideoTime = -1;
  });
  requestAnimationFrame(tick);
})();
