// Global game state
let gameMode = 'singleplayer';
let currentUsername = 'GUEST';
let isAdmin = false;
let botDifficulty = 'none';
let players = [];
let chatOpen = false;
let chatMessages = [];

// --- GLOBAL SYSTEM AND CUSTOM DECK TRACKING CONTROLS ---
let flightActive = false;
let speed = 0.5; 
let targetSpeed = 0.5;
let isGearDeployed = true; 
let integrity = 100;
let clockTime = 0.35;
const inputState = {};

// --- INTERACTIVE MOUSE INTERCEPT CALCULATIONS FRAMEWORKS ---
let isMouseDragging = false;
let cameraOrbitTheta = 0;   // Horizontal rotational angles
let cameraOrbitPhi = 0.2;    // Vertical look up/down angles
let lastMouseCoordinateX = 0;
let lastMouseCoordinateY = 0;

// Global references to aircraft components
let leftGearGroup, rightGearGroup, rightExhaustGlow, leftExhaustGlow;
let propEngineBlades = [];

// Track previous values for gauges
let prevAltitude = 0;
let prevSpeed = 0;

// Crash animation state
let isCrashing = false;
let crashProgress = 0;
let crashExplosions = [];

// --- GRAPHICS ENVIRONMENT SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7ec0ee);
scene.fog = new THREE.FogExp2(0x7ec0ee, 0.0005);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 9000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const sunLight = new THREE.DirectionalLight(0xffffff, 1.4);
sunLight.position.set(200, 500, 200);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
scene.add(sunLight, new THREE.AmbientLight(0xffffff, 0.55));

const terrainObstacles = [];
const laserProjectiles = [];
const botAircraft = [];

// --- AIRFRAME CONFIGURATOR ---
const aircraftGroup = new THREE.Group();
scene.add(aircraftGroup);

// --- PROCEDURAL ELEVATION FIELD CALCULATOR ---
function lookupHeight(x, z) {
    let baseH = Math.cos(x * 0.001) * Math.sin(z * 0.001) * 350;
    let rippleH = Math.sin(x * 0.0035) * Math.cos(z * 0.0035) * 65;
    let groundFloor = baseH + rippleH;
    return groundFloor < -10 ? -10 : groundFloor;
}

const mapDimension = 14000;
const terrainGeo = new THREE.PlaneGeometry(mapDimension, mapDimension, 70, 70);
const vPositions = terrainGeo.attributes.position;
for (let i = 0; i < vPositions.count; i++) {
    let px = vPositions.getX(i);
    let py = vPositions.getY(i);
    vPositions.setZ(i, lookupHeight(px, py));
}
terrainGeo.computeVertexNormals();
const terrainMesh = new THREE.Mesh(
    terrainGeo, 
    new THREE.MeshStandardMaterial({ 
        color: 0x345427, 
        roughness: 0.95, 
        flatShading: true 
    })
);
terrainMesh.rotation.x = -Math.PI / 2;
terrainMesh.receiveShadow = true;
scene.add(terrainMesh);

// --- OBSTACLE HAZARD SPATIAL ALLOCATOR ---
for (let i = 0; i < 400; i++) {
    let tx = Math.random() * 8000 - 4000;
    let tz = Math.random() * 8000 - 4000;
    let ty = lookupHeight(tx, tz);

    const treeGroup = new THREE.Group();
    
    const tBox = new THREE.Mesh(
        new THREE.BoxGeometry(3, 20, 3), 
        new THREE.MeshStandardMaterial({ color: 0x473121 })
    );
    tBox.position.y = 10;
    tBox.castShadow = true;
    treeGroup.add(tBox);
    terrainObstacles.push({ 
        minX: tx-1.5, 
        maxX: tx+1.5, 
        minY: ty, 
        maxY: ty+20, 
        minZ: tz-1.5, 
        maxZ: tz+1.5 
    });

    const fBox = new THREE.Mesh(
        new THREE.BoxGeometry(14, 25, 14), 
        new THREE.MeshStandardMaterial({ color: 0x1b3d22, flatShading: true })
    );
    fBox.position.y = 25;
    fBox.castShadow = true;
    treeGroup.add(fBox);
    terrainObstacles.push({ 
        minX: tx-7, 
        maxX: tx+7, 
        minY: ty+12, 
        maxY: ty+37, 
        minZ: tz-7, 
        maxZ: tz+7 
    });

    treeGroup.position.set(tx, ty, tz);
    scene.add(treeGroup);
}

