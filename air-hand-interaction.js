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
  // Keep the particle mass visually more concentrated toward the centre.
  // The cloudlets still form several clusters, but most of them sit inside a
  // central oval so the overall silhouette feels denser and more cohesive.
  const clouds = [
    [.28,.33], [.42,.30], [.56,.30], [.70,.33],
    [.22,.49], [.36,.48], [.50,.49], [.64,.48], [.78,.49],
    [.30,.65], [.46,.68], [.62,.66]
  ];
  const hash = value => {
    const n = Math.sin(value * 127.1 + 79.7) * 43758.5453;
    return n - Math.floor(n);
  };
  // More sprites use the SAME original PNG files; no additional images needed.
  // 35 original sprites + 100 lighter clones = up to 135 interactive particles.
  const repeats = Array.from({length: 100}, (_, index) => {
    const sourceIndex = (index * 13 + Math.floor(index / 12) * 7) % originals.length;
    const source = originals[sourceIndex];
    const image = source.cloneNode(true);
    image.classList.add('air-density-extra', 'air-particle-inactive');
    image.dataset.extraIndex = String(index);
    image.alt = '';
    const width = parseFloat(source.style.getPropertyValue('--pw')) || 24;
    const scale = .28 + hash(index + 20) * .44;
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
    const group = (index * 7 + Math.floor(index / clouds.length)) % clouds.length;
    // Tighter local spread makes the particles feel more gathered in the middle,
    // while still preserving a soft, organic boundary around each cluster.
    const theta = hash(index + 200) * Math.PI * 2;
    const radius = Math.sqrt(hash(index + 333));
    const x = Math.max(.08, Math.min(.92, clouds[group][0] + Math.cos(theta) * radius * .056));
    const y = Math.max(.08, Math.min(.92, clouds[group][1] + Math.sin(theta) * radius * .062));
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
      energy: 0, lastImpulse: 0, extra: image.classList.contains('air-density-extra'),
      driftFactor: .72 + hash(index + 500) * .72,
      wanderX: 0, wanderY: 0,
      wanderTargetX: (hash(index + 900) - .5) * 24,
      wanderTargetY: (hash(index + 940) - .5) * 24,
      wanderUntil: 1800 + hash(index + 980) * 2800
    };
  });

  // Keep the main application's year-linked PM values. Increase the number
  // and opacity of *extra decorative sprites* progressively across the years.
  function syncDensity() {
    const intensity = Math.max(0, Math.min(100, Number(field.dataset.intensity) || 0));
    const density = intensity / 100;
    // Even the present day includes visible scattered dust across the view.
    const extraCount = Math.round(repeats.length * (.60 + .40 * density));
    field.style.setProperty('--air-density-alpha', (.73 + density * .42).toFixed(3));
    field.style.setProperty('--air-haze-opacity', Math.max(0, (density - .23) * .14).toFixed(3));
    repeats.forEach((image, index) => {
      // Coprime permutation distributes active sprites among all 12 cloudlets.
      const rank = (index * 73) % repeats.length;
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
  let lastRenderedFrame = 0;
  const frameInterval = 1000 / 30; // limit expensive DOM particle updates to ~30 FPS
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
    if (now - lastDetect < 135 || video.currentTime === lastVideoTime) return;
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
        const dx = previous ? clamp(palm.x - previous.x, -160, 160) : 0;
        const dy = previous ? clamp(palm.y - previous.y, -160, 160) : 0;
        const speed = Math.hypot(dx, dy);
        next.push(palm);
        handTargets.push({ x: palm.x, y: palm.y, dx, dy, radius: 345 + Math.min(110, speed * .7), palm: true });
        [4, 8, 12, 16, 20].forEach(index => {
          const tip = toScenePoint(landmarks[index]);
          handTargets.push({ x: tip.x, y: tip.y, dx: dx * 0.65, dy: dy * 0.65, radius: 185, palm: false });
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
    // Keep the UI/camera untouched; only throttle this particle simulation.
    if (!enabled()) {
      lastFrame = now;
      lastRenderedFrame = 0;
      previousHands = [];
      handTargets.length = 0;
      pointer = null;
      for (const item of particles) {
        if (item.px || item.py || item.energy) {
          item.px = 0; item.py = 0; item.vx = 0; item.vy = 0; item.energy = 0;
          item.wrapper.style.removeProperty('--push-x');
          item.wrapper.style.removeProperty('--push-y');
        }
      }
      return;
    }
    if (!model && !modelLoading && video.readyState >= 2) void loadHandModel();
    if (now - lastRenderedFrame < frameInterval) return;
    const dt = Math.min(2.6, (now - (lastFrame || now)) / 16.67);
    lastFrame = now;
    lastRenderedFrame = now;
    detect(now);
    const targets = handTargets.slice();
    if (pointer && now - pointer.time < 220) targets.push({ ...pointer, radius: 365, palm: true });
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
      // Feather-light dust motion: gradual independent wandering and a very
      // soft shared breeze, without the previous noticeable looping/orbits.
      const g = item.group;
      if (now >= item.wanderUntil) {
        const wanderRange = 13 + item.driftFactor * 12;
        item.wanderTargetX = (Math.random() * 2 - 1) * wanderRange;
        item.wanderTargetY = (Math.random() * 2 - 1) * wanderRange * .82;
        item.wanderUntil = now + 2000 + Math.random() * 3200;
      }
      const wanderEase = Math.min(1, .010 * dt);
      item.wanderX += (item.wanderTargetX - item.wanderX) * wanderEase;
      item.wanderY += (item.wanderTargetY - item.wanderY) * wanderEase;
      // Small overlapping breezes keep neighbouring particles loosely connected,
      // but no longer make the entire cluster rotate in a visible circle.
      const breezeX = Math.sin(seconds * .16 + g * 1.73) * 11
        + Math.sin(seconds * .083 + item.x * 5.2) * 7;
      const breezeY = Math.sin(seconds * .135 + g * 2.17) * 8
        + Math.sin(seconds * .071 + item.y * 4.8) * 5;
      let targetX = breezeX + item.wanderX;
      let targetY = breezeY + item.wanderY;
      // Maintain the central cloud shape and softly restore displaced dust.
      targetX -= item.px * .075;
      targetY -= item.py * .090;
      let interaction = 0;
      // Use the particle's actual screen position for hand proximity. Large
      // smooth repulsion makes the cloudlets fan out clearly when approached.
      for (const hand of targets) {
        const dx = worldX - hand.x;
        const dy = worldY - hand.y;
        const distance = Math.hypot(dx, dy);
        if (distance >= hand.radius) continue;
        const falloff = 1 - distance / hand.radius;
        const strength = falloff * falloff * (3 - 2 * falloff);
        const velocity = Math.min(160, Math.hypot(hand.dx, hand.dy));
        const intensity = (hand.palm ? 1 : .58) * strength;
        const angle = distance > 2 ? Math.atan2(dy, dx) : phase;
        const spread = 470 + Math.min(160, velocity * 1.2);
        targetX += Math.cos(angle) * spread * intensity + hand.dx * 1.2 * intensity;
        targetY += Math.sin(angle) * spread * intensity + hand.dy * 1.2 * intensity;
        interaction = Math.max(interaction, intensity);
      }
      // Smooth follow and return: fast dispersal, steady drift while idle,
      // gradual regrouping rather than a spring-like snap-back.
      const stiffness = interaction > .012 ? .095 : .016;
      const damping = interaction > .012 ? .79 : .80;
      item.vx = clamp((item.vx + (targetX - item.px) * stiffness * dt)
        * Math.pow(damping, dt), -30, 30);
      item.vy = clamp((item.vy + (targetY - item.py) * stiffness * dt)
        * Math.pow(damping, dt), -30, 30);
      item.px = clamp(item.px + item.vx * dt, -760, 760);
      item.py = clamp(item.py + item.vy * dt, -600, 600);
      item.wrapper.style.setProperty('--push-x', item.px.toFixed(1) + 'px');
      item.wrapper.style.setProperty('--push-y', item.py.toFixed(1) + 'px');
      // No animated glow/filter: keep this motion-only for better tablet performance.
    }
  }
  document.addEventListener('visibilitychange', () => {
    previousHands = []; handTargets.length = 0;
    if (document.hidden) lastVideoTime = -1;
  });
  requestAnimationFrame(tick);
})();
