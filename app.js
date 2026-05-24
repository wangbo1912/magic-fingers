class MagicFingers {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = [];
        this.stars = [];
        this.geometries = [];
        this.trails = [];
        this.currentState = 'idle';
        this.isInitialized = false;
        this.isMobile = this.checkIsMobile();
        this.maxParticles = this.isMobile ? 150 : 300;
        this.maxStars = this.isMobile ? 500 : 1000;
        
        this.cameraTargetZ = 25;
        this.cameraTargetY = 0;
        this.pointLights = [];
        this.effectsEnabled = true;
        
        this.init();
    }

    checkIsMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    }

    init() {
        this.setupThreeJS();
        this.createStarfield();
        this.setupLights();
        this.setupMediaPipe();
        this.setupEventListeners();
        this.animate();
    }

    setupThreeJS() {
        const container = document.getElementById('canvas-container');
        
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x0a0a0f, 0.015);
        
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = this.cameraTargetZ;
        this.camera.position.y = this.cameraTargetY;

        this.renderer = new THREE.WebGLRenderer({ 
            antialias: !this.isMobile, 
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        const pixelRatio = this.isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2);
        this.renderer.setPixelRatio(pixelRatio);
        container.appendChild(this.renderer.domElement);

        this.isInitialized = true;
    }

    createStarfield() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = this.maxStars;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        const starColors = [
            new THREE.Color(0x00ffff),
            new THREE.Color(0xff00ff),
            new THREE.Color(0xffffff),
            new THREE.Color(0x66ffff),
            new THREE.Color(0xff66ff)
        ];

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 200;
            positions[i3 + 1] = (Math.random() - 0.5) * 200;
            positions[i3 + 2] = (Math.random() - 0.5) * 200 - 50;
            
            const color = starColors[Math.floor(Math.random() * starColors.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            sizes[i] = Math.random() * 2 + 0.5;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const starMaterial = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        const starField = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(starField);
        this.starField = starField;
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0x111122, 0.5);
        this.scene.add(ambientLight);

        const colors = [0x00ffff, 0xff00ff, 0xffff00, 0xff0066];
        for (let i = 0; i < 4; i++) {
            const pointLight = new THREE.PointLight(colors[i], 2, 50);
            pointLight.position.set(
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 10
            );
            pointLight.userData = {
                speed: 0.5 + Math.random() * 0.5,
                amplitude: 5 + Math.random() * 5,
                offset: Math.random() * Math.PI * 2
            };
            this.scene.add(pointLight);
            this.pointLights.push(pointLight);
        }
    }

    setupMediaPipe() {
        const videoElement = document.getElementById('webcam');
        
        const hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: this.isMobile ? 0 : 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
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
            document.getElementById('loading').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loading').style.display = 'none';
            }, 800);
            document.getElementById('status').innerHTML = '🖐️ 伸出你的手开始魔法！';
            document.getElementById('status').style.opacity = '1';
        }, 2500);
    }

    onResults(results) {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            const fingerCount = this.countFingers(landmarks);
            this.handleGesture(fingerCount);
        }
    }

    countFingers(landmarks) {
        const fingerTips = [8, 12, 16, 20];
        const fingerPips = [6, 10, 14, 18];
        let count = 0;

        for (let i = 0; i < 4; i++) {
            if (landmarks[fingerTips[i]].y < landmarks[fingerPips[i]].y) {
                count++;
            }
        }

        if (landmarks[4].x < landmarks[3].x) {
            count++;
        }

        if (this.isFist(landmarks)) {
            return 0;
        }

        return count;
    }

    isFist(landmarks) {
        const fingerTips = [8, 12, 16, 20];
        const palmBase = landmarks[0];
        let allFolded = true;

        for (let tip of fingerTips) {
            const distance = Math.sqrt(
                Math.pow(landmarks[tip].x - palmBase.x, 2) +
                Math.pow(landmarks[tip].y - palmBase.y, 2)
            );
            if (distance > 0.15) {
                allFolded = false;
                break;
            }
        }

        return allFolded;
    }

    handleGesture(fingerCount) {
        switch(fingerCount) {
            case 0:
                this.resetScene();
                break;
            case 1:
                this.showDigit(1);
                break;
            case 2:
                this.showDigit(2);
                break;
            case 3:
                this.showDigit(3);
                break;
            case 4:
                this.showGeometry();
                break;
            case 5:
                this.showConfession();
                break;
        }
    }

    triggerEffect(action) {
        switch(action) {
            case '0':
                this.resetScene();
                break;
            case '1':
                this.showDigit(1);
                break;
            case '2':
                this.showDigit(2);
                break;
            case '3':
                this.showDigit(3);
                break;
            case '4':
                this.showGeometry();
                break;
            case '5':
                this.showConfession();
                break;
        }
    }

    showDigit(digit) {
        if (this.currentState === `digit-${digit}`) return;
        
        this.clearAll();
        this.currentState = `digit-${digit}`;
        document.getElementById('status').classList.add('active');
        this.createDigitParticles(digit);
        this.createExplosion();
        this.cameraTargetZ = 20;
    }

    createDigitParticles(digit) {
        const digitPaths = {
            1: [
                [-1, 3], [0, 3], [1, 3],
                [0, 2], [0, 1], [0, 0], [0, -1], [0, -2], [0, -3]
            ],
            2: [
                [-2, 2], [-1, 3], [0, 3], [1, 3], [2, 2],
                [2, 1], [1, 0], [0, -1], [-1, -2],
                [-2, -3], [-1, -3], [0, -3], [1, -3], [2, -3]
            ],
            3: [
                [-2, 2], [-1, 3], [0, 3], [1, 3], [2, 2],
                [1, 1], [0, 0], [1, -1],
                [-2, -2], [-1, -3], [0, -3], [1, -3], [2, -2]
            ]
        };

        const path = digitPaths[digit];
        const colors = [
            0x00ffff, 0xff00ff, 0xffff00, 0x00ff00, 0xff0066,
            0x6600ff, 0xff6600, 0x00ff66, 0xff0099, 0x99ff00
        ];
        const particleCount = this.isMobile ? 8 : 12;
        const extraCount = this.isMobile ? 50 : 100;

        path.forEach((pos, index) => {
            setTimeout(() => {
                for (let i = 0; i < particleCount; i++) {
                    const particle = this.createParticle(
                        pos[0] * 1.5 + (Math.random() - 0.5) * 0.5,
                        pos[1] * 1.5 + (Math.random() - 0.5) * 0.5,
                        (Math.random() - 0.5) * 2,
                        colors[index % colors.length],
                        0.12
                    );
                    this.particles.push(particle);
                    this.createTrail(particle);
                }
            }, index * 20);
        });

        for (let i = 0; i < extraCount; i++) {
            setTimeout(() => {
                const particle = this.createParticle(
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 15,
                    (Math.random() - 0.5) * 10,
                    colors[Math.floor(Math.random() * colors.length)],
                    0.08
                );
                this.particles.push(particle);
            }, i * 15);
        }
    }

    showGeometry() {
        if (this.currentState === 'geometry') return;
        
        this.clearAll();
        this.currentState = 'geometry';
        document.getElementById('status').classList.add('active');
        document.getElementById('status').innerHTML = '✊ 4 几何世界';
        
        this.createGeometricShapes();
        this.createExplosion();
        this.cameraTargetZ = 30;
    }

    createGeometricShapes() {
        const shapes = [
            { type: 'torus', color: 0x00ffff, position: [-8, 0, -5], scale: 2 },
            { type: 'icosahedron', color: 0xff00ff, position: [0, 0, 0], scale: 3 },
            { type: 'torusKnot', color: 0xffff00, position: [8, 0, -5], scale: 2.5 }
        ];

        shapes.forEach((shape, index) => {
            setTimeout(() => {
                let geometry;
                const wireframeMaterial = new THREE.MeshBasicMaterial({
                    color: shape.color,
                    wireframe: true,
                    transparent: true,
                    opacity: 0.8
                });

                switch(shape.type) {
                    case 'torus':
                        geometry = new THREE.TorusGeometry(shape.scale, shape.scale * 0.4, 16, 50);
                        break;
                    case 'icosahedron':
                        geometry = new THREE.IcosahedronGeometry(shape.scale, 1);
                        break;
                    case 'torusKnot':
                        geometry = new THREE.TorusKnotGeometry(shape.scale, shape.scale * 0.3, 100, 16);
                        break;
                }

                const mesh = new THREE.Mesh(geometry, wireframeMaterial);
                mesh.position.set(...shape.position);
                mesh.userData = {
                    rotationSpeed: {
                        x: (Math.random() - 0.5) * 0.02,
                        y: (Math.random() - 0.5) * 0.02,
                        z: (Math.random() - 0.5) * 0.02
                    },
                    pulseSpeed: 1 + Math.random(),
                    originalScale: shape.scale
                };

                this.scene.add(mesh);
                this.geometries.push(mesh);

                for (let i = 0; i < (this.isMobile ? 30 : 50); i++) {
                    const particle = this.createParticle(
                        shape.position[0] + (Math.random() - 0.5) * 10,
                        shape.position[1] + (Math.random() - 0.5) * 10,
                        shape.position[2] + (Math.random() - 0.5) * 5,
                        shape.color,
                        0.06
                    );
                    this.particles.push(particle);
                }
            }, index * 300);
        });
    }

    showConfession() {
        if (this.currentState === 'confession') return;
        
        this.clearAll();
        this.currentState = 'confession';
        document.getElementById('status').classList.add('active');
        document.getElementById('status').innerHTML = '🖐️ U';
        
        this.createUParticles();
        this.createConfessionExplosion();
        this.createBalloons();
        this.createFlowers();
        this.cameraTargetZ = 35;
    }

    createUParticles() {
        const uPath = [
            [-3, 3], [-2, 3], [-1, 3],
            [-3, 2], [-3, 1], [-3, 0], [-3, -1], [-3, -2],
            [-2, -3], [-1, -3], [0, -3], [1, -3], [2, -3],
            [3, -2], [3, -1], [3, 0], [3, 1], [3, 2],
            [1, 3], [2, 3], [3, 3]
        ];

        const colors = [0xff0066, 0xff66b2, 0xff00ff, 0xff33cc, 0xff3399, 0xff66ff];
        const particleCount = this.isMobile ? 10 : 15;
        const extraCount = this.isMobile ? 80 : 150;

        uPath.forEach((pos, index) => {
            setTimeout(() => {
                for (let i = 0; i < particleCount; i++) {
                    const particle = this.createParticle(
                        pos[0] * 1.2 + (Math.random() - 0.5) * 0.6,
                        pos[1] * 1.2 + (Math.random() - 0.5) * 0.6,
                        (Math.random() - 0.5) * 3,
                        colors[index % colors.length],
                        0.15
                    );
                    particle.userData.life = 2;
                    this.particles.push(particle);
                    this.createTrail(particle);
                }
            }, index * 15);
        });

        for (let i = 0; i < extraCount; i++) {
            setTimeout(() => {
                const particle = this.createParticle(
                    (Math.random() - 0.5) * 25,
                    (Math.random() - 0.5) * 15,
                    (Math.random() - 0.5) * 10,
                    colors[Math.floor(Math.random() * colors.length)],
                    0.1
                );
                particle.userData.life = 1.5;
                this.particles.push(particle);
            }, i * 10);
        }
    }

    createBalloons() {
        const balloonColors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181, 0xaa96da];
        
        for (let i = 0; i < (this.isMobile ? 10 : 18); i++) {
            setTimeout(() => {
                const balloon = this.createBalloon(balloonColors[i % balloonColors.length]);
                this.geometries.push(balloon);
            }, i * (this.isMobile ? 250 : 180));
        }
    }

    createBalloon(color) {
        const group = new THREE.Group();
        
        const scale = this.isMobile ? 0.8 : 1;
        const geometry = new THREE.SphereGeometry(0.8 * scale, this.isMobile ? 12 : 20, this.isMobile ? 12 : 20);
        geometry.scale(1, 1.2, 1);
        
        const material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.4,
            shininess: 150,
            transparent: true,
            opacity: 0.9
        });
        const balloon = new THREE.Mesh(geometry, material);
        group.add(balloon);

        const glowGeometry = new THREE.SphereGeometry(1.2 * scale, this.isMobile ? 12 : 20, this.isMobile ? 12 : 20);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        group.add(glow);

        const stringGeometry = new THREE.CylinderGeometry(0.015, 0.015, 2.5 * scale);
        const stringMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
        const string = new THREE.Mesh(stringGeometry, stringMaterial);
        string.position.y = -2 * scale;
        group.add(string);

        group.position.set(
            (Math.random() - 0.5) * 30,
            -20,
            (Math.random() - 0.5) * 15
        );
        group.rotation.z = (Math.random() - 0.5) * 0.3;
        group.userData.floatSpeed = (this.isMobile ? 0.035 : 0.045) + Math.random() * 0.02;
        group.userData.wobbleSpeed = Math.random() * 3;
        group.userData.wobbleAmount = Math.random() * 0.15;

        this.scene.add(group);
        return group;
    }

    createFlowers() {
        for (let i = 0; i < (this.isMobile ? 8 : 15); i++) {
            setTimeout(() => {
                const flower = this.createFlower();
                this.geometries.push(flower);
            }, i * (this.isMobile ? 350 : 280) + 1200);
        }
    }

    createFlower() {
        const group = new THREE.Group();
        
        const colors = [0xff69b4, 0xff1493, 0xffb6c1, 0xffc0cb, 0xff6347, 0xff7f50];
        const scale = this.isMobile ? 0.8 : 1;
        
        for (let i = 0; i < 8; i++) {
            const petalGeometry = new THREE.SphereGeometry(0.35 * scale, this.isMobile ? 8 : 12, this.isMobile ? 8 : 12);
            petalGeometry.scale(1, 0.4, 1);
            const petalMaterial = new THREE.MeshPhongMaterial({
                color: colors[Math.floor(Math.random() * colors.length)],
                emissive: 0xff4444,
                emissiveIntensity: 0.3,
                transparent: true,
                opacity: 0.9
            });
            const petal = new THREE.Mesh(petalGeometry, petalMaterial);
            
            const angle = (i / 8) * Math.PI * 2;
            petal.position.x = Math.cos(angle) * 0.5 * scale;
            petal.position.y = Math.sin(angle) * 0.5 * scale;
            petal.rotation.z = angle;
            
            group.add(petal);
        }

        const centerGeometry = new THREE.SphereGeometry(0.3 * scale, this.isMobile ? 8 : 12, this.isMobile ? 8 : 12);
        const centerMaterial = new THREE.MeshPhongMaterial({
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.6
        });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        group.add(center);

        const glowGeometry = new THREE.SphereGeometry(0.6 * scale, this.isMobile ? 8 : 12, this.isMobile ? 8 : 12);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        group.add(glow);

        group.position.set(
            (Math.random() - 0.5) * 30,
            -25,
            (Math.random() - 0.5) * 15
        );
        group.userData.floatSpeed = (this.isMobile ? 0.025 : 0.035) + Math.random() * 0.02;
        group.userData.rotationSpeed = (Math.random() - 0.5) * 0.03;

        this.scene.add(group);
        return group;
    }

    createParticle(x, y, z, color, size = 0.1) {
        const geometry = new THREE.SphereGeometry(size, this.isMobile ? 8 : 12, this.isMobile ? 8 : 12);
        
        const material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 1
        });
        
        const particle = new THREE.Mesh(geometry, material);
        
        particle.position.set(x, y, z);
        particle.userData.velocity = {
            x: (Math.random() - 0.5) * 0.08,
            y: (Math.random() - 0.5) * 0.08,
            z: (Math.random() - 0.5) * 0.08
        };
        particle.userData.life = 1;
        particle.userData.pulseSpeed = Math.random() * 4 + 2;
        particle.userData.originalSize = size;
        
        this.scene.add(particle);
        return particle;
    }

    createTrail(particle) {
        const trailGeometry = new THREE.SphereGeometry(particle.userData.originalSize * 0.5, 4, 4);
        const trailMaterial = new THREE.MeshBasicMaterial({
            color: particle.material.color,
            transparent: true,
            opacity: 0.5
        });
        
        const trail = new THREE.Mesh(trailGeometry, trailMaterial);
        trail.position.copy(particle.position);
        trail.userData.parentParticle = particle;
        trail.userData.life = 0.5;
        
        this.scene.add(trail);
        this.trails.push(trail);
    }

    createExplosion() {
        const explosionColors = [0x00ffff, 0xff00ff, 0xffff00, 0xff0066, 0x00ff66];
        
        for (let i = 0; i < (this.isMobile ? 80 : 150); i++) {
            setTimeout(() => {
                const angle = Math.random() * Math.PI * 2;
                const elevation = (Math.random() - 0.5) * Math.PI;
                const speed = 0.3 + Math.random() * 0.3;
                
                const particle = this.createParticle(
                    0, 0, 0,
                    explosionColors[Math.floor(Math.random() * explosionColors.length)],
                    0.05 + Math.random() * 0.05
                );
                
                particle.userData.velocity = {
                    x: Math.cos(angle) * Math.cos(elevation) * speed,
                    y: Math.sin(elevation) * speed,
                    z: Math.sin(angle) * Math.cos(elevation) * speed
                };
                particle.userData.life = 1.5;
                particle.userData.isExplosion = true;
                
                this.particles.push(particle);
            }, i * 5);
        }
    }

    createConfessionExplosion() {
        const colors = [0xff0066, 0xff00ff, 0xff3399, 0xff66ff, 0xff99ff];
        
        for (let i = 0; i < (this.isMobile ? 200 : 400); i++) {
            setTimeout(() => {
                const angle = Math.random() * Math.PI * 2;
                const elevation = (Math.random() - 0.5) * Math.PI;
                const speed = 0.5 + Math.random() * 0.5;
                
                const particle = this.createParticle(
                    0, 0, 0,
                    colors[Math.floor(Math.random() * colors.length)],
                    0.08 + Math.random() * 0.08
                );
                
                particle.userData.velocity = {
                    x: Math.cos(angle) * Math.cos(elevation) * speed,
                    y: Math.sin(elevation) * speed,
                    z: Math.sin(angle) * Math.cos(elevation) * speed
                };
                particle.userData.life = 2;
                particle.userData.isExplosion = true;
                
                this.particles.push(particle);
                this.createTrail(particle);
            }, i * 3);
        }
    }

    clearAll() {
        this.particles.forEach(p => this.scene.remove(p));
        this.geometries.forEach(g => this.scene.remove(g));
        this.trails.forEach(t => this.scene.remove(t));
        this.particles = [];
        this.geometries = [];
        this.trails = [];
    }

    resetScene() {
        this.clearAll();
        this.currentState = 'idle';
        document.getElementById('status').innerHTML = '🖐️ 伸出你的手开始魔法！';
        document.getElementById('status').classList.remove('active');
        document.getElementById('status').style.opacity = '1';
        this.cameraTargetZ = 25;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.isMobile = this.checkIsMobile();
        });

        document.getElementById('fullscreen-btn').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        document.getElementById('effects-btn').addEventListener('click', () => {
            this.effectsEnabled = !this.effectsEnabled;
            const btn = document.getElementById('effects-btn');
            btn.style.opacity = this.effectsEnabled ? '1' : '0.5';
            btn.style.borderColor = this.effectsEnabled ? 'rgba(0, 255, 255, 0.4)' : 'rgba(255, 0, 0, 0.4)';
        });

        const mobileBtns = document.querySelectorAll('.mobile-btn');
        mobileBtns.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const action = btn.getAttribute('data-action');
                this.triggerEffect(action);
            });
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                this.triggerEffect(action);
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
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.001;

        this.camera.position.z += (this.cameraTargetZ - this.camera.position.z) * 0.05;
        this.camera.position.y += (this.cameraTargetY - this.camera.position.y) * 0.05;

        if (this.starField) {
            this.starField.rotation.y += 0.0002;
            this.starField.rotation.x += 0.0001;
        }

        this.pointLights.forEach((light, index) => {
            light.position.x = Math.sin(time * light.userData.speed + light.userData.offset) * light.userData.amplitude;
            light.position.y = Math.cos(time * light.userData.speed * 0.7 + light.userData.offset) * light.userData.amplitude * 0.5;
            light.position.z = Math.sin(time * light.userData.speed * 0.5) * 5;
        });

        if (this.particles.length > this.maxParticles) {
            const excess = this.particles.length - this.maxParticles;
            for (let i = 0; i < excess; i++) {
                const p = this.particles.shift();
                if (p) this.scene.remove(p);
            }
        }

        this.particles = this.particles.filter(particle => {
            particle.position.x += particle.userData.velocity.x;
            particle.position.y += particle.userData.velocity.y;
            particle.position.z += particle.userData.velocity.z;
            
            if (particle.userData.isExplosion) {
                particle.userData.velocity.x *= 0.98;
                particle.userData.velocity.y *= 0.98;
                particle.userData.velocity.z *= 0.98;
            }
            
            const pulse = Math.sin(time * particle.userData.pulseSpeed) * 0.5 + 0.5;
            const scale = 1 + pulse * 0.4;
            particle.scale.setScalar(scale);
            
            particle.userData.life -= this.isMobile ? 0.006 : 0.004;
            particle.material.opacity = Math.min(particle.userData.life, 1);
            
            particle.rotation.x += 0.03;
            particle.rotation.y += 0.04;

            if (particle.userData.life <= 0) {
                this.scene.remove(particle);
                return false;
            }
            return true;
        });

        this.trails = this.trails.filter(trail => {
            if (trail.userData.parentParticle) {
                trail.position.lerp(trail.userData.parentParticle.position, 0.3);
            }
            
            trail.userData.life -= 0.03;
            trail.material.opacity = trail.userData.life * 0.5;
            trail.scale.setScalar(trail.userData.life);

            if (trail.userData.life <= 0) {
                this.scene.remove(trail);
                return false;
            }
            return true;
        });

        this.geometries = this.geometries.filter(geometry => {
            if (geometry.userData.rotationSpeed) {
                geometry.rotation.x += geometry.userData.rotationSpeed.x;
                geometry.rotation.y += geometry.userData.rotationSpeed.y;
                geometry.rotation.z += geometry.userData.rotationSpeed.z;
            }
            
            if (geometry.userData.pulseSpeed) {
                const pulse = Math.sin(time * geometry.userData.pulseSpeed) * 0.1 + 1;
                geometry.scale.setScalar(pulse);
            }
            
            if (geometry.userData.floatSpeed) {
                geometry.position.y += geometry.userData.floatSpeed;
                geometry.position.x += Math.sin(time * geometry.userData.wobbleSpeed) * geometry.userData.wobbleAmount;
                geometry.rotation.z = Math.sin(time * 0.5) * 0.1;
            }

            if (geometry.position.y > 30) {
                this.scene.remove(geometry);
                return false;
            }
            return true;
        });

        this.renderer.render(this.scene, this.camera);
    }
}

const app = new MagicFingers();