// --- HANGAR CONTROL INTERFACING CORE INJECTIONS ---
const fleetGrid = document.getElementById('fleet-grid');
Object.keys(fleetProfiles).forEach((k, idx) => {
    const plane = fleetProfiles[k];
    const badge = plane.isMilitary ? '<span class="card-class class-mil">MILITARY</span>' : '<span class="card-class class-civ">CIVILIAN</span>';
    fleetGrid.innerHTML += `
        <div class="card-option ${idx === 0 ? 'active' : ''}" onclick="selectHangarPlane('${k}', this)">
            <div class="card-title">${plane.name} ${badge}</div>
            <div class="card-desc">${plane.description}. Base speed: ${Math.floor(plane.speed*220)} mph.</div>
        </div>
    `;
});

function selectHangarPlane(key, element) {
    selectedType = key; 
    activeProfile = fleetProfiles[key];
    document.querySelectorAll('.card-option').forEach(item => item.classList.remove('active'));
    element.classList.add('active');
    document.getElementById('weapon-custom-box').style.display = activeProfile.isMilitary ? 'block' : 'none';
    
    // Manufacture aircraft immediately when selected
    manufactureAircraft();
}

function setSkin(id, desc, element) {
    customSkin = id; 
    document.getElementById('lbl-skin').innerText = desc;
    const buttons = element.parentNode.querySelectorAll('.color-btn');
    buttons.forEach(b => b.classList.remove('active'));
    element.classList.add('active');
    
    if (!flightActive) {
        manufactureAircraft();
    }
}

function updateWingValue(val) {
    customWingspanScale = parseFloat(val);
    document.getElementById('lbl-wingspan').innerText = val + "x";
    
    if (!flightActive) {
        manufactureAircraft();
    }
}

function setLaser(id, desc, element) {
    customLaserColor = id; 
    document.getElementById('lbl-laser').innerText = desc;
    const buttons = element.parentNode.querySelectorAll('.color-btn');
    buttons.forEach(b => b.classList.remove('active'));
    element.classList.add('active');
}

function setBotDifficulty(id, desc, element) {
    botDifficulty = id;
    document.getElementById('lbl-bots').innerText = desc;
    const buttons = element.parentNode.querySelectorAll('.color-btn');
    buttons.forEach(b => b.classList.remove('active'));
    element.classList.add('active');
    updatePlayerList();
}

// Chat functions
function toggleChat() {
    const chat = document.getElementById('chat-container');
    chatOpen = !chatOpen;
    chat.style.display = chatOpen ? 'flex' : 'none';
    if (chatOpen && flightActive) {
        document.getElementById('chat-input').focus();
    }
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (message) {
        addChatMessage(currentUsername, message);
        input.value = '';
        
        // Simulate bot responses
        if (gameMode === 'multiplayer' && botDifficulty !== 'none') {
            setTimeout(() => {
                const botNames = ['BOT-1', 'BOT-2', 'BOT-3', 'BOT-4', 'BOT-5', 'BOT-6'];
                const responses = [
                    'Roger that!',
                    'Copy!',
                    'Understood!',
                    'Affirmative!',
                    'Negative!',
                    'Wilco!',
                    'Good flying!',
                    'Watch your six!',
                    'Clear skies!',
                    'On your wing!'
                ];
                const randomBot = botNames[Math.floor(Math.random() * botNames.length)];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                addChatMessage(randomBot, randomResponse);
            }, 1000 + Math.random() * 2000);
        }
    }
}

function addChatMessage(username, message) {
    const chatMessages = document.getElementById('chat-messages');
    const timestamp = new Date().toLocaleTimeString();
    chatMessages.innerHTML += `
        <div class="chat-message">
            <span class="chat-username">[${timestamp}] ${username}:</span> 
            <span class="chat-text">${message}</span>
        </div>
    `;
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Store message
    chatMessages.push({ username, message, time: Date.now() });
}

