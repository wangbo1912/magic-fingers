class MagicFingers {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = [];
        this.balloons = [];
        this.flowers = [];
        this.currentState = 'idle';
        this.isInitialized = false;
        this.isMobile = this.checkIsMobile();
        this.maxParticles = this.isMobile ? 80 : 150;
        this.maxBalloons = this.isMobile ? 8 : 15;
        this.maxFlowers = this.isMobile ? 6 : 10;
        
        this.init();
    }

    checkIsMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    }

    init() {
        this.setupThreeJS();
        this.setupMediaPipe();
        this.setupEventListeners();
        this.animate();
    }

    setupThreeJS() {
        const container = document.getElementById('canvas-container');
        
        this.scene = new THREE.Scene();
        
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = this.isMobile ? 30 : 25;

        this.renderer = new THREE.WebGLRenderer({ 
            antialias: !this.isMobile, 
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        const pixelRatio = this.isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2);
        this.renderer.setPixelRatio(pixelRatio);
        container.appendChild(this.renderer.domElement);

        this.addLights();
        this.isInitialized = true;
    }

    addLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 10);
        this.scene.add(directionalLight);

        const pointLight1 = new THREE.PointLight(0x00ffff, 1, 50);
        pointLight1.position.set(-10, 5, 5);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xff00ff, 1, 50);
        pointLight2.position.set(10, 5, 5);
        this.scene.add(pointLight2);
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
            minDetectionConfidence: 0.6,
            minTrackingConfidence: 0.6
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
            }, 500);
            document.getElementById('status').innerHTML = '🖐️ 伸出你的手开始魔法！';
        }, 2000);
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
            case '5':
                this.showConfession();
                break;
        }
    }

    showDigit(digit) {
        if (this.currentState === `digit-${digit}`) return;
        
        this.clearParticles();
        this.currentState = `digit-${digit}`;
        document.getElementById('status').style.opacity = '0';
        this.createDigitParticles(digit);
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
        const colors = [0x00ffff, 0xff00ff, 0xffff00, 0x00ff00, 0xff0066];
        const particleCount = this.isMobile ? 5 : 8;
        const extraCount = this.isMobile ? 30 : 50;

        path.forEach((pos, index) => {
            setTimeout(() => {
                for (let i = 0; i < particleCount; i++) {
                    const particle = this.createParticle(
                        pos[0] * 1.5 + (Math.random() - 0.5) * 0.5,
                        pos[1] * 1.5 + (Math.random() - 0.5) * 0.5,
                        (Math.random() - 0.5) * 2,
                        colors[index % colors.length]
                    );
                    this.particles.push(particle);
                }
            }, index * 30);
        });

        for (let i = 0; i < extraCount; i++) {
            setTimeout(() => {
                const particle = this.createParticle(
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 15,
                    (Math.random() - 0.5) * 10,
                    colors[Math.floor(Math.random() * colors.length)]
                );
                this.particles.push(particle);
            }, i * 20);
        }
    }

    showConfession() {
        if (this.currentState === 'confession') return;
        
        this.clearParticles();
        this.currentState = 'confession';
        document.getElementById('status').style.opacity = '0';
        this.createUParticles();
        this.createBalloons();
        this.createFlowers();
    }

    createUParticles() {
        const uPath = [
            [-3, 3], [-2, 3], [-1, 3],
            [-3, 2], [-3, 1], [-3, 0], [-3, -1], [-3, -2],
            [-2, -3], [-1, -3], [0, -3], [1, -3], [2, -3],
            [3, -2], [3, -1], [3, 0], [3, 1], [3, 2],
            [1, 3], [2, 3], [3, 3]
        ];

        const colors = [0xff0066, 0xff66b2, 0xff00ff, 0xff33cc];
        const particleCount = this.isMobile ? 6 : 10;
        const extraCount = this.isMobile ? 60 : 100;

        uPath.forEach((pos, index) => {
            setTimeout(() => {
                for (let i = 0; i < particleCount; i++) {
                    const particle = this.createParticle(
                        pos[0] * 1.2 + (Math.random() - 0.5) * 0.6,
                        pos[1] * 1.2 + (Math.random() - 0.5) * 0.6,
                        (Math.random() - 0.5) * 3,
                        colors[index % colors.length],
                        true
                    );
                    this.particles.push(particle);
                }
            }, index * 25);
        });

        for (let i = 0; i < extraCount; i++) {
            setTimeout(() => {
                const particle = this.createParticle(
                    (Math.random() - 0.5) * 25,
                    (Math.random() - 0.5) * 15,
                    (Math.random() - 0.5) * 10,
                    colors[Math.floor(Math.random() * colors.length)],
                    true
                );
                this.particles.push(particle);
            }, i * 15);
        }
    }

    createBalloons() {
        const balloonColors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181];
        
        for (let i = 0; i < this.maxBalloons; i++) {
            setTimeout(() => {
                const balloon = this.createBalloon(balloonColors[i % balloonColors.length]);
                this.balloons.push(balloon);
            }, i * (this.isMobile ? 300 : 200));
        }
    }

    createBalloon(color) {
        const group = new THREE.Group();
        
        const scale = this.isMobile ? 0.7 : 1;
        const geometry = new THREE.SphereGeometry(0.8 * scale, this.isMobile ? 8 : 16, this.isMobile ? 8 : 16);
        geometry.scale(1, 1.2, 1);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.3,
            shininess: 100
        });
        const balloon = new THREE.Mesh(geometry, material);
        group.add(balloon);

        const stringGeometry = new THREE.CylinderGeometry(0.02, 0.02, 2 * scale);
        const stringMaterial = new THREE.MeshBasicMaterial({ color: 0x666666 });
        const string = new THREE.Mesh(stringGeometry, stringMaterial);
        string.position.y = -1.8 * scale;
        group.add(string);

        group.position.set(
            (Math.random() - 0.5) * 25,
            -15,
            (Math.random() - 0.5) * 10
        );
        group.rotation.z = (Math.random() - 0.5) * 0.2;
        group.userData.floatSpeed = (this.isMobile ? 0.025 : 0.03) + Math.random() * 0.02;
        group.userData.wobbleSpeed = Math.random() * 2;
        group.userData.wobbleAmount = Math.random() * 0.1;

        this.scene.add(group);
        return group;
    }

    createFlowers() {
        for (let i = 0; i < this.maxFlowers; i++) {
            setTimeout(() => {
                const flower = this.createFlower();
                this.flowers.push(flower);
            }, i * (this.isMobile ? 400 : 300) + 1000);
        }
    }

    createFlower() {
        const group = new THREE.Group();
        
        const colors = [0xff69b4, 0xff1493, 0xffb6c1, 0xffc0cb, 0xff6347];
        const scale = this.isMobile ? 0.7 : 1;
        
        for (let i = 0; i < 6; i++) {
            const petalGeometry = new THREE.SphereGeometry(0.3 * scale, this.isMobile ? 6 : 8, this.isMobile ? 6 : 8);
            petalGeometry.scale(1, 0.5, 1);
            const petalMaterial = new THREE.MeshPhongMaterial({
                color: colors[Math.floor(Math.random() * colors.length)],
                emissive: 0xff4444,
                emissiveIntensity: 0.2
            });
            const petal = new THREE.Mesh(petalGeometry, petalMaterial);
            
            const angle = (i / 6) * Math.PI * 2;
            petal.position.x = Math.cos(angle) * 0.4 * scale;
            petal.position.y = Math.sin(angle) * 0.4 * scale;
            petal.rotation.z = angle;
            
            group.add(petal);
        }

        const centerGeometry = new THREE.SphereGeometry(0.25 * scale, this.isMobile ? 6 : 8, this.isMobile ? 6 : 8);
        const centerMaterial = new THREE.MeshPhongMaterial({
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.5
        });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        group.add(center);

        group.position.set(
            (Math.random() - 0.5) * 25,
            -18,
            (Math.random() - 0.5) * 10
        );
        group.userData.floatSpeed = (this.isMobile ? 0.02 : 0.025) + Math.random() * 0.015;
        group.userData.rotationSpeed = (Math.random() - 0.5) * 0.02;

        this.scene.add(group);
        return group;
    }

    createParticle(x, y, z, color, isConfession = false) {
        const geometry = new THREE.SphereGeometry(0.15, this.isMobile ? 4 : 8, this.isMobile ? 4 : 8);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 1
        });
        const particle = new THREE.Mesh(geometry, material);
        
        particle.position.set(x, y, z);
        particle.userData.velocity = {
            x: (Math.random() - 0.5) * 0.05,
            y: (Math.random() - 0.5) * 0.05,
            z: (Math.random() - 0.5) * 0.05
        };
        particle.userData.life = 1;
        particle.userData.isConfession = isConfession;
        particle.userData.pulseSpeed = Math.random() * 3 + 1;
        
        this.scene.add(particle);
        return particle;
    }

    clearParticles() {
        this.particles.forEach(p => this.scene.remove(p));
        this.balloons.forEach(b => this.scene.remove(b));
        this.flowers.forEach(f => this.scene.remove(f));
        this.particles = [];
        this.balloons = [];
        this.flowers = [];
    }

    resetScene() {
        this.clearParticles();
        this.currentState = 'idle';
        document.getElementById('status').innerHTML = '🖐️ 伸出你的手开始魔法！';
        document.getElementById('status').style.opacity = '1';
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

        if (this.particles.length > this.maxParticles) {
            const excess = this.particles.length - this.maxParticles;
            for (let i = 0; i < excess; i++) {
                const p = this.particles.shift();
                if (p) {
                    this.scene.remove(p);
                }
            }
        }

        this.particles = this.particles.filter(particle => {
            particle.position.x += particle.userData.velocity.x;
            particle.position.y += particle.userData.velocity.y;
            particle.position.z += particle.userData.velocity.z;
            
            const pulse = Math.sin(time * particle.userData.pulseSpeed) * 0.5 + 0.5;
            particle.scale.setScalar(1 + pulse * 0.3);
            
            if (!particle.userData.isConfession) {
                particle.userData.life -= this.isMobile ? 0.004 : 0.003;
                particle.material.opacity = particle.userData.life;
            }
            
            particle.rotation.x += 0.02;
            particle.rotation.y += 0.03;

            if (particle.userData.life <= 0) {
                this.scene.remove(particle);
                return false;
            }
            return true;
        });

        this.balloons = this.balloons.filter(balloon => {
            balloon.position.y += balloon.userData.floatSpeed;
            balloon.position.x += Math.sin(time * balloon.userData.wobbleSpeed) * balloon.userData.wobbleAmount;
            balloon.rotation.z = Math.sin(time * 0.5) * 0.1;
            
            if (balloon.position.y > 20) {
                this.scene.remove(balloon);
                return false;
            }
            return true;
        });

        this.flowers = this.flowers.filter(flower => {
            flower.position.y += flower.userData.floatSpeed;
            flower.rotation.z += flower.userData.rotationSpeed;
            flower.rotation.y += 0.02;
            
            if (flower.position.y > 20) {
                this.scene.remove(flower);
                return false;
            }
            return true;
        });

        this.renderer.render(this.scene, this.camera);
    }
}

const app = new MagicFingers();
