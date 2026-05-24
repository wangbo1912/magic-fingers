class MagicFingers {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        this.particles = [];
        this.trails = [];
        this.geometries = [];
        this.shockwaves = [];
        this.pointLights = [];

        this.currentState = 'idle';
        this.isInitialized = false;
        this.isMobile = this.checkIsMobile();
        this.maxParticles = this.isMobile ? 220 : 460;
        this.maxStars = this.isMobile ? 700 : 1400;

        this.cameraTarget = { x: 0, y: 0, z: 27 };
        this.cameraShake = 0;

        this.effectsEnabled = true;
        this.effectTimers = new Set();
        this.effectGeneration = 0;

        this.lastRawGesture = null;
        this.rawGestureStartedAt = 0;
        this.rawGestureFrames = 0;
        this.lastCommittedGesture = null;
        this.lastGestureAt = 0;
        this.gestureHoldMs = this.isMobile ? 220 : 180;
        this.gestureCooldownMs = this.isMobile ? 520 : 430;

        this.currentClearColor = new THREE.Color(0x050812);
        this.targetClearColor = new THREE.Color(0x050812);
        this.targetFogColor = new THREE.Color(0x0a0a14);
        this.targetFogDensity = 0.012;
        this.currentStarSpinSpeed = 0.00025;
        this.targetStarSpinSpeed = 0.00025;
        this.currentStarPulse = 1;
        this.targetStarPulse = 1;
        this.currentStarColor = new THREE.Color(0x66cfff);
        this.targetStarColor = new THREE.Color(0x66cfff);

        this.corePulse = 1;
        this.targetCorePulse = 1;
        this.coreColor = new THREE.Color(0x00d4ff);
        this.targetCoreColor = new THREE.Color(0x00d4ff);

        this.modeProfiles = this.buildModeProfiles();

        this.init();
    }

    checkIsMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    }

    buildModeProfiles() {
        return {
            idle: {
                status: '🖐️ 伸出手，切换舞台',
                active: false,
                camera: { x: 0, y: 0, z: 27 },
                fogColor: 0x0a0a14,
                fogDensity: 0.012,
                clearColor: 0x050812,
                starColor: 0x66cfff,
                starSpinSpeed: 0.00025,
                starPulse: 1,
                coreColor: 0x00d4ff,
                corePulse: 1,
                lightPalette: [0x00c8ff, 0x4d8dff, 0x85f3ff, 0x5c7eff],
                lightIntensity: 1.2,
                flashColor: 0x00a6ff,
                flashOpacity: 0.24,
                cameraShake: 0.15,
                bgA: '#09111f',
                bgB: '#0b1d33',
                bgC: '#0c1a28'
            },
            one: {
                status: '👆 量子光枪',
                active: true,
                camera: { x: 0, y: 1.2, z: 19.5 },
                fogColor: 0x0f1c30,
                fogDensity: 0.018,
                clearColor: 0x091125,
                starColor: 0x4fd9ff,
                starSpinSpeed: 0.0008,
                starPulse: 1.3,
                coreColor: 0x18f0ff,
                corePulse: 1.5,
                lightPalette: [0x00e6ff, 0x4fc3ff, 0x7cf0ff, 0x00b9ff],
                lightIntensity: 2,
                flashColor: 0x2ec5ff,
                flashOpacity: 0.38,
                cameraShake: 0.5,
                bgA: '#0a1433',
                bgB: '#0b2b4b',
                bgC: '#08213a'
            },
            two: {
                status: '✌️ 双螺旋风暴',
                active: true,
                camera: { x: 0, y: -0.4, z: 23 },
                fogColor: 0x190f33,
                fogDensity: 0.015,
                clearColor: 0x100924,
                starColor: 0xff7ac7,
                starSpinSpeed: 0.0012,
                starPulse: 1.45,
                coreColor: 0xff42d0,
                corePulse: 1.8,
                lightPalette: [0xff00bf, 0x6f4bff, 0xff7bf3, 0x4d8dff],
                lightIntensity: 2.3,
                flashColor: 0xff3bc7,
                flashOpacity: 0.42,
                cameraShake: 0.65,
                bgA: '#210a2f',
                bgB: '#3f1152',
                bgC: '#1f0c33'
            },
            three: {
                status: '🤟 三相矩阵',
                active: true,
                camera: { x: 0, y: 0.2, z: 21.5 },
                fogColor: 0x1b2614,
                fogDensity: 0.017,
                clearColor: 0x111d0d,
                starColor: 0xb9ff73,
                starSpinSpeed: 0.00095,
                starPulse: 1.5,
                coreColor: 0x9dff3c,
                corePulse: 1.7,
                lightPalette: [0xa8ff42, 0x6cf8ff, 0xffea00, 0x8eff56],
                lightIntensity: 2.15,
                flashColor: 0xd9ff50,
                flashOpacity: 0.42,
                cameraShake: 0.72,
                bgA: '#1a250f',
                bgB: '#2b4022',
                bgC: '#182c17'
            },
            four: {
                status: '🖖 超立方传送门',
                active: true,
                camera: { x: 0, y: 0, z: 29.5 },
                fogColor: 0x24100f,
                fogDensity: 0.02,
                clearColor: 0x160b08,
                starColor: 0xffb66a,
                starSpinSpeed: 0.00155,
                starPulse: 1.65,
                coreColor: 0xff8844,
                corePulse: 2,
                lightPalette: [0xff7e2f, 0xffb700, 0xff5c4a, 0xffd877],
                lightIntensity: 2.6,
                flashColor: 0xff9f32,
                flashOpacity: 0.48,
                cameraShake: 0.85,
                bgA: '#2a120d',
                bgB: '#4a2417',
                bgC: '#33180f'
            },
            five: {
                status: '🖐️ 星云终章',
                active: true,
                camera: { x: 0, y: 1.8, z: 34 },
                fogColor: 0x230d2d,
                fogDensity: 0.016,
                clearColor: 0x190a26,
                starColor: 0xffa0e4,
                starSpinSpeed: 0.002,
                starPulse: 1.9,
                coreColor: 0xff4ec7,
                corePulse: 2.3,
                lightPalette: [0xff38bb, 0x7a58ff, 0xffc95e, 0x4df4ff],
                lightIntensity: 2.9,
                flashColor: 0xff60c4,
                flashOpacity: 0.52,
                cameraShake: 1.05,
                bgA: '#2a0d30',
                bgB: '#4b1848',
                bgC: '#2d0e3a'
            }
        };
    }

    init() {
        this.setupThreeJS();
        this.createStarfield();
        this.setupLights();
        this.createEnergyCore();
        this.setupMediaPipe();
        this.setupEventListeners();
        this.setMode('idle', true);
        this.animate();
    }

    setupThreeJS() {
        const container = document.getElementById('canvas-container');

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(this.targetFogColor.getHex(), this.targetFogDensity);

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1200
        );
        this.camera.position.set(0, 0, this.cameraTarget.z);

        this.renderer = new THREE.WebGLRenderer({
            antialias: !this.isMobile,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(this.currentClearColor, 1);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = this.isMobile ? 1.05 : 1.16;
        const pixelRatio = this.isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2);
        this.renderer.setPixelRatio(pixelRatio);
        container.appendChild(this.renderer.domElement);

        this.isInitialized = true;
    }

    createStarfield() {
        const starGeometry = new THREE.BufferGeometry();
        const farGeometry = new THREE.BufferGeometry();
        const count = this.maxStars;
        const farCount = Math.floor(this.maxStars * 0.45);

        const positions = new Float32Array(count * 3);
        const farPositions = new Float32Array(farCount * 3);
        const sizes = new Float32Array(count);
        const farSizes = new Float32Array(farCount);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 260;
            positions[i3 + 1] = (Math.random() - 0.5) * 180;
            positions[i3 + 2] = (Math.random() - 0.5) * 260 - 30;
            sizes[i] = Math.random() * 2.2 + 0.4;
        }

        for (let i = 0; i < farCount; i++) {
            const i3 = i * 3;
            farPositions[i3] = (Math.random() - 0.5) * 420;
            farPositions[i3 + 1] = (Math.random() - 0.5) * 300;
            farPositions[i3 + 2] = (Math.random() - 0.5) * 350 - 100;
            farSizes[i] = Math.random() * 3.8 + 0.8;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        farGeometry.setAttribute('position', new THREE.BufferAttribute(farPositions, 3));
        farGeometry.setAttribute('size', new THREE.BufferAttribute(farSizes, 1));

        this.starMaterial = new THREE.PointsMaterial({
            color: this.currentStarColor.clone(),
            size: 0.7,
            transparent: true,
            opacity: 0.82,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        this.farStarMaterial = new THREE.PointsMaterial({
            color: this.currentStarColor.clone(),
            size: 1.1,
            transparent: true,
            opacity: 0.34,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        this.starField = new THREE.Points(starGeometry, this.starMaterial);
        this.farStarField = new THREE.Points(farGeometry, this.farStarMaterial);
        this.scene.add(this.starField);
        this.scene.add(this.farStarField);
    }

    setupLights() {
        this.ambientLight = new THREE.AmbientLight(0x12213a, 0.65);
        this.scene.add(this.ambientLight);

        this.keyLight = new THREE.DirectionalLight(0x7fd6ff, 0.55);
        this.keyLight.position.set(0, 16, 18);
        this.scene.add(this.keyLight);

        this.fillLight = new THREE.DirectionalLight(0xff6ad0, 0.25);
        this.fillLight.position.set(-12, 6, -6);
        this.scene.add(this.fillLight);

        const baseColors = [0x00d3ff, 0xff3ab5, 0x8e6cff, 0xffc75e];
        for (let i = 0; i < 4; i++) {
            const light = new THREE.PointLight(baseColors[i], 1.2, 90);
            light.position.set(
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 24,
                (Math.random() - 0.5) * 20
            );
            light.userData = {
                speed: 0.45 + Math.random() * 0.75,
                amplitude: 6 + Math.random() * 7,
                offset: Math.random() * Math.PI * 2,
                targetColor: new THREE.Color(baseColors[i]),
                targetIntensity: 1.2
            };
            this.scene.add(light);
            this.pointLights.push(light);
        }
    }

    createEnergyCore() {
        this.coreGroup = new THREE.Group();

        const innerGeometry = new THREE.IcosahedronGeometry(this.isMobile ? 1.2 : 1.35, 1);
        const innerMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: this.coreColor.clone(),
            emissiveIntensity: 1.35,
            shininess: 220,
            transparent: true,
            opacity: 0.92
        });
        this.coreInner = new THREE.Mesh(innerGeometry, innerMaterial);
        this.coreGroup.add(this.coreInner);

        const shellGeometry = new THREE.SphereGeometry(this.isMobile ? 1.8 : 2.1, this.isMobile ? 18 : 28, this.isMobile ? 18 : 28);
        const shellMaterial = new THREE.MeshBasicMaterial({
            color: this.coreColor.clone(),
            transparent: true,
            opacity: 0.13,
            side: THREE.BackSide
        });
        this.coreShell = new THREE.Mesh(shellGeometry, shellMaterial);
        this.coreGroup.add(this.coreShell);

        const ringGeometry = new THREE.TorusGeometry(this.isMobile ? 2.6 : 3.1, 0.07, 10, 72);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: this.coreColor.clone(),
            transparent: true,
            opacity: 0.7
        });
        this.coreRing = new THREE.Mesh(ringGeometry, ringMaterial);
        this.coreRing.rotation.x = Math.PI * 0.34;
        this.coreGroup.add(this.coreRing);

        this.scene.add(this.coreGroup);
    }

    setupMediaPipe() {
        const videoElement = document.getElementById('webcam');

        const hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: this.isMobile ? 0 : 1,
            minDetectionConfidence: 0.72,
            minTrackingConfidence: 0.72
        });

        hands.onResults((results) => this.onResults(results));

        const camera = new Camera(videoElement, {
            onFrame: async () => {
                await hands.send({ image: videoElement });
            },
            width: this.isMobile ? 480 : 640,
            height: this.isMobile ? 360 : 480
        });
        camera.start();

        setTimeout(() => {
            const loading = document.getElementById('loading');
            loading.style.opacity = '0';
            setTimeout(() => {
                loading.style.display = 'none';
            }, 800);
            const status = document.getElementById('status');
            status.innerHTML = '🖐️ 伸出手，切换舞台';
            status.style.opacity = '1';
        }, 2400);
    }

    onResults(results) {
        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            this.resetGestureBuffer();
            return;
        }

        const landmarks = results.multiHandLandmarks[0];
        const fingerCount = this.countFingers(landmarks);
        this.queueStableGesture(fingerCount);
    }

    queueStableGesture(fingerCount) {
        const now = performance.now();

        if (fingerCount !== this.lastRawGesture) {
            this.lastRawGesture = fingerCount;
            this.rawGestureStartedAt = now;
            this.rawGestureFrames = 1;
            return;
        }

        this.rawGestureFrames++;
        const requiredHoldMs = fingerCount === 0 ? this.gestureHoldMs + 160 : this.gestureHoldMs;
        const requiredFrames = fingerCount === 0 ? 7 : 5;
        const requiredCooldownMs = fingerCount === 0 ? Math.max(this.gestureCooldownMs, 650) : this.gestureCooldownMs;
        const hasHeldGesture = now - this.rawGestureStartedAt >= requiredHoldMs || this.rawGestureFrames >= requiredFrames;
        const isNewGesture = fingerCount !== this.lastCommittedGesture;
        const isPastCooldown = now - this.lastGestureAt >= requiredCooldownMs;

        if (hasHeldGesture && isNewGesture && isPastCooldown) {
            this.lastCommittedGesture = fingerCount;
            this.lastGestureAt = now;
            this.handleGesture(fingerCount);
        }
    }

    resetGestureBuffer() {
        this.lastRawGesture = null;
        this.rawGestureStartedAt = 0;
        this.rawGestureFrames = 0;
    }

    countFingers(landmarks) {
        const fingers = [
            { tip: 8, dip: 7, pip: 6, mcp: 5 },
            { tip: 12, dip: 11, pip: 10, mcp: 9 },
            { tip: 16, dip: 15, pip: 14, mcp: 13 },
            { tip: 20, dip: 19, pip: 18, mcp: 17 }
        ];
        let count = 0;

        for (const finger of fingers) {
            if (this.isFingerExtended(landmarks, finger)) {
                count++;
            }
        }

        if (this.isThumbExtended(landmarks)) {
            count++;
        }

        return count;
    }

    isFingerExtended(landmarks, finger) {
        const palmCenter = this.getPalmCenter(landmarks);
        const tip = landmarks[finger.tip];
        const dip = landmarks[finger.dip];
        const pip = landmarks[finger.pip];
        const mcp = landmarks[finger.mcp];
        const pipAngle = this.angleBetween(mcp, pip, tip);
        const dipAngle = this.angleBetween(pip, dip, tip);
        const tipDistance = this.distance(tip, palmCenter);
        const pipDistance = this.distance(pip, palmCenter);
        const lifted = tip.y < mcp.y + 0.025;

        return pipAngle > 2.4 && dipAngle > 2.2 && tipDistance > pipDistance + 0.018 && lifted;
    }

    isThumbExtended(landmarks) {
        const palmCenter = this.getPalmCenter(landmarks);
        const mcp = landmarks[2];
        const ip = landmarks[3];
        const tip = landmarks[4];
        const tipDistance = this.distance(tip, palmCenter);
        const ipDistance = this.distance(ip, palmCenter);
        const mcpDistance = this.distance(mcp, palmCenter);
        const thumbAngle = this.angleBetween(mcp, ip, tip);
        const spread = Math.abs(tip.x - mcp.x) > Math.abs(ip.x - mcp.x) + 0.008;

        return thumbAngle > 2.25 && spread && tipDistance > Math.max(ipDistance + 0.02, mcpDistance + 0.045);
    }

    getPalmCenter(landmarks) {
        const points = [0, 5, 9, 13, 17].map((index) => landmarks[index]);
        return points.reduce((center, point) => ({
            x: center.x + point.x / points.length,
            y: center.y + point.y / points.length,
            z: center.z + (point.z || 0) / points.length
        }), { x: 0, y: 0, z: 0 });
    }

    angleBetween(a, b, c) {
        const ab = { x: a.x - b.x, y: a.y - b.y, z: (a.z || 0) - (b.z || 0) };
        const cb = { x: c.x - b.x, y: c.y - b.y, z: (c.z || 0) - (b.z || 0) };
        const dot = ab.x * cb.x + ab.y * cb.y + ab.z * cb.z;
        const abLength = Math.sqrt(ab.x * ab.x + ab.y * ab.y + ab.z * ab.z);
        const cbLength = Math.sqrt(cb.x * cb.x + cb.y * cb.y + cb.z * cb.z);

        if (abLength === 0 || cbLength === 0) {
            return 0;
        }

        const cosine = Math.min(1, Math.max(-1, dot / (abLength * cbLength)));
        return Math.acos(cosine);
    }

    distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dz = (a.z || 0) - (b.z || 0);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    handleGesture(fingerCount) {
        switch (fingerCount) {
            case 0:
                this.setMode('idle');
                break;
            case 1:
                this.setMode('one');
                break;
            case 2:
                this.setMode('two');
                break;
            case 3:
                this.setMode('three');
                break;
            case 4:
                this.setMode('four');
                break;
            case 5:
                this.setMode('five');
                break;
            default:
                break;
        }
    }

    triggerEffect(action) {
        const actionGesture = Number(action);
        if (!Number.isNaN(actionGesture)) {
            this.lastCommittedGesture = actionGesture;
            this.lastGestureAt = performance.now();
            this.resetGestureBuffer();
        }

        switch (action) {
            case '0':
                this.setMode('idle');
                break;
            case '1':
                this.setMode('one');
                break;
            case '2':
                this.setMode('two');
                break;
            case '3':
                this.setMode('three');
                break;
            case '4':
                this.setMode('four');
                break;
            case '5':
                this.setMode('five');
                break;
            default:
                break;
        }
    }

    setMode(modeKey, force = false) {
        if (!this.modeProfiles[modeKey]) {
            return;
        }
        if (!force && this.currentState === modeKey) {
            return;
        }

        const profile = this.modeProfiles[modeKey];
        this.clearDynamics();
        this.currentState = modeKey;
        this.applyProfile(profile);

        if (this.effectsEnabled) {
            this.triggerGlobalTransition(profile);
            this.spawnModeSignature(modeKey, profile);
        }
    }

    applyProfile(profile) {
        this.cameraTarget.x = profile.camera.x;
        this.cameraTarget.y = profile.camera.y;
        this.cameraTarget.z = profile.camera.z;

        this.targetFogColor.setHex(profile.fogColor);
        this.targetFogDensity = profile.fogDensity;
        this.targetClearColor.setHex(profile.clearColor);
        this.targetStarColor.setHex(profile.starColor);
        this.targetStarSpinSpeed = profile.starSpinSpeed;
        this.targetStarPulse = profile.starPulse;
        this.targetCoreColor.setHex(profile.coreColor);
        this.targetCorePulse = profile.corePulse;

        this.ambientLight.intensity = profile.active ? 0.68 : 0.54;
        this.keyLight.intensity = profile.active ? 0.85 : 0.5;
        this.fillLight.intensity = profile.active ? 0.35 : 0.22;

        this.pointLights.forEach((light, index) => {
            light.userData.targetColor = new THREE.Color(profile.lightPalette[index % profile.lightPalette.length]);
            light.userData.targetIntensity = profile.lightIntensity * (0.76 + Math.random() * 0.3);
        });

        const status = document.getElementById('status');
        status.classList.toggle('active', profile.active);
        status.innerHTML = profile.status;

        document.body.style.background = `radial-gradient(circle at 18% 22%, ${profile.bgA} 0%, ${profile.bgB} 48%, ${profile.bgC} 100%)`;
    }

    triggerGlobalTransition(profile) {
        this.cameraShake = Math.max(this.cameraShake, profile.cameraShake);
        this.createFlashPulse(profile.flashColor, profile.flashOpacity);

        const ringCount = this.isMobile ? 2 : 3;
        for (let i = 0; i < ringCount; i++) {
            this.scheduleEffect(() => {
                this.createShockwave(profile.flashColor, 2.2 + i * 0.8);
            }, i * 85);
        }

        this.emitBurst(
            new THREE.Vector3(0, 0, 0),
            profile.lightPalette,
            this.isMobile ? 90 : 180,
            [0.22, 0.75],
            { life: [0.9, 1.8], size: [0.05, 0.13], spreadY: 1.25, drag: 0.98 }
        );
    }

    spawnModeSignature(modeKey, profile) {
        switch (modeKey) {
            case 'idle':
                this.spawnIdleMode(profile);
                break;
            case 'one':
                this.spawnLanceMode(profile);
                break;
            case 'two':
                this.spawnHelixMode(profile);
                break;
            case 'three':
                this.spawnMatrixMode(profile);
                break;
            case 'four':
                this.spawnPortalMode(profile);
                break;
            case 'five':
                this.spawnFinaleMode(profile);
                break;
            default:
                break;
        }
    }

    spawnIdleMode(profile) {
        const orbiterCount = this.isMobile ? 6 : 12;
        for (let i = 0; i < orbiterCount; i++) {
            const radius = 2.8 + Math.random() * 3;
            const theta = Math.random() * Math.PI * 2;
            const y = (Math.random() - 0.5) * 2.8;
            const mesh = this.createGlowSphere(profile.lightPalette[i % profile.lightPalette.length], 0.08 + Math.random() * 0.06);
            mesh.position.set(Math.cos(theta) * radius, y, Math.sin(theta) * radius);
            mesh.userData.kind = 'orbiter';
            mesh.userData.orbitRadius = radius;
            mesh.userData.orbitSpeed = 0.35 + Math.random() * 0.45;
            mesh.userData.orbitOffset = theta;
            mesh.userData.floatOffset = Math.random() * Math.PI * 2;
            mesh.userData.life = 12 + Math.random() * 6;
            this.scene.add(mesh);
            this.geometries.push(mesh);
        }
    }

    spawnLanceMode(profile) {
        const beamGeometry = new THREE.CylinderGeometry(0.45, 0.65, 21, this.isMobile ? 10 : 18, 1, true);
        const beamMaterial = new THREE.MeshBasicMaterial({
            color: profile.lightPalette[0],
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.userData.kind = 'beam';
        beam.userData.life = 6;
        beam.userData.pulseSpeed = 2.4;
        this.scene.add(beam);
        this.geometries.push(beam);

        for (let i = 0; i < 4; i++) {
            const ringGeometry = new THREE.TorusGeometry(2 + i * 1.5, 0.08, 8, 72);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: profile.lightPalette[i % profile.lightPalette.length],
                transparent: true,
                opacity: 0.7 - i * 0.12
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            ring.position.y = -6 + i * 4;
            ring.userData.kind = 'beamRing';
            ring.userData.life = 5.6;
            ring.userData.speed = 1.2 + i * 0.45;
            this.scene.add(ring);
            this.geometries.push(ring);
        }

        const streamLoops = this.isMobile ? 24 : 42;
        for (let i = 0; i < streamLoops; i++) {
            this.scheduleEffect(() => {
                const angle = Math.random() * Math.PI * 2;
                const radius = 1.1 + Math.random() * 2;
                const pos = new THREE.Vector3(Math.cos(angle) * radius, -8.5, Math.sin(angle) * radius);
                const speed = 0.26 + Math.random() * 0.22;
                const p = this.createParticle(
                    pos.x,
                    pos.y,
                    pos.z,
                    profile.lightPalette[Math.floor(Math.random() * profile.lightPalette.length)],
                    0.08 + Math.random() * 0.04
                );
                p.userData.velocity.x *= 0.2;
                p.userData.velocity.z *= 0.2;
                p.userData.velocity.y = speed;
                p.userData.life = 1.2 + Math.random() * 0.7;
                p.userData.drag = 0.985;
                p.userData.swirl = 0.08 + Math.random() * 0.05;
                p.userData.trailEvery = this.isMobile ? 0.15 : 0.09;
                this.particles.push(p);
            }, i * 55);
        }
    }

    spawnHelixMode(profile) {
        const group = new THREE.Group();
        const steps = this.isMobile ? 48 : 88;
        const radius = this.isMobile ? 3.2 : 4.1;
        const height = this.isMobile ? 14 : 18;

        for (let i = 0; i < steps; i++) {
            const t = i / (steps - 1);
            const y = -height * 0.5 + t * height;
            const angle = t * Math.PI * 8;
            const a = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
            const b = new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius);

            const sphereA = this.createGlowSphere(profile.lightPalette[0], this.isMobile ? 0.11 : 0.14);
            sphereA.position.copy(a);
            group.add(sphereA);

            const sphereB = this.createGlowSphere(profile.lightPalette[1], this.isMobile ? 0.11 : 0.14);
            sphereB.position.copy(b);
            group.add(sphereB);

            if (i % (this.isMobile ? 7 : 9) === 0) {
                const linkGeometry = new THREE.CylinderGeometry(0.035, 0.035, radius * 2, 6);
                const linkMaterial = new THREE.MeshBasicMaterial({
                    color: profile.lightPalette[2],
                    transparent: true,
                    opacity: 0.45
                });
                const link = new THREE.Mesh(linkGeometry, linkMaterial);
                link.position.set(0, y, 0);
                link.rotation.z = Math.PI / 2;
                link.rotation.y = angle;
                group.add(link);
            }
        }

        group.userData.kind = 'helix';
        group.userData.life = 8.2;
        group.userData.spin = 0.45;
        group.userData.wobble = 0.34;
        this.scene.add(group);
        this.geometries.push(group);

        const burstRepeats = this.isMobile ? 8 : 12;
        for (let i = 0; i < burstRepeats; i++) {
            this.scheduleEffect(() => {
                const side = i % 2 === 0 ? -1 : 1;
                this.emitBurst(
                    new THREE.Vector3(side * radius, 0, 0),
                    profile.lightPalette,
                    this.isMobile ? 24 : 38,
                    [0.12, 0.4],
                    { life: [0.8, 1.4], size: [0.05, 0.1], spreadY: 0.6, drag: 0.97 }
                );
            }, i * 130);
        }
    }

    spawnMatrixMode(profile) {
        const specs = [
            { geometry: new THREE.OctahedronGeometry(2.1, 0), color: profile.lightPalette[0], pos: [-6.2, 0, -3.2] },
            { geometry: new THREE.IcosahedronGeometry(2.7, 0), color: profile.lightPalette[1], pos: [0, 0, 0] },
            { geometry: new THREE.TetrahedronGeometry(2.5, 0), color: profile.lightPalette[2], pos: [6.2, 0, -3.2] }
        ];

        specs.forEach((spec, index) => {
            const material = new THREE.MeshBasicMaterial({
                color: spec.color,
                wireframe: true,
                transparent: true,
                opacity: 0.88
            });
            const mesh = new THREE.Mesh(spec.geometry, material);
            mesh.position.set(spec.pos[0], spec.pos[1], spec.pos[2]);
            mesh.userData.kind = 'matrixShape';
            mesh.userData.life = 8.5;
            mesh.userData.rotation = {
                x: (Math.random() - 0.5) * 0.03,
                y: (Math.random() - 0.5) * 0.035,
                z: (Math.random() - 0.5) * 0.03
            };
            mesh.userData.pulseSpeed = 1.2 + Math.random() * 0.8;
            mesh.userData.baseScale = 1;
            this.scene.add(mesh);
            this.geometries.push(mesh);

            this.scheduleEffect(() => {
                this.emitBurst(
                    new THREE.Vector3(spec.pos[0], spec.pos[1], spec.pos[2]),
                    profile.lightPalette,
                    this.isMobile ? 34 : 56,
                    [0.16, 0.55],
                    { life: [0.9, 1.7], size: [0.05, 0.11], spreadY: 0.9, drag: 0.978 }
                );
            }, index * 180);
        });

        const shardCount = this.isMobile ? 24 : 44;
        for (let i = 0; i < shardCount; i++) {
            this.scheduleEffect(() => {
                const size = 0.16 + Math.random() * 0.24;
                const geom = new THREE.BoxGeometry(size, size * (2 + Math.random() * 2.4), size);
                const mat = new THREE.MeshBasicMaterial({
                    color: profile.lightPalette[Math.floor(Math.random() * profile.lightPalette.length)],
                    transparent: true,
                    opacity: 0.82
                });
                const shard = new THREE.Mesh(geom, mat);
                shard.position.set((Math.random() - 0.5) * 22, 12 + Math.random() * 6, (Math.random() - 0.5) * 18);
                shard.userData.kind = 'shard';
                shard.userData.life = 3.5 + Math.random() * 2;
                shard.userData.velocity = {
                    x: (Math.random() - 0.5) * 0.06,
                    y: -(0.12 + Math.random() * 0.12),
                    z: (Math.random() - 0.5) * 0.06
                };
                shard.userData.rotation = {
                    x: (Math.random() - 0.5) * 0.05,
                    y: (Math.random() - 0.5) * 0.05,
                    z: (Math.random() - 0.5) * 0.05
                };
                this.scene.add(shard);
                this.geometries.push(shard);
            }, i * 75);
        }
    }

    spawnPortalMode(profile) {
        const portalGroup = new THREE.Group();
        const ringDefs = [
            { r: 5.2, tube: 0.15, color: profile.lightPalette[0], speed: 0.019 },
            { r: 4.1, tube: 0.11, color: profile.lightPalette[1], speed: -0.024 },
            { r: 3.1, tube: 0.09, color: profile.lightPalette[2], speed: 0.03 }
        ];

        ringDefs.forEach((def) => {
            const ringGeo = new THREE.TorusKnotGeometry(def.r, def.tube, this.isMobile ? 88 : 144, this.isMobile ? 12 : 18, 2, 3);
            const ringMat = new THREE.MeshBasicMaterial({
                color: def.color,
                transparent: true,
                opacity: 0.72,
                wireframe: true
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.userData.kind = 'portalRing';
            ring.userData.spin = def.speed;
            ring.userData.life = 10;
            portalGroup.add(ring);
        });

        portalGroup.position.z = -8;
        portalGroup.userData.kind = 'portalGroup';
        portalGroup.userData.life = 10;
        portalGroup.userData.spin = 0.01;
        this.scene.add(portalGroup);
        this.geometries.push(portalGroup);

        const voxelCount = this.isMobile ? 28 : 56;
        for (let i = 0; i < voxelCount; i++) {
            this.scheduleEffect(() => {
                const s = 0.25 + Math.random() * 0.4;
                const box = new THREE.Mesh(
                    new THREE.BoxGeometry(s, s, s),
                    new THREE.MeshPhongMaterial({
                        color: profile.lightPalette[Math.floor(Math.random() * profile.lightPalette.length)],
                        emissive: profile.lightPalette[Math.floor(Math.random() * profile.lightPalette.length)],
                        emissiveIntensity: 0.7,
                        transparent: true,
                        opacity: 0.86
                    })
                );
                box.position.set((Math.random() - 0.5) * 30, 11 + Math.random() * 12, (Math.random() - 0.5) * 16 - 4);
                box.userData.kind = 'voxel';
                box.userData.life = 3.8 + Math.random() * 2.8;
                box.userData.velocity = {
                    x: (Math.random() - 0.5) * 0.08,
                    y: -(0.16 + Math.random() * 0.16),
                    z: 0.04 + Math.random() * 0.08
                };
                box.userData.rotation = {
                    x: (Math.random() - 0.5) * 0.07,
                    y: (Math.random() - 0.5) * 0.07,
                    z: (Math.random() - 0.5) * 0.07
                };
                this.scene.add(box);
                this.geometries.push(box);
            }, i * 55);
        }

        const pulseCount = this.isMobile ? 5 : 8;
        for (let i = 0; i < pulseCount; i++) {
            this.scheduleEffect(() => {
                this.createShockwave(profile.lightPalette[i % profile.lightPalette.length], 2.4 + i * 0.8);
            }, i * 210);
        }
    }

    spawnFinaleMode(profile) {
        const petalGroup = new THREE.Group();
        const petals = this.isMobile ? 7 : 11;
        for (let i = 0; i < petals; i++) {
            const petal = new THREE.Mesh(
                new THREE.SphereGeometry(this.isMobile ? 0.48 : 0.62, this.isMobile ? 10 : 16, this.isMobile ? 10 : 16),
                new THREE.MeshPhongMaterial({
                    color: profile.lightPalette[i % profile.lightPalette.length],
                    emissive: profile.lightPalette[i % profile.lightPalette.length],
                    emissiveIntensity: 0.65,
                    transparent: true,
                    opacity: 0.88
                })
            );
            petal.userData.kind = 'petal';
            petal.userData.orbitRadius = 4.5 + Math.random() * 2.3;
            petal.userData.orbitSpeed = 0.45 + Math.random() * 0.4;
            petal.userData.orbitOffset = Math.random() * Math.PI * 2;
            petal.userData.vertical = (Math.random() - 0.5) * 1.6;
            petalGroup.add(petal);
        }
        petalGroup.userData.kind = 'petalGroup';
        petalGroup.userData.life = 12;
        this.scene.add(petalGroup);
        this.geometries.push(petalGroup);

        const fireworkBursts = this.isMobile ? 10 : 16;
        for (let i = 0; i < fireworkBursts; i++) {
            this.scheduleEffect(() => {
                const origin = new THREE.Vector3(
                    (Math.random() - 0.5) * 14,
                    -4 + Math.random() * 12,
                    (Math.random() - 0.5) * 10
                );
                this.emitBurst(
                    origin,
                    profile.lightPalette,
                    this.isMobile ? 36 : 65,
                    [0.25, 0.8],
                    { life: [1.2, 2.2], size: [0.06, 0.14], spreadY: 1.35, drag: 0.978, explosion: true, trails: true }
                );
            }, i * 220);
        }

        const lanternCount = this.isMobile ? 10 : 18;
        for (let i = 0; i < lanternCount; i++) {
            this.scheduleEffect(() => {
                const lantern = this.createLantern(profile.lightPalette[i % profile.lightPalette.length]);
                this.geometries.push(lantern);
            }, i * (this.isMobile ? 210 : 155));
        }
    }

    createLantern(color) {
        const group = new THREE.Group();

        const shell = new THREE.Mesh(
            new THREE.SphereGeometry(this.isMobile ? 0.5 : 0.64, this.isMobile ? 10 : 14, this.isMobile ? 10 : 14),
            new THREE.MeshPhongMaterial({
                color,
                emissive: color,
                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 0.9
            })
        );
        shell.scale.y = 1.2;
        group.add(shell);

        const halo = new THREE.Mesh(
            new THREE.SphereGeometry(this.isMobile ? 0.85 : 1, this.isMobile ? 10 : 14, this.isMobile ? 10 : 14),
            new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0.2,
                side: THREE.BackSide
            })
        );
        group.add(halo);

        group.position.set(
            (Math.random() - 0.5) * 30,
            -16 - Math.random() * 10,
            (Math.random() - 0.5) * 18
        );

        group.userData.kind = 'lantern';
        group.userData.life = 14 + Math.random() * 8;
        group.userData.floatSpeed = (this.isMobile ? 0.04 : 0.055) + Math.random() * 0.025;
        group.userData.wobbleSpeed = 0.6 + Math.random() * 1.2;
        group.userData.wobbleAmount = 0.25 + Math.random() * 0.22;
        group.userData.baseX = group.position.x;
        group.userData.baseRotationZ = (Math.random() - 0.5) * 0.22;
        group.rotation.z = group.userData.baseRotationZ;

        this.scene.add(group);
        return group;
    }

    createGlowSphere(color, size) {
        return new THREE.Mesh(
            new THREE.SphereGeometry(size, this.isMobile ? 8 : 12, this.isMobile ? 8 : 12),
            new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0.9
            })
        );
    }

    createParticle(x, y, z, color, size = 0.1) {
        const geometry = new THREE.SphereGeometry(size, this.isMobile ? 8 : 12, this.isMobile ? 8 : 12);
        const material = new THREE.MeshPhongMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.85,
            shininess: 120,
            transparent: true,
            opacity: 1
        });

        const particle = new THREE.Mesh(geometry, material);
        particle.position.set(x, y, z);
        particle.userData.velocity = {
            x: (Math.random() - 0.5) * 0.12,
            y: (Math.random() - 0.5) * 0.12,
            z: (Math.random() - 0.5) * 0.12
        };
        particle.userData.life = 1;
        particle.userData.pulseSpeed = 2.4 + Math.random() * 4.6;
        particle.userData.originalSize = size;
        particle.userData.drag = 0.985;
        particle.userData.gravity = 0;
        particle.userData.swirl = 0;
        particle.userData.trailEvery = 0;
        particle.userData.lastTrailAt = performance.now();

        this.scene.add(particle);
        return particle;
    }

    emitBurst(origin, palette, count, speedRange, options = {}) {
        const lifeRange = options.life || [0.9, 1.8];
        const sizeRange = options.size || [0.05, 0.12];
        const spreadY = options.spreadY || 1;
        const drag = options.drag || 0.98;
        const explosion = Boolean(options.explosion);
        const trails = Boolean(options.trails);

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const elevation = (Math.random() - 0.5) * Math.PI * spreadY;
            const speed = speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]);
            const size = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
            const color = palette[Math.floor(Math.random() * palette.length)];
            const particle = this.createParticle(origin.x, origin.y, origin.z, color, size);

            particle.userData.velocity = {
                x: Math.cos(angle) * Math.cos(elevation) * speed,
                y: Math.sin(elevation) * speed,
                z: Math.sin(angle) * Math.cos(elevation) * speed
            };
            particle.userData.life = lifeRange[0] + Math.random() * (lifeRange[1] - lifeRange[0]);
            particle.userData.drag = drag;
            particle.userData.gravity = options.gravity || 0;
            particle.userData.swirl = options.swirl || 0;
            particle.userData.isExplosion = explosion;
            particle.userData.trailEvery = trails ? (this.isMobile ? 0.16 : 0.09) : 0;
            this.particles.push(particle);
        }
    }

    createShockwave(color, radius = 2.5) {
        const ringGeometry = new THREE.RingGeometry(radius, radius + 0.23, 72);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.84,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        ring.userData.kind = 'shockwave';
        ring.userData.life = 1.15;
        ring.userData.expand = this.isMobile ? 1.7 : 2.2;
        this.scene.add(ring);
        this.shockwaves.push(ring);
    }

    createFlashPulse(colorHex, opacity) {
        const pulse = document.createElement('div');
        pulse.style.position = 'fixed';
        pulse.style.inset = '0';
        pulse.style.pointerEvents = 'none';
        pulse.style.zIndex = '997';
        pulse.style.opacity = String(opacity);
        pulse.style.background = `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.6) 0%, transparent 36%), radial-gradient(circle at 50% 50%, #${new THREE.Color(colorHex).getHexString()} 0%, transparent 62%)`;
        pulse.style.mixBlendMode = 'screen';
        pulse.style.transition = 'opacity 380ms ease-out, transform 420ms ease-out';
        pulse.style.transform = 'scale(0.85)';
        document.body.appendChild(pulse);

        requestAnimationFrame(() => {
            pulse.style.opacity = '0';
            pulse.style.transform = 'scale(1.15)';
        });

        setTimeout(() => {
            pulse.remove();
        }, 460);
    }

    createTrail(parent) {
        const trailGeometry = new THREE.SphereGeometry(Math.max(parent.userData.originalSize * 0.55, 0.02), 4, 4);
        const trailMaterial = new THREE.MeshBasicMaterial({
            color: parent.material.color,
            transparent: true,
            opacity: 0.45
        });
        const trail = new THREE.Mesh(trailGeometry, trailMaterial);
        trail.position.copy(parent.position);
        trail.userData.parent = parent;
        trail.userData.life = 0.42;
        this.scene.add(trail);
        this.trails.push(trail);
    }

    clearDynamics() {
        this.cancelEffectTimers();
        this.effectGeneration++;

        this.particles.forEach((item) => this.removeObject(item));
        this.trails.forEach((item) => this.removeObject(item));
        this.geometries.forEach((item) => this.removeObject(item));
        this.shockwaves.forEach((item) => this.removeObject(item));

        this.particles = [];
        this.trails = [];
        this.geometries = [];
        this.shockwaves = [];
    }

    scheduleEffect(callback, delay) {
        const generation = this.effectGeneration;
        const timerId = setTimeout(() => {
            this.effectTimers.delete(timerId);
            if (generation !== this.effectGeneration) {
                return;
            }
            callback();
        }, delay);
        this.effectTimers.add(timerId);
        return timerId;
    }

    cancelEffectTimers() {
        this.effectTimers.forEach((timerId) => clearTimeout(timerId));
        this.effectTimers.clear();
    }

    removeObject(object) {
        if (!object) {
            return;
        }

        this.scene.remove(object);

        if (typeof object.traverse === 'function') {
            object.traverse((child) => {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (Array.isArray(child.material)) {
                    child.material.forEach((mat) => mat.dispose());
                } else if (child.material) {
                    child.material.dispose();
                }
            });
            return;
        }

        if (object.geometry) {
            object.geometry.dispose();
        }
        if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
        } else if (object.material) {
            object.material.dispose();
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.isMobile = this.checkIsMobile();
            const pixelRatio = this.isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2);
            this.renderer.setPixelRatio(pixelRatio);
            this.maxParticles = this.isMobile ? 220 : 460;
        });

        document.getElementById('fullscreen-btn').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        document.getElementById('effects-btn').addEventListener('click', () => {
            this.effectsEnabled = !this.effectsEnabled;
            const btn = document.getElementById('effects-btn');
            btn.style.opacity = this.effectsEnabled ? '1' : '0.5';
            btn.style.borderColor = this.effectsEnabled ? 'rgba(0, 255, 255, 0.4)' : 'rgba(255, 60, 60, 0.55)';
        });

        document.querySelectorAll('.mobile-btn').forEach((btn) => {
            btn.addEventListener('touchstart', (event) => {
                event.preventDefault();
                btn.dataset.touchHandled = 'true';
                this.triggerEffect(btn.getAttribute('data-action'));
            }, { passive: false });

            btn.addEventListener('click', (event) => {
                if (btn.dataset.touchHandled === 'true') {
                    event.preventDefault();
                    btn.dataset.touchHandled = 'false';
                    return;
                }
                this.triggerEffect(btn.getAttribute('data-action'));
            });
        });
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            }
            return;
        }

        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const now = performance.now();
        const time = now * 0.001;

        this.currentClearColor.lerp(this.targetClearColor, 0.04);
        this.renderer.setClearColor(this.currentClearColor, 1);
        this.scene.fog.color.lerp(this.targetFogColor, 0.04);
        this.scene.fog.density += (this.targetFogDensity - this.scene.fog.density) * 0.04;

        this.currentStarColor.lerp(this.targetStarColor, 0.05);
        this.starMaterial.color.copy(this.currentStarColor);
        this.farStarMaterial.color.copy(this.currentStarColor);

        this.currentStarSpinSpeed += (this.targetStarSpinSpeed - this.currentStarSpinSpeed) * 0.05;
        this.currentStarPulse += (this.targetStarPulse - this.currentStarPulse) * 0.04;

        this.camera.position.x += (this.cameraTarget.x - this.camera.position.x) * 0.08;
        this.camera.position.y += (this.cameraTarget.y - this.camera.position.y) * 0.08;
        this.camera.position.z += (this.cameraTarget.z - this.camera.position.z) * 0.08;

        if (this.cameraShake > 0.001) {
            const shake = this.cameraShake * (this.isMobile ? 0.22 : 0.34);
            this.camera.position.x += (Math.random() - 0.5) * shake;
            this.camera.position.y += (Math.random() - 0.5) * shake;
            this.cameraShake *= 0.9;
        } else {
            this.cameraShake = 0;
        }

        if (this.starField) {
            this.starField.rotation.y += this.currentStarSpinSpeed;
            this.starField.rotation.x += this.currentStarSpinSpeed * 0.36;
            const pulse = 1 + Math.sin(time * 1.9) * 0.06 * this.currentStarPulse;
            this.starField.scale.setScalar(pulse);
        }

        if (this.farStarField) {
            this.farStarField.rotation.y -= this.currentStarSpinSpeed * 0.36;
            this.farStarField.rotation.z += this.currentStarSpinSpeed * 0.24;
            const pulse = 1 + Math.cos(time * 1.2) * 0.04 * this.currentStarPulse;
            this.farStarField.scale.setScalar(pulse);
        }

        this.pointLights.forEach((light) => {
            light.position.x = Math.sin(time * light.userData.speed + light.userData.offset) * light.userData.amplitude;
            light.position.y = Math.cos(time * light.userData.speed * 0.65 + light.userData.offset) * light.userData.amplitude * 0.5;
            light.position.z = Math.sin(time * light.userData.speed * 0.45 + light.userData.offset) * 6;

            light.color.lerp(light.userData.targetColor, 0.06);
            light.intensity += (light.userData.targetIntensity - light.intensity) * 0.06;
        });

        this.coreColor.lerp(this.targetCoreColor, 0.06);
        this.targetCorePulse = this.modeProfiles[this.currentState].corePulse;
        this.corePulse += (this.targetCorePulse - this.corePulse) * 0.06;

        const coreScale = 1 + Math.sin(time * (1.8 + this.corePulse * 0.2)) * 0.12 * this.corePulse;
        this.coreGroup.scale.setScalar(coreScale);
        this.coreInner.material.emissive.copy(this.coreColor);
        this.coreShell.material.color.copy(this.coreColor);
        this.coreRing.material.color.copy(this.coreColor);
        this.coreRing.rotation.y += 0.01 + this.corePulse * 0.003;
        this.coreRing.rotation.z += 0.008;

        if (this.particles.length > this.maxParticles) {
            const over = this.particles.length - this.maxParticles;
            for (let i = 0; i < over; i++) {
                const old = this.particles.shift();
                if (old) {
                    this.removeObject(old);
                }
            }
        }

        this.particles = this.particles.filter((particle) => {
            particle.position.x += particle.userData.velocity.x;
            particle.position.y += particle.userData.velocity.y;
            particle.position.z += particle.userData.velocity.z;

            particle.userData.velocity.x *= particle.userData.drag;
            particle.userData.velocity.y *= particle.userData.drag;
            particle.userData.velocity.z *= particle.userData.drag;
            particle.userData.velocity.y -= particle.userData.gravity;

            if (particle.userData.swirl) {
                const swirl = particle.userData.swirl;
                const px = particle.position.x;
                const pz = particle.position.z;
                particle.position.x = px * Math.cos(swirl) - pz * Math.sin(swirl);
                particle.position.z = px * Math.sin(swirl) + pz * Math.cos(swirl);
            }

            const pulse = Math.sin(time * particle.userData.pulseSpeed) * 0.5 + 0.5;
            particle.scale.setScalar(1 + pulse * 0.38);
            particle.userData.life -= this.isMobile ? 0.008 : 0.0056;
            particle.material.opacity = Math.max(0, Math.min(1, particle.userData.life));
            particle.rotation.x += 0.03;
            particle.rotation.y += 0.04;

            if (particle.userData.trailEvery > 0 && now - particle.userData.lastTrailAt > particle.userData.trailEvery * 1000) {
                this.createTrail(particle);
                particle.userData.lastTrailAt = now;
            }

            if (particle.userData.life <= 0) {
                this.removeObject(particle);
                return false;
            }
            return true;
        });

        this.trails = this.trails.filter((trail) => {
            if (trail.userData.parent) {
                trail.position.lerp(trail.userData.parent.position, 0.28);
            }
            trail.userData.life -= this.isMobile ? 0.044 : 0.036;
            trail.material.opacity = Math.max(trail.userData.life * 0.5, 0);
            trail.scale.setScalar(Math.max(trail.userData.life, 0.01));

            if (trail.userData.life <= 0) {
                this.removeObject(trail);
                return false;
            }
            return true;
        });

        this.shockwaves = this.shockwaves.filter((ring) => {
            ring.userData.life -= this.isMobile ? 0.04 : 0.03;
            ring.scale.setScalar(1 + (1 - ring.userData.life) * ring.userData.expand);
            ring.material.opacity = Math.max(ring.userData.life * 0.9, 0);
            if (ring.userData.life <= 0) {
                this.removeObject(ring);
                return false;
            }
            return true;
        });

        this.geometries = this.geometries.filter((item) => {
            const kind = item.userData.kind;
            item.userData.life -= this.isMobile ? 0.0068 : 0.0048;

            if (kind === 'beam') {
                const pulse = Math.sin(time * item.userData.pulseSpeed) * 0.35 + 1;
                item.scale.set(1, pulse, 1);
                item.material.opacity = 0.36 + Math.sin(time * 4.2) * 0.15;
            } else if (kind === 'beamRing') {
                item.rotation.z += item.userData.speed * 0.02;
                item.position.y += 0.08;
                if (item.position.y > 8) {
                    item.position.y = -8;
                }
            } else if (kind === 'helix') {
                item.rotation.y += item.userData.spin * 0.02;
                item.position.y = Math.sin(time * item.userData.wobble) * 0.35;
            } else if (kind === 'matrixShape') {
                item.rotation.x += item.userData.rotation.x;
                item.rotation.y += item.userData.rotation.y;
                item.rotation.z += item.userData.rotation.z;
                const pulse = 1 + Math.sin(time * item.userData.pulseSpeed) * 0.14;
                item.scale.setScalar(item.userData.baseScale * pulse);
            } else if (kind === 'shard') {
                item.position.x += item.userData.velocity.x;
                item.position.y += item.userData.velocity.y;
                item.position.z += item.userData.velocity.z;
                item.rotation.x += item.userData.rotation.x;
                item.rotation.y += item.userData.rotation.y;
                item.rotation.z += item.userData.rotation.z;
                item.material.opacity = Math.max(item.userData.life * 0.3, 0);
            } else if (kind === 'portalGroup') {
                item.rotation.z += item.userData.spin;
                item.children.forEach((child) => {
                    child.rotation.x += child.userData.spin;
                    child.rotation.y -= child.userData.spin * 0.9;
                    child.material.opacity = 0.48 + Math.sin(time * 1.8 + child.userData.spin * 18) * 0.2;
                });
            } else if (kind === 'voxel') {
                item.position.x += item.userData.velocity.x;
                item.position.y += item.userData.velocity.y;
                item.position.z += item.userData.velocity.z;
                item.rotation.x += item.userData.rotation.x;
                item.rotation.y += item.userData.rotation.y;
                item.rotation.z += item.userData.rotation.z;
                item.material.opacity = Math.max(item.userData.life * 0.25, 0);
            } else if (kind === 'petalGroup') {
                item.rotation.y += 0.006;
                item.children.forEach((child) => {
                    if (child.userData.kind !== 'petal') {
                        return;
                    }
                    const angle = time * child.userData.orbitSpeed + child.userData.orbitOffset;
                    child.position.x = Math.cos(angle) * child.userData.orbitRadius;
                    child.position.z = Math.sin(angle) * child.userData.orbitRadius;
                    child.position.y = Math.sin(angle * 1.7) * 0.8 + child.userData.vertical;
                    child.scale.setScalar(1 + Math.sin(time * 2.6 + child.userData.orbitOffset) * 0.22);
                });
            } else if (kind === 'lantern') {
                item.position.y += item.userData.floatSpeed;
                item.position.x = item.userData.baseX + Math.sin(time * item.userData.wobbleSpeed) * item.userData.wobbleAmount;
                item.rotation.z = item.userData.baseRotationZ + Math.sin(time * 0.8 + item.userData.baseX) * 0.12;
                item.children.forEach((child) => {
                    if (child.material && typeof child.material.opacity === 'number') {
                        child.material.opacity = Math.max(0.15, Math.min(1, item.userData.life * 0.08 + 0.2));
                    }
                });
            } else if (kind === 'orbiter') {
                const angle = time * item.userData.orbitSpeed + item.userData.orbitOffset;
                item.position.x = Math.cos(angle) * item.userData.orbitRadius;
                item.position.z = Math.sin(angle) * item.userData.orbitRadius;
                item.position.y = Math.sin(time * 1.4 + item.userData.floatOffset) * 1.2;
            }

            if (item.position && item.position.y > 40) {
                this.removeObject(item);
                return false;
            }

            if (item.userData.life <= 0) {
                this.removeObject(item);
                return false;
            }

            return true;
        });

        this.renderer.render(this.scene, this.camera);
    }
}

const app = new MagicFingers();