function engageFlight() {
    document.getElementById('entry-screen').style.opacity = '0';
    document.getElementById('how-to-play').style.display = 'none';
    setTimeout(() => {
        document.getElementById('entry-screen').style.display = 'none';
        document.getElementById('hud-container').style.display = 'block';
        document.getElementById('active-plane-title').innerText = activeProfile.name;
        document.getElementById('current-username').innerText = currentUsername;

        integrity = 100; 
        speed = activeProfile.speed;
        cameraOrbitTheta = 0; 
        cameraOrbitPhi = 0.2; 
        isMouseDragging = false;
        isCrashing = false;
        crashProgress = 0;
        
        // Clear crash animations
        crashExplosions.forEach(explosion => {
            if (explosion.mesh) scene.remove(explosion.mesh);
        });
        crashExplosions = [];
        
        // Reset gauge values
        prevAltitude = 0;
        prevSpeed = 0;
        
        // Position aircraft
        aircraftGroup.position.set(0, 350, 0); 
        aircraftGroup.rotation.set(0,0,0);
        aircraftGroup.visible = true;
        
        // Spawn bots if in multiplayer with bots enabled
        if (gameMode === 'multiplayer' && botDifficulty !== 'none') {
            spawnBots();
            document.getElementById('chat-container').style.display = 'flex';
            chatOpen = true;
            addChatMessage('SYSTEM', `${currentUsername} has entered the game!`);
        } else {
            document.getElementById('chat-container').style.display = 'none';
            chatOpen = false;
        }
        
        manufactureAircraft();
        flightActive = true;
    }, 300);
}

function spawnBots() {
    // Clear existing bots
    botAircraft.forEach(bot => {
        if (bot.group) {
            scene.remove(bot.group);
        }
        if (bot.label) {
            scene.remove(bot.label);
        }
    });
    botAircraft.length = 0;
    
    const botCount = botDifficulty === 'easy' ? 2 : botDifficulty === 'medium' ? 4 : 6;
    
    for (let i = 0; i < botCount; i++) {
        // Select a random aircraft for the bot
        const botTypes = Object.keys(fleetProfiles);
        const randomType = botTypes[Math.floor(Math.random() * botTypes.length)];
        const botProfile = fleetProfiles[randomType];
        
        // Create bot aircraft
        const botGroup = new THREE.Group();
        
        // Simple bot aircraft model with distinct color
        const botColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
        const botSkin = new THREE.MeshStandardMaterial({ 
            color: botColors[i % botColors.length], 
            roughness: 0.38, 
            metalness: 0.45 
        });
        
        const botFuselage = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 4.0), botSkin);
        const botWingL = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.05, 1.5), botSkin);
        botWingL.position.set(-1.5, 0, 0);
        const botWingR = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.05, 1.5), botSkin);
        botWingR.position.set(1.5, 0, 0);
        
        // Tail
        const botTail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 0.6), botSkin);
        botTail.position.set(0, 0.4, 2.0);
        
        botGroup.add(botFuselage, botWingL, botWingR, botTail);
        
        // Position bot randomly around the player
        const angle = Math.random() * Math.PI * 2;
        const distance = 300 + Math.random() * 200;
        botGroup.position.set(
            Math.cos(angle) * distance,
            200 + Math.random() * 100,
            Math.sin(angle) * distance
        );
        
        // Create name label for bot
        const labelCanvas = document.createElement('canvas');
        labelCanvas.width = 256;
        labelCanvas.height = 64;
        const labelContext = labelCanvas.getContext('2d');
        labelContext.fillStyle = 'rgba(0,0,0,0.7)';
        labelContext.fillRect(0, 0, 256, 64);
        labelContext.font = 'Bold 14px Arial';
        labelContext.fillStyle = '#00ff66';
        labelContext.fillText(`BOT-${i+1}`, 10, 20);
        labelContext.font = '12px Arial';
        labelContext.fillStyle = '#ffffff';
        labelContext.fillText(botProfile.name, 10, 40);
        
        const labelTexture = new THREE.CanvasTexture(labelCanvas);
        const labelMaterial = new THREE.SpriteMaterial({ map: labelTexture, transparent: true });
        const labelSprite = new THREE.Sprite(labelMaterial);
        labelSprite.position.set(0, 0, 0);
        labelSprite.scale.set(20, 5, 1);
        
        scene.add(botGroup);
        scene.add(labelSprite);
        
        botAircraft.push({
            group: botGroup,
            label: labelSprite,
            profile: botProfile,
            speed: botProfile.speed * 0.8 + Math.random() * 0.2,
            direction: new THREE.Vector3(
                Math.random() - 0.5,
                0,
                Math.random() - 0.5
            ).normalize(),
            targetDirection: new THREE.Vector3(
                Math.random() - 0.5,
                0,
                Math.random() - 0.5
            ).normalize(),
            changeDirectionTimer: Math.random() * 5000 + 3000
        });
    }
}

