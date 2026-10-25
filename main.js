// Cute 3D Bear Character Integration Logic
import '@splinetool/viewer';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Tab Switching Logic for Educational Guide
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const activeContent = document.getElementById(targetTab);
      if (activeContent) {
        activeContent.classList.add('active');
      }
    });
  });

  // 2. Interactive Viewer Buttons
  const btnWave = document.getElementById('btnWave');
  const btnBlink = document.getElementById('btnBlink');
  const btnReset = document.getElementById('btnReset');
  const viewerCard = document.querySelector('.viewer-card');
  const splineViewer = document.querySelector('spline-viewer');

  // Friendly toast notification helper
  function showToast(message) {
    let toast = document.getElementById('feedbackToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'feedbackToast';
      toast.style.position = 'fixed';
      toast.style.bottom = '24px';
      toast.style.right = '24px';
      toast.style.padding = '10px 18px';
      toast.style.background = 'rgba(43, 37, 32, 0.9)';
      toast.style.color = '#ffffff';
      toast.style.borderRadius = '9999px';
      toast.style.fontFamily = "'Plus Jakarta Sans', sans-serif";
      toast.style.fontSize = '0.85rem';
      toast.style.fontWeight = '600';
      toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
      toast.style.zIndex = '9999';
      toast.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';

    setTimeout(() => {
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
    }, 2200);
  }

  if (btnWave) {
    btnWave.addEventListener('click', () => {
      showToast('👋 The Bear is happily waving to you!');
      viewerCard.style.transform = 'scale(1.015)';
      setTimeout(() => { viewerCard.style.transform = 'scale(1)'; }, 300);
    });
  }

  if (btnBlink) {
    btnBlink.addEventListener('click', () => {
      showToast('👀 *Blink blink!* Cute catchlights sparkle.');
    });
  }

  // 3. Camera Framing & Elevated Full Body View Management
  const btnCamFullBody = document.getElementById('btnCamFullBody');
  const btnCamElevated = document.getElementById('btnCamElevated');
  const btnCamWide = document.getElementById('btnCamWide');
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');

  const CAM_PRESETS = {
    fullbody: {
      pos: { x: 0, y: 480, z: 1420 },
      target: { x: 0, y: 195, z: 0 },
      zoom: 1.0,
      label: '🐻 Elevated Full Body View'
    },
    elevated: {
      pos: { x: 0, y: 740, z: 1250 },
      target: { x: 0, y: 160, z: 0 },
      zoom: 1.0,
      label: '📐 High Angle Perspective'
    },
    wide: {
      pos: { x: 0, y: 560, z: 1950 },
      target: { x: 0, y: 180, z: 0 },
      zoom: 1.0,
      label: '🌲 Wide Forest Meadow View'
    }
  };

  let activePreset = 'fullbody';
  let zoomLevel = 1.0;

  function getSplineApp() {
    return splineViewer && splineViewer._spline ? splineViewer._spline : null;
  }

  function applyCameraFraming(preset = 'fullbody', zoomOverride = null) {
    const app = getSplineApp();
    if (!app) return;

    activePreset = preset;
    const cam = app._camera;
    const controls = app._controls;
    const orbit = controls ? controls.orbitControls : null;
    const cfg = CAM_PRESETS[preset] || CAM_PRESETS.fullbody;

    if (zoomOverride !== null) {
      zoomLevel = zoomOverride;
    } else {
      zoomLevel = cfg.zoom;
    }

    if (cam) {
      cam.position.set(cfg.pos.x, cfg.pos.y, cfg.pos.z);

      if (orbit && orbit.target) {
        orbit.target.set(cfg.target.x, cfg.target.y, cfg.target.z);
        if (orbit.offset && orbit.spherical) {
          orbit.offset.copy(cam.position).sub(orbit.target);
          orbit.spherical.setFromVector3(orbit.offset);
          orbit.initialSphericalRadius = orbit.spherical.radius;
        }
        cam.lookAt(orbit.target);
        if (typeof orbit.update === 'function') {
          orbit.update();
        }
      } else {
        cam.lookAt(cfg.target.x, cfg.target.y, cfg.target.z);
      }

      if (typeof cam.zoom === 'number') {
        cam.zoom = zoomLevel;
      }

      if (typeof cam.updateProjectionMatrix === 'function') {
        cam.updateProjectionMatrix();
      }
    }

    try {
      if (typeof app.setZoom === 'function') {
        app.setZoom(zoomLevel);
      }
    } catch (e) {}

    if (typeof app.requestRender === 'function') {
      app.requestRender();
    }

    // Update active preset button highlighting
    [
      { btn: btnCamFullBody, name: 'fullbody' },
      { btn: btnCamElevated, name: 'elevated' },
      { btn: btnCamWide, name: 'wide' }
    ].forEach(({ btn, name }) => {
      if (btn) btn.classList.toggle('active', activePreset === name);
    });
  }

  // Hook into Spline loader
  if (splineViewer) {
    splineViewer.addEventListener('load-complete', () => {
      setTimeout(() => {
        applyCameraFraming('fullbody');
      }, 150);
    });
  }

  // Safety poll to ensure camera applies even if scene finished loading earlier
  let camCheckCount = 0;
  const camCheckTimer = setInterval(() => {
    camCheckCount++;
    const app = getSplineApp();
    if (app && app._camera) {
      applyCameraFraming('fullbody');
      clearInterval(camCheckTimer);
    } else if (camCheckCount > 25) {
      clearInterval(camCheckTimer);
    }
  }, 200);

  // Button Listeners for Camera Presets
  if (btnCamFullBody) {
    btnCamFullBody.addEventListener('click', (e) => {
      e.preventDefault();
      applyCameraFraming('fullbody');
      showToast('🐻 Camera: Elevated Full Body View');
    });
  }

  if (btnCamElevated) {
    btnCamElevated.addEventListener('click', (e) => {
      e.preventDefault();
      applyCameraFraming('elevated');
      showToast('📐 Camera: High Angle Perspective');
    });
  }

  if (btnCamWide) {
    btnCamWide.addEventListener('click', (e) => {
      e.preventDefault();
      applyCameraFraming('wide');
      showToast('🌲 Camera: Wide Forest Meadow View');
    });
  }

  if (btnZoomIn) {
    btnZoomIn.addEventListener('click', (e) => {
      e.preventDefault();
      zoomLevel = Math.min(1.4, zoomLevel + 0.1);
      applyCameraFraming(activePreset, zoomLevel);
      showToast(`🔍 Zoom In: ${(zoomLevel * 100).toFixed(0)}%`);
    });
  }

  if (btnZoomOut) {
    btnZoomOut.addEventListener('click', (e) => {
      e.preventDefault();
      zoomLevel = Math.max(0.4, zoomLevel - 0.1);
      applyCameraFraming(activePreset, zoomLevel);
      showToast(`🔍 Zoom Out: ${(zoomLevel * 100).toFixed(0)}%`);
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      viewerCard.style.transition = 'transform 0.4s ease';
      viewerCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
      setTimeout(() => { viewerCard.style.transition = ''; }, 400);
      applyCameraFraming('fullbody');
      resetGame();
      showToast('🔄 Camera & Quest reset to Full Body View!');
    });
  }

  if (viewerCard) {
    viewerCard.style.transform = 'none';
  }

  // 4. Walking, Running & Jumping Controls Integration
  const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    shift: false,
    jump: false
  };

  let jumpingTimeout = null;
  let isAirborneVisual = false;

  const statusPill = document.getElementById('statusPill');
  const statusText = document.getElementById('statusText');
  const btnDpadUp = document.getElementById('btnDpadUp');
  const btnDpadDown = document.getElementById('btnDpadDown');
  const btnDpadLeft = document.getElementById('btnDpadLeft');
  const btnDpadRight = document.getElementById('btnDpadRight');
  const btnActionJump = document.getElementById('btnActionJump');
  const btnActionRun = document.getElementById('btnActionRun');

  function updateStatusUI() {
    const isMoving = keys.forward || keys.backward || keys.left || keys.right;
    const isRunning = keys.shift && isMoving;

    if (statusPill && statusText) {
      if (isAirborneVisual) {
        statusPill.className = 'viewer-status-pill jumping';
        statusText.textContent = '🦘 Jumping (Airborne)';
      } else if (isRunning) {
        statusPill.className = 'viewer-status-pill running';
        const actions = [];
        if (keys.forward) actions.push('Forward');
        if (keys.backward) actions.push('Backward');
        if (keys.left) actions.push('Left');
        if (keys.right) actions.push('Right');
        statusText.textContent = `⚡ Sprinting ${actions.join(' + ')} (2x)`;
      } else if (isMoving) {
        statusPill.className = 'viewer-status-pill walking';
        const actions = [];
        if (keys.forward) actions.push('Forward');
        if (keys.backward) actions.push('Backward');
        if (keys.left) actions.push('Left');
        if (keys.right) actions.push('Right');
        statusText.textContent = `🚶 Walking ${actions.join(' + ')}`;
      } else {
        statusPill.className = 'viewer-status-pill';
        statusText.textContent = '🧸 Idle (Breathing & Waving)';
      }
    }

    if (btnDpadUp) btnDpadUp.classList.toggle('active', keys.forward);
    if (btnDpadDown) btnDpadDown.classList.toggle('active', keys.backward);
    if (btnDpadLeft) btnDpadLeft.classList.toggle('active', keys.left);
    if (btnDpadRight) btnDpadRight.classList.toggle('active', keys.right);
    if (btnActionRun) btnActionRun.classList.toggle('active', keys.shift);
    if (btnActionJump) btnActionJump.classList.toggle('active', keys.jump);
  }

  // WebAudio Procedural Sound Synthesis (Zero assets required)
  let audioCtx = null;
  function initAudio() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) audioCtx = new AudioCtxClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playCoinSound() {
    try {
      initAudio();
      if (!audioCtx) return;
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(987.77, t); // B5
      osc.frequency.setValueAtTime(1318.51, t + 0.08); // E6

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.34);
    } catch (e) {}
  }

  function playVictoryFanfare() {
    try {
      initAudio();
      if (!audioCtx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const t = audioCtx.currentTime + idx * 0.12;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(t);
        osc.stop(t + 0.38);
      });
    } catch (e) {}
  }

  function playResetSound() {
    try {
      initAudio();
      if (!audioCtx) return;
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.18);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.22);
    } catch (e) {}
  }

  // 5. Coin System & Mission State
  let collectedCoins = 0;
  const TOTAL_COINS = 10;
  const coinsCountEl = document.getElementById('coinsCount');
  const progressBarFill = document.getElementById('progressBarFill');
  const coinsBadge = document.getElementById('coinsBadge');
  const victoryModal = document.getElementById('victoryModal');
  const btnPlayAgain = document.getElementById('btnPlayAgain');

  function spawnCoinParticle() {
    const hud = document.getElementById('gameMissionHud');
    if (!hud) return;
    const p = document.createElement('div');
    p.className = 'floating-pickup-pill';
    p.textContent = '+1 🪙';
    hud.appendChild(p);
    setTimeout(() => { p.remove(); }, 850);
  }

  function broadcastToSpline(payload) {
    window.postMessage(payload, '*');
    try {
      if (splineViewer && splineViewer.shadowRoot) {
        const iframes = splineViewer.shadowRoot.querySelectorAll('iframe');
        iframes.forEach(f => {
          if (f.contentWindow) f.contentWindow.postMessage(payload, '*');
        });
      }
      document.querySelectorAll('iframe').forEach(f => {
        if (f.contentWindow) f.contentWindow.postMessage(payload, '*');
      });
    } catch (e) {
      // Handled cleanly
    }
  }

  function broadcastControl(jumpTrigger = false) {
    updateStatusUI();
    const payload = {
      type: 'bear-control',
      forward: keys.forward,
      backward: keys.backward,
      left: keys.left,
      right: keys.right,
      shift: keys.shift,
      jump: jumpTrigger
    };
    broadcastToSpline(payload);
  }

  function resetGame() {
    collectedCoins = 0;
    if (coinsCountEl) coinsCountEl.textContent = '0';
    if (progressBarFill) progressBarFill.style.width = '0%';
    if (victoryModal) victoryModal.classList.remove('active');

    broadcastToSpline({ type: 'reset-game' });
    playResetSound();
    showToast('🔄 Quest reset! Collect all 10 coins!');
  }

  if (btnPlayAgain) {
    btnPlayAgain.addEventListener('click', () => {
      resetGame();
    });
  }

  // Listen for coin collection & mission events from Spline iframe
  window.addEventListener('message', (e) => {
    if (!e.data) return;

    if (e.data.type === 'coin-collected') {
      collectedCoins = e.data.collectedCount;
      if (coinsCountEl) coinsCountEl.textContent = collectedCoins;
      if (progressBarFill) {
        const pct = Math.min(100, Math.round((collectedCoins / (e.data.totalCoins || TOTAL_COINS)) * 100));
        progressBarFill.style.width = pct + '%';
      }
      if (coinsBadge) {
        coinsBadge.classList.add('pop');
        setTimeout(() => coinsBadge.classList.remove('pop'), 250);
      }
      spawnCoinParticle();
      playCoinSound();
      showToast(`🪙 Coin collected! (${collectedCoins}/10)`);
    } else if (e.data.type === 'mission-complete') {
      if (victoryModal) victoryModal.classList.add('active');
      playVictoryFanfare();
      showToast('🎉 AMAZING! You collected every coin!');
    } else if (e.data.type === 'game-reset') {
      collectedCoins = 0;
      if (coinsCountEl) coinsCountEl.textContent = '0';
      if (progressBarFill) progressBarFill.style.width = '0%';
      if (victoryModal) victoryModal.classList.remove('active');
    }
  });

  function triggerJump() {
    isAirborneVisual = true;
    keys.jump = true;
    broadcastControl(true);
    showToast('🦘 Bear jumped into the air!');

    clearTimeout(jumpingTimeout);
    jumpingTimeout = setTimeout(() => {
      isAirborneVisual = false;
      keys.jump = false;
      updateStatusUI();
    }, 750);
  }

  // Keyboard Event Listeners
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    let handled = false;
    let jumpRequested = false;

    if (e.code === 'KeyW' || e.code === 'ArrowUp') { keys.forward = true; handled = true; }
    if (e.code === 'KeyS' || e.code === 'ArrowDown') { keys.backward = true; handled = true; }
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') { keys.left = true; handled = true; }
    if (e.code === 'KeyD' || e.code === 'ArrowRight') { keys.right = true; handled = true; }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') { keys.shift = true; handled = true; }
    if (e.code === 'KeyR') {
      resetGame();
      handled = true;
    }
    if (e.code === 'Space') {
      if (!isAirborneVisual) {
        jumpRequested = true;
        handled = true;
      }
    }

    if (jumpRequested) {
      e.preventDefault();
      triggerJump();
    } else if (handled) {
      e.preventDefault();
      broadcastControl(false);
    }
  });

  window.addEventListener('keyup', (e) => {
    let handled = false;
    if (e.code === 'KeyW' || e.code === 'ArrowUp') { keys.forward = false; handled = true; }
    if (e.code === 'KeyS' || e.code === 'ArrowDown') { keys.backward = false; handled = true; }
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') { keys.left = false; handled = true; }
    if (e.code === 'KeyD' || e.code === 'ArrowRight') { keys.right = false; handled = true; }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') { keys.shift = false; handled = true; }
    if (e.code === 'Space') { keys.jump = false; handled = true; }

    if (handled) {
      e.preventDefault();
      broadcastControl(false);
    }
  });

  // Action Buttons (Jump & Run)
  if (btnActionJump) {
    btnActionJump.addEventListener('click', (e) => {
      e.preventDefault();
      triggerJump();
    });
  }

  if (btnActionRun) {
    // Click toggles sprint mode for mobile/mouse convenience
    btnActionRun.addEventListener('click', (e) => {
      e.preventDefault();
      keys.shift = !keys.shift;
      broadcastControl(false);
      showToast(keys.shift ? '⚡ Sprint mode enabled!' : '🚶 Walk mode enabled');
    });
  }

  // Touch & Mouse Support for D-Pad Buttons
  function bindDpad(btn, dirKey) {
    if (!btn) return;
    const start = (e) => {
      e.preventDefault();
      keys[dirKey] = true;
      broadcastControl(false);
    };
    const end = (e) => {
      e.preventDefault();
      keys[dirKey] = false;
      broadcastControl(false);
    };

    btn.addEventListener('mousedown', start);
    btn.addEventListener('mouseup', end);
    btn.addEventListener('mouseleave', end);

    btn.addEventListener('touchstart', start, { passive: false });
    btn.addEventListener('touchend', end, { passive: false });
    btn.addEventListener('touchcancel', end, { passive: false });
  }

  bindDpad(btnDpadUp, 'forward');
  bindDpad(btnDpadDown, 'backward');
  bindDpad(btnDpadLeft, 'left');
  bindDpad(btnDpadRight, 'right');

  // 5. Copy Code Buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const codeId = btn.getAttribute('data-code');
      const codeEl = document.getElementById(codeId);
      if (codeEl) {
        navigator.clipboard.writeText(codeEl.innerText).then(() => {
          const originalText = btn.textContent;
          btn.textContent = '✓ Copied!';
          setTimeout(() => { btn.textContent = originalText; }, 2000);
          showToast('📋 Code copied to clipboard!');
        });
      }
    });
  });
});
