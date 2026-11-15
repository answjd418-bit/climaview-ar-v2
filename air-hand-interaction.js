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
  // Twelve atmospheric cloudlets cover the entire camera canvas rather than
  // concentrating everything in the centre. Each cloudlet is compact, but it
  // moves independently even when there is no hand in view.
  // Slightly center-weighted layout; edges remain populated, not a tight ball.
  // This only affects initial/spawn positions, never pulls flying dust back.
  const clouds = [
    [.19,.21], [.37,.19], [.57,.20], [.78,.22],
    [.20,.42], [.38,.41], [.58,.42], [.80,.43],
    [.18,.64], [.37,.66], [.57,.65], [.78,.64]
  ];
  const hash = value => {
    const n = Math.sin(value * 127.1 + 79.7) * 43758.5453;
    return n - Math.floor(n);
  };
  // More sprites use the SAME original PNG files; no additional images needed.
  // Keep total particle count moderate for better performance.
  // 35 original sprites + 72 clones = up to 107 particles.
  const repeats = Array.from({length: 72}, (_, index) => {
    const sourceIndex = (index * 13 + Math.floor(index / 12) * 7) % originals.length;
    const source = originals[sourceIndex];
    const image = source.cloneNode(true);
    image.classList.add('air-density-extra', 'air-particle-inactive');
    image.dataset.extraIndex = String(index);
    image.alt = '';
    const width = parseFloat(source.style.getPropertyValue('--pw')) || 24;
    const scale = .48 + hash(index + 20) * .50;
    image.style.setProperty('--pw', Math.max(10, width * scale).toFixed(1) + 'px');
    image.style.setProperty('--particle-opacity', (.47 + hash(index + 40) * .30).toFixed(3));
    field.appendChild(image);
    return image;
  });

  const nodes = [...originals, ...repeats];
  const particles = nodes.map((image, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'air-hand-particle';
    wrapper.style.cssText = image.style.cssText;
    const group = index % clouds.length;
    // Spread particles across the whole screen, but keep each cluster soft.
    const theta = hash(index + 200) * Math.PI * 2;
    const radius = Math.sqrt(hash(index + 333));
    const x = Math.max(.03, Math.min(.97, clouds[group][0] + Math.cos(theta) * radius * .085));
    const y = Math.max(.03, Math.min(.97, clouds[group][1] + Math.sin(theta) * radius * .095));
    wrapper.style.setProperty('--px', (x * 100).toFixed(3) + '%');
    wrapper.style.setProperty('--py', (y * 100).toFixed(3) + '%');
    // Position is driven entirely by smooth per-frame airflow, not keyframes.
    for (const prop of ['--dx','--dy','--dx-half','--dy-half','--duration','--delay']) {
      image.style.removeProperty(prop);
      wrapper.style.removeProperty(prop);
    }
    image.before(wrapper);
    wrapper.appendChild(image);
    return {
      image, wrapper, x, y, group,
      px: 0, py: 0, vx: 0, vy: 0,
      seed: index, windPhase: index * 2.39996,
      energy: 0, extra: image.classList.contains('air-density-extra'),
      driftFactor: .72 + hash(index + 500) * .72,
      driftX: (hash(index + 610) - .5) * .70,
      driftY: (hash(index + 710) - .5) * .70,
      driftTargetX: (hash(index + 810) - .5) * .70,
      driftTargetY: (hash(index + 910) - .5) * .70,
      driftChangeAt: 800 + hash(index + 1010) * 2200
    };
  });

  // Keep the main application's year-linked PM values. Increase the number
  // and opacity of *extra decorative sprites* progressively across the years.
  function syncDensity() {
    const intensity = Math.max(0, Math.min(100, Number(field.dataset.intensity) || 0));
    const density = intensity / 100;
    // Even the present day includes visible scattered dust across the view.
    const extraCount = Math.round(repeats.length * (.32 + .68 * density));
    field.style.setProperty('--air-density-alpha', (.73 + density * .42).toFixed(3));
    field.style.setProperty('--air-haze-opacity', Math.max(0, (density - .23) * .14).toFixed(3));
    repeats.forEach((image, index) => {
      // Coprime permutation distributes active sprites among all 12 cloudlets.
      const rank = (index * 37) % repeats.length;
      image.classList.toggle('air-particle-inactive', rank >= extraCount);
    });
  }
  const densityObserver = new MutationObserver(syncDensity);
  densityObserver.observe(field, {attributes:true, attributeFilter:['data-intensity']});
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
    if (now - lastDetect < 140 || video.currentTime === lastVideoTime) return;
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
        handTargets.push({ x: palm.x, y: palm.y, dx, dy, radius: 450 + Math.min(75, speed * 0.65), palm: true });
        [4, 8, 12, 16, 20].forEach(index => {
          const tip = toScenePoint(landmarks[index]);
          handTargets.push({ x: tip.x, y: tip.y, dx: dx * 0.65, dy: dy * 0.65, radius: 225, palm: false });
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
    if (lastFrame && now - lastFrame < 41) return;
    const dt = Math.min(2.2, (now - (lastFrame || now)) / 16.67);
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
    if (pointer && now - pointer.time < 220) targets.push({ ...pointer, radius: 475, palm: true });
    const width = scene.clientWidth, height = scene.clientHeight;
    const recycleMargin = 80;
    for (const item of particles) {
      if (item.image.classList.contains('air-particle-inactive')) continue;
      const seconds = now / 1000;
      const phase = item.windPhase;
      let originX = item.x * width;
      let originY = item.y * height;
      let worldX = originX + item.px;
      let worldY = originY + item.py;

      // Soft ambient drift: particles float freely instead of trying to return
      // to their origin. Drift targets change slowly so the motion feels light.
      if (now >= item.driftChangeAt) {
        const spread = 0.28 + item.driftFactor * 0.46;
        item.driftTargetX = (Math.random() - .5) * spread * 2;
        item.driftTargetY = (Math.random() - .5) * spread * 2;
        item.driftChangeAt = now + 1200 + Math.random() * 2400;
      }
      item.driftX += (item.driftTargetX - item.driftX) * (0.018 * dt);
      item.driftY += (item.driftTargetY - item.driftY) * (0.018 * dt);
      const breezeX = (
        Math.sin(seconds * 0.16 + item.group * 0.9 + phase * 0.07) * 0.22 +
        Math.cos(seconds * 0.09 + item.y * 11.0) * 0.12
      ) * item.driftFactor;
      const breezeY = (
        Math.cos(seconds * 0.14 + item.group * 0.8 + phase * 0.06) * 0.18 +
        Math.sin(seconds * 0.08 + item.x * 9.5) * 0.10
      ) * item.driftFactor;
      item.vx += (item.driftX + breezeX) * dt * 0.14;
      item.vy += (item.driftY + breezeY) * dt * 0.14;

      let interaction = 0;
      for (const hand of targets) {
        const dx = worldX - hand.x;
        const dy = worldY - hand.y;
        const distance = Math.hypot(dx, dy);
        if (distance >= hand.radius) continue;
        const falloff = 1 - distance / hand.radius;
        const strength = falloff * 0.72 + falloff * falloff * 0.28;
        const velocity = Math.min(140, Math.hypot(hand.dx, hand.dy));
        const intensity = (hand.palm ? 1 : .78) * strength;
        const angle = distance > 2 ? Math.atan2(dy, dx) : phase;
        const push = 0.67 + velocity * 0.0055;
        item.vx += (Math.cos(angle) * push + hand.dx * 0.003) * intensity * dt * 1.10;
        item.vy += (Math.sin(angle) * push + hand.dy * 0.003) * intensity * dt * 1.10;
        interaction = Math.max(interaction, intensity);
      }

      // Gentle air resistance keeps motion soft without pulling particles back.
      item.vx = clamp(item.vx * Math.pow(0.91, dt), -3.2, 3.2);
      item.vy = clamp(item.vy * Math.pow(0.91, dt), -3.2, 3.2);
      item.px += item.vx * dt;
      item.py += item.vy * dt;
      worldX = originX + item.px;
      worldY = originY + item.py;

      // Let particles drift out of frame, then quietly re-enter from the opposite
      // side so the screen stays populated like floating dust in air.
      if (worldX < -recycleMargin) {
        item.x = 1 + recycleMargin / Math.max(1, width);
        item.y = clamp((worldY / Math.max(1, height)) + (Math.random() - .5) * 0.10, -.05, 1.05);
        item.px = 0; item.py = 0;
      } else if (worldX > width + recycleMargin) {
        item.x = -recycleMargin / Math.max(1, width);
        item.y = clamp((worldY / Math.max(1, height)) + (Math.random() - .5) * 0.10, -.05, 1.05);
        item.px = 0; item.py = 0;
      } else if (worldY < -recycleMargin) {
        item.y = 1 + recycleMargin / Math.max(1, height);
        item.x = clamp((worldX / Math.max(1, width)) + (Math.random() - .5) * 0.10, -.05, 1.05);
        item.px = 0; item.py = 0;
      } else if (worldY > height + recycleMargin) {
        item.y = -recycleMargin / Math.max(1, height);
        item.x = clamp((worldX / Math.max(1, width)) + (Math.random() - .5) * 0.10, -.05, 1.05);
        item.px = 0; item.py = 0;
      }

      item.wrapper.style.setProperty('--px', (item.x * 100).toFixed(3) + '%');
      item.wrapper.style.setProperty('--py', (item.y * 100).toFixed(3) + '%');
      item.energy += (interaction - item.energy) * Math.min(1, (interaction ? .24 : .05) * dt);
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