function updateBots() {
    if (!flightActive) return;
    
    const currentTime = Date.now();
    
    botAircraft.forEach(bot => {
        // Move bot in its direction
        bot.group.position.add(bot.direction.clone().multiplyScalar(bot.speed * 0.1));
        bot.label.position.copy(bot.group.position);
        bot.label.position.y += 15;
        
        // Update direction timer
        bot.changeDirectionTimer -= 16; // ~60fps
        if (bot.changeDirectionTimer <= 0) {
            // Change direction towards a new random target
            bot.targetDirection = new THREE.Vector3(
                Math.random() - 0.5,
                0,
                Math.random() - 0.5
            ).normalize();
            bot.changeDirectionTimer = Math.random() * 5000 + 3000;
        }
        
        // Smoothly turn towards target direction
        bot.direction.lerp(bot.targetDirection, 0.01);
        
        // Keep bot within bounds
        if (bot.group.position.y < 50) {
            bot.group.position.y = 50;
            bot.direction.y = Math.abs(bot.direction.y) * 0.5;
        }
        
        // Keep bot within reasonable distance from origin
        const distanceFromOrigin = bot.group.position.length();
        if (distanceFromOrigin > 2000) {
            bot.direction = bot.group.position.clone().negate().normalize();
            bot.direction.y = 0;
        }
        
        // Simple rotation to face direction
        bot.group.lookAt(bot.group.position.clone().add(bot.direction.clone().multiplyScalar(10)));
        
        // Occasionally fire (if military)
        if (bot.profile.isMilitary && Math.random() < 0.002) {
            // Create a small laser effect
            const laserGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.0); 
            laserGeo.rotateX(Math.PI/2);
            const laserMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const laser = new THREE.Mesh(laserGeo, laserMat);
            laser.position.copy(bot.group.position);
            laser.position.x -= 0.5;
            laser.position.y -= 0.1;
            laser.rotation.copy(bot.group.rotation);
            laser.translateZ(-2);
            
            scene.add(laser);
            
            // Remove laser after short time
            setTimeout(() => {
                scene.remove(laser);
            }, 500);
        }
    });
}

function forceCrashState() {
    flightActive = false; 
    isMouseDragging = false;
    isCrashing = true;
    crashProgress = 0;
    
    // Trigger crash animation
    triggerCrashAnimation();
    
    // Hide HUD temporarily
    document.getElementById('hud-container').style.display = 'none';
    
    // Clean up bots
    botAircraft.forEach(bot => {
        if (bot.group) {
            scene.remove(bot.group);
        }
        if (bot.label) {
            scene.remove(bot.label);
        }
    });
    botAircraft.length = 0;
    
    // Show death screen after animation
    setTimeout(() => {
        document.getElementById('death-screen').style.display = 'flex';
        isCrashing = false;
    }, 3000);
}

function triggerCrashAnimation() {
    const crashAnimation = document.getElementById('crash-animation');
    const crashEffect = document.getElementById('crash-effect');
    
    crashAnimation.style.display = 'block';
    crashEffect.innerHTML = '';
    
    // Create multiple explosions
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const explosion = document.createElement('div');
            explosion.className = 'explosion';
            explosion.style.left = `${50 + (Math.random() - 0.5) * 40}%`;
            explosion.style.top = `${50 + (Math.random() - 0.5) * 40}%`;
            explosion.style.background = `radial-gradient(circle, rgba(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 100)},0,0.8) 0%, rgba(0,0,0,0) 70%)`;
            crashEffect.appendChild(explosion);
            
            // Create 3D explosion effect
            const explosionGeo = new THREE.SphereGeometry(5 + Math.random() * 10, 16, 16);
            const explosionMat = new THREE.MeshBasicMaterial({ 
                color: new THREE.Color(Math.random(), Math.random() * 0.5, 0), 
                transparent: true, 
                opacity: 0.8
            });
            const explosionMesh = new THREE.Mesh(explosionGeo, explosionMat);
            explosionMesh.position.copy(aircraftGroup.position);
            explosionMesh.position.x += (Math.random() - 0.5) * 20;
            explosionMesh.position.y += (Math.random() - 0.5) * 20;
            explosionMesh.position.z += (Math.random() - 0.5) * 20;
            scene.add(explosionMesh);
            
            crashExplosions.push({
                mesh: explosionMesh,
                life: 60
            });
            
            // Remove explosion after animation
            setTimeout(() => {
                crashEffect.removeChild(explosion);
            }, 1000);
        }, i * 200);
    }
    
    // Hide aircraft
    aircraftGroup.visible = false;
    
    // Shake camera effect
    const originalCameraPosition = camera.position.clone();
    let shakeIntensity = 20;
    
    function shakeCamera() {
        if (isCrashing && crashProgress < 100) {
            camera.position.x = originalCameraPosition.x + (Math.random() - 0.5) * shakeIntensity;
            camera.position.y = originalCameraPosition.y + (Math.random() - 0.5) * shakeIntensity;
            camera.position.z = originalCameraPosition.z + (Math.random() - 0.5) * shakeIntensity;
            
            shakeIntensity *= 0.95;
            crashProgress += 1;
            
            requestAnimationFrame(shakeCamera);
        } else {
            camera.position.copy(originalCameraPosition);
        }
    }
    
    shakeCamera();
}

function returnToHangar() {
    document.getElementById('death-screen').style.display = 'none';
    document.getElementById('crash-animation').style.display = 'none';
    document.getElementById('entry-screen').style.display = 'flex'; 
    document.getElementById('entry-screen').style.opacity = '1';
    document.getElementById('how-to-play').style.display = 'none';
    document.getElementById('chat-container').style.display = 'none';
    chatOpen = false;
    
    // Clean up bots
    botAircraft.forEach(bot => {
        if (bot.group) {
            scene.remove(bot.group);
        }
        if (bot.label) {
            scene.remove(bot.label);
        }
    });
    botAircraft.length = 0;
    
    // Clean up crash effects
    crashExplosions.forEach(explosion => {
        if (explosion.mesh) scene.remove(explosion.mesh);
    });
    crashExplosions = [];
    
    // Show aircraft again
    aircraftGroup.visible = true;
    
    // Manufacture default aircraft
    selectedType = 'f22';
    activeProfile = fleetProfiles[selectedType];
    manufactureAircraft();
}

// Toggle How to Play panel
function toggleHowToPlay() {
    const panel = document.getElementById('how-to-play');
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

// Login functions
function submitLogin() {
    const username = document.getElementById('username-input').value.trim();
    const password = document.getElementById('password-input').value;
    
    if (username && username !== '') {
        currentUsername = username.substring(0, 20);
        
        if (password === 'mb12348765') {
            isAdmin = true;
            currentUsername = 'ADMIN';
        }
        
        document.getElementById('welcome-screen').style.display = 'none';
        document.getElementById('mode-select-screen').style.display = 'flex';
        document.getElementById('username-display').innerText = 'PILOT: ' + currentUsername;
        document.getElementById('current-username').innerText = currentUsername;
    } else {
        document.getElementById('welcome-error').innerText = 'Please enter a username!';
    }
}

function skipLogin() {
    currentUsername = 'GUEST';
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('mode-select-screen').style.display = 'flex';
    document.getElementById('username-display').innerText = 'PILOT: GUEST';
    document.getElementById('current-username').innerText = 'GUEST';
}

// Mode selection functions
function selectSinglePlayer() {
    gameMode = 'singleplayer';
    document.getElementById('game-mode-indicator').innerText = 'MODE: SINGLEPLAYER';
    document.getElementById('mode-select-screen').style.display = 'none';
    document.getElementById('entry-screen').style.display = 'flex';
    document.getElementById('entry-screen').style.opacity = '1';
    document.getElementById('multiplayer-ui').style.display = 'none';
    document.getElementById('player-list').style.display = 'none';
    document.getElementById('chat-container').style.display = 'none';
    chatOpen = false;
}

function selectMultiPlayer() {
    gameMode = 'multiplayer';
    document.getElementById('game-mode-indicator').innerText = 'MODE: MULTIPLAYER';
    document.getElementById('mode-select-screen').style.display = 'none';
    document.getElementById('entry-screen').style.display = 'flex';
    document.getElementById('entry-screen').style.opacity = '1';
    document.getElementById('multiplayer-ui').style.display = 'flex';
    document.getElementById('player-list').style.display = 'block';
    document.getElementById('chat-container').style.display = 'none';
    chatOpen = false;
    updatePlayerList();
}

function showAdminLogin() {
    document.getElementById('mode-select-screen').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
}

function backToModeSelect() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('mode-select-screen').style.display = 'flex';
    document.getElementById('login-error').innerText = '';
}

function checkAdminPassword() {
    const password = document.getElementById('admin-password').value;
    if (password === 'mb12348765') {
        isAdmin = true;
        currentUsername = 'ADMIN';
        gameMode = 'multiplayer';
        document.getElementById('current-username').innerText = 'ADMIN';
        document.getElementById('username-display').innerText = 'PILOT: ADMIN';
        document.getElementById('game-mode-indicator').innerText = 'MODE: ADMIN';
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('entry-screen').style.display = 'flex';
        document.getElementById('entry-screen').style.opacity = '1';
        document.getElementById('multiplayer-ui').style.display = 'flex';
        document.getElementById('player-list').style.display = 'block';
        document.getElementById('chat-container').style.display = 'none';
        chatOpen = false;
        updatePlayerList();
    } else {
        document.getElementById('login-error').innerText = 'Incorrect password!';
        document.getElementById('admin-password').value = '';
    }
}

function updatePlayerList() {
    const playerList = document.getElementById('player-list');
    playerList.innerHTML = '<div style="color: #ffd700; font-weight: bold; margin-bottom: 5px;">ONLINE PILOTS</div>';
    
    playerList.innerHTML += `
        <div class="player-item" style="color: #00ff66;">
            ${currentUsername} (YOU)
        </div>
    `;
    
    if (gameMode === 'multiplayer' && botDifficulty !== 'none') {
        const botCount = botDifficulty === 'easy' ? 2 : botDifficulty === 'medium' ? 4 : 6;
        for (let i = 1; i <= botCount; i++) {
            playerList.innerHTML += `
                <div class="player-item">
                    BOT-${i} (AI - ${botDifficulty.toUpperCase()})
                </div>
            `;
        }
    }
}

// --- MOUSE MAPPING POV INTERCEPT HANDLERS ---
window.addEventListener('mousedown', (e) => {
    if (!flightActive) return;
    isMouseDragging = true;
    lastMouseCoordinateX = e.clientX;
    lastMouseCoordinateY = e.clientY;
    document.getElementById('pov-state').innerText = "MANUAL ORBIT";
    document.getElementById('pov-state').style.color = "#ffaa00";
});

window.addEventListener('mousemove', (e) => {
    if (!flightActive || !isMouseDragging) return;
    let deltaX = e.clientX - lastMouseCoordinateX;
    let deltaY = e.clientY - lastMouseCoordinateY;

    cameraOrbitTheta += deltaX * 0.015;
    cameraOrbitPhi = Math.max(-0.6, Math.min(1.2, cameraOrbitPhi + deltaY * 0.012));

    lastMouseCoordinateX = e.clientX;
    lastMouseCoordinateY = e.clientY;
});

window.addEventListener('mouseup', () => {
    if (!flightActive) return;
    isMouseDragging = false;
    document.getElementById('pov-state').innerText = "AUTO-TRACK";
    document.getElementById('pov-state').style.color = "#00ff66";
});

// --- WEAPON LAUNCH EXECUTIONS ---
function fireLaserCannon() {
    if (!activeProfile.isMilitary) return;
    
    const laserGeo = new THREE.CylinderGeometry(0.06, 0.06, 4.2); 
    laserGeo.rotateX(Math.PI/2);
    const laserMat = new THREE.MeshBasicMaterial({ color: laserHexMap[customLaserColor] });
    
    [-0.7, 0.7].forEach(offset => {
        const laser = new THREE.Mesh(laserGeo, laserMat);
        laser.position.copy(aircraftGroup.position);
        laser.rotation.copy(aircraftGroup.rotation);
        laser.translateX(offset);
        
        const headingVector = new THREE.Vector3(0, 0, -1).applyQuaternion(aircraftGroup.quaternion);
        laserProjectiles.push({ mesh: laser, vector: headingVector, life: 60 });
        scene.add(laser);
    });
}

// --- KEYSTROKE CAPTURES ---
window.onkeydown = (e) => {
    const key = e.key.toLowerCase(); 
    inputState[key] = true;
    
    if (key === 'r' && !flightActive && !isCrashing) {
        returnToHangar();
    }
    
    if (key === 't' && flightActive) {
        toggleChat();
        e.preventDefault();
    }
    
    if (key === 'enter' && chatOpen && flightActive) {
        sendChatMessage();
        e.preventDefault();
    }
};

window.onkeyup = (e) => { 
    inputState[e.key.toLowerCase()] = false; 
};

// --- RUNTIME SIMULATION LOOPS ---
function runSimulationLoops() {
    if (!flightActive || isCrashing) return;

    let rollingSpeedModifier = activeProfile.rollRate * (1.3 - (customWingspanScale * 0.25));

    if (inputState['w']) aircraftGroup.rotateX(activeProfile.pitchRate);
    if (inputState['s']) aircraftGroup.rotateX(-activeProfile.pitchRate);
    if (inputState['a']) aircraftGroup.rotateZ(rollingSpeedModifier);
    if (inputState['d']) aircraftGroup.rotateZ(-rollingSpeedModifier);
    if (inputState['q']) aircraftGroup.rotateY(activeProfile.pitchRate * 0.6);
    if (inputState['e']) aircraftGroup.rotateY(-activeProfile.pitchRate * 0.6);

    if (inputState['g']) { 
        fireLaserCannon(); 
        inputState['g'] = false; 
    }

    if (inputState[' ']) {
        targetSpeed = activeProfile.speed * 1.6;
        if (leftExhaustGlow) { 
            leftExhaustGlow.visible = true; 
            rightExhaustGlow.visible = true; 
        }
    } else {
        targetSpeed = activeProfile.speed;
        if (leftExhaustGlow) { 
            leftExhaustGlow.visible = false; 
            rightExhaustGlow.visible = false; 
        }
    }
    
    const currentAltitude = aircraftGroup.position.y * 3.3;
    const currentSpeedVal = speed * 220;
    
    speed = THREE.MathUtils.lerp(speed, targetSpeed, 0.05);
    aircraftGroup.position.y -= activeProfile.mass * (1.1 - (speed / (activeProfile.speed * 1.6)));
    aircraftGroup.translateZ(-speed);

    propEngineBlades.forEach(b => { 
        b.rotation.z += speed * 0.65; 
    });

    if (aircraftGroup.position.y < 45) {
        isGearDeployed = true;
        if (leftGearGroup) leftGearGroup.scale.setScalar(1); 
        if (rightGearGroup) rightGearGroup.scale.setScalar(1);
    } else {
        isGearDeployed = false;
        if (leftGearGroup) leftGearGroup.scale.setScalar(0); 
        if (rightGearGroup) rightGearGroup.scale.setScalar(0);
    }

    for (let i = laserProjectiles.length - 1; i >= 0; i--) {
        let projectile = laserProjectiles[i];
        projectile.mesh.position.addScaledVector(projectile.vector, 12.0);
        projectile.life--;
        if (projectile.life <= 0) {
            scene.remove(projectile.mesh);
            laserProjectiles.splice(i, 1);
        }
    }

    // Update crash explosions
    for (let i = crashExplosions.length - 1; i >= 0; i--) {
        crashExplosions[i].life--;
        if (crashExplosions[i].life <= 0) {
            scene.remove(crashExplosions[i].mesh);
            crashExplosions.splice(i, 1);
        } else {
            // Fade out explosion
            crashExplosions[i].mesh.material.opacity = crashExplosions[i].life / 60;
            crashExplosions[i].mesh.scale.multiplyScalar(1.02);
        }
    }

    updateBots();

    let px = aircraftGroup.position.x;
    let py = aircraftGroup.position.y;
    let pz = aircraftGroup.position.z;

    let calculatedWingReach = (activeProfile.type === "heavy" ? 6.0 : (activeProfile.type === "prop" ? 3.25 : 3.9)) * customWingspanScale;

    let planeAABB = {
        minX: px - calculatedWingReach, 
        maxX: px + calculatedWingReach,
        minY: py - 0.6, 
        maxY: py + 1.2,
        minZ: pz - 4.5, 
        maxZ: pz + 4.5
    };

    let currentGroundAltitude = lookupHeight(px, pz);
    if (py <= currentGroundAltitude + 0.8) {
        if (!isGearDeployed || speed > activeProfile.speed * 1.25) {
            integrity = 0; 
            forceCrashState(); 
            return;
        }
    }

    for (let i = 0; i < terrainObstacles.length; i++) {
        let obs = terrainObstacles[i];
        let hitX = planeAABB.maxX >= obs.minX && planeAABB.minX <= obs.maxX;
        let hitY = planeAABB.maxY >= obs.minY && planeAABB.minY <= obs.maxY;
        let hitZ = planeAABB.maxZ >= obs.minZ && planeAABB.minZ <= obs.maxZ;

        if (hitX && hitY && hitZ) {
            integrity = 0; 
            forceCrashState(); 
            return;
        }
    }

    // Atmosphere Cycles
    clockTime += 0.00005;
    let cycleVal = (Math.sin(clockTime * Math.PI * 2) + 1) / 2;
    scene.background.setHSL(0.58, 0.5, cycleVal * 0.4 + 0.1);
    scene.fog.color.setHSL(0.58, 0.5, cycleVal * 0.4 + 0.1);

    updateDashboard(currentAltitude, currentSpeedVal);
    
    prevAltitude = currentAltitude;
    prevSpeed = currentSpeedVal;
}

function updateDashboard(altitude, speedVal) {
    const altNeedle = document.getElementById('alt-needle');
    const altValue = document.getElementById('alt-value');
    const speedNeedle = document.getElementById('speed-needle');
    const speedValue = document.getElementById('speed-value');
    const gearValue = document.getElementById('gear-value');
    const integrityValue = document.getElementById('integrity-value');
    const vsValue = document.getElementById('vs-value');
    const timeValue = document.getElementById('time-value');
    
    if (altNeedle && altValue) {
        const altRotation = Math.min(180, altitude / 2);
        altNeedle.style.transform = `translateX(-50%) rotate(${180 - altRotation}deg)`;
        altValue.innerText = Math.floor(altitude);
    }
    
    if (speedNeedle && speedValue) {
        const speedRotation = Math.min(180, speedVal / 2);
        speedNeedle.style.transform = `translateX(-50%) rotate(${180 - speedRotation}deg)`;
        speedValue.innerText = Math.floor(speedVal);
    }
    
    if (gearValue) {
        gearValue.innerText = isGearDeployed ? 'DOWN' : 'UP';
        gearValue.className = isGearDeployed ? 'dashboard-value' : 'dashboard-value warning';
    }
    
    if (integrityValue) {
        integrityValue.innerText = integrity + '%';
        integrityValue.className = integrity < 30 ? 'dashboard-value danger' : integrity < 70 ? 'dashboard-value warning' : 'dashboard-value';
    }
    
    if (vsValue) {
        const verticalSpeed = (prevAltitude - altitude) * 10;
        vsValue.innerText = Math.floor(verticalSpeed);
        vsValue.className = verticalSpeed > 50 ? 'dashboard-value danger' : verticalSpeed < -50 ? 'dashboard-value warning' : 'dashboard-value';
    }
    
    if (timeValue) {
        let hr = Math.floor((clockTime * 24) % 24).toString().padStart(2,'0');
        let mn = Math.floor((clockTime * 1440) % 60).toString().padStart(2,'0');
        timeValue.innerText = `${hr}:${mn}`;
    }
}

function trackCameraSpring() {
    if (!flightActive || isCrashing) return;

    if (!isMouseDragging) {
        cameraOrbitTheta = THREE.MathUtils.lerp(cameraOrbitTheta, 0, 0.08);
        cameraOrbitPhi = THREE.MathUtils.lerp(cameraOrbitPhi, 0.16, 0.08);
    }

    let cameraRadiusDistance = activeProfile.type === "heavy" ? 19.0 : 14.5;
    
    let sphericalOffset = new THREE.Vector3(
        cameraRadiusDistance * Math.sin(cameraOrbitTheta) * Math.cos(cameraOrbitPhi),
        cameraRadiusDistance * Math.sin(cameraOrbitPhi) + 2.2,
        cameraRadiusDistance * Math.cos(cameraOrbitTheta) * Math.cos(cameraOrbitPhi)
    );

    let absoluteWorldOffset = sphericalOffset.applyMatrix4(aircraftGroup.matrixWorld);
    camera.position.lerp(absoluteWorldOffset, 0.2);
    
    let targetLookPosition = new THREE.Vector3(0, 0.4, -3.0).applyMatrix4(aircraftGroup.matrixWorld);
    camera.lookAt(targetLookPosition);
}

function renderEngineLoop() {
    requestAnimationFrame(renderEngineLoop);
    runSimulationLoops();
    trackCameraSpring();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight; 
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize with first aircraft
manufactureAircraft();

// Start with welcome screen

renderEngineLoop();
