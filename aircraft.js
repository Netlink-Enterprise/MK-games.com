// --- ENHANCED FLEET ARCHITECTURAL COMPREHENSIVE DEFINITIONS ---
const fleetProfiles = {
    f22: { 
        name: "F-22 Raptor", 
        isMilitary: true, 
        speed: 3.0, 
        pitchRate: 0.035, 
        rollRate: 0.055, 
        mass: 0.05, 
        type: "jet",
        color: 0x5a697c,
        description: "5th gen stealth fighter with thrust vectoring"
    },
    su57: { 
        name: "Su-57 Felon", 
        isMilitary: true, 
        speed: 3.1, 
        pitchRate: 0.037, 
        rollRate: 0.058, 
        mass: 0.05, 
        type: "jet",
        color: 0x4a5a6a,
        description: "Russian stealth multirole fighter"
    },
    f16: { 
        name: "F-16 Fighting Falcon", 
        isMilitary: true, 
        speed: 2.6, 
        pitchRate: 0.040, 
        rollRate: 0.065, 
        mass: 0.04, 
        type: "jet",
        color: 0x6a7a8a,
        description: "Lightweight multirole fighter"
    },
    b747: { 
        name: "Boeing 747-8", 
        isMilitary: false, 
        speed: 1.4, 
        pitchRate: 0.010, 
        rollRate: 0.014, 
        mass: 0.45, 
        type: "heavy",
        color: 0xffffff,
        description: "Iconic jumbo jet airliner"
    },
    a380: { 
        name: "Airbus A380", 
        isMilitary: false, 
        speed: 1.3, 
        pitchRate: 0.008, 
        rollRate: 0.011, 
        mass: 0.55, 
        type: "heavy",
        color: 0xffffff,
        description: "World's largest passenger airliner"
    },
    c130: { 
        name: "C-130 Hercules", 
        isMilitary: true, 
        speed: 1.1, 
        pitchRate: 0.015, 
        rollRate: 0.020, 
        mass: 0.35, 
        type: "heavy",
        color: 0x666666,
        description: "Military transport aircraft"
    },
    p51: { 
        name: "P-51 Mustang", 
        isMilitary: false, 
        speed: 1.25, 
        pitchRate: 0.028, 
        rollRate: 0.042, 
        mass: 0.12, 
        type: "prop",
        color: 0x0055aa,
        description: "WWII legendary fighter plane"
    },
    spitfire: { 
        name: "Supermarine Spitfire", 
        isMilitary: false, 
        speed: 1.2, 
        pitchRate: 0.031, 
        rollRate: 0.046, 
        mass: 0.11, 
        type: "prop",
        color: 0x00aa00,
        description: "British WWII fighter with elliptical wings"
    },
    pitts: { 
        name: "Pitts Special S-2B", 
        isMilitary: false, 
        speed: 0.9, 
        pitchRate: 0.048, 
        rollRate: 0.070, 
        mass: 0.04, 
        type: "prop",
        color: 0xaa0000,
        description: "Aerobatic biplane for extreme maneuvers"
    },
    cessna172: { 
        name: "Cessna 172 Skyhawk", 
        isMilitary: false, 
        speed: 0.8, 
        pitchRate: 0.018, 
        rollRate: 0.025, 
        mass: 0.08, 
        type: "prop",
        color: 0xffffff,
        description: "Most popular single-engine aircraft"
    },
    a10: { 
        name: "A-10 Thunderbolt II", 
        isMilitary: true, 
        speed: 1.3, 
        pitchRate: 0.024, 
        rollRate: 0.034, 
        mass: 0.22, 
        type: "jet",
        color: 0x444444,
        description: "Tank buster with GAU-8 Avenger cannon"
    },
    concorde: { 
        name: "Aérospatiale Concorde", 
        isMilitary: false, 
        speed: 3.4, 
        pitchRate: 0.011, 
        rollRate: 0.018, 
        mass: 0.38, 
        type: "jet",
        color: 0xffffff,
        description: "Supersonic passenger airliner"
    },
    sr71: { 
        name: "SR-71 Blackbird", 
        isMilitary: true, 
        speed: 4.5, 
        pitchRate: 0.009, 
        rollRate: 0.015, 
        mass: 0.28, 
        type: "jet",
        color: 0x000000,
        description: "High-altitude reconnaissance aircraft"
    }
};

// Global variables for customization
let selectedType = 'f22';
let activeProfile = fleetProfiles[selectedType];
let customSkin = 'grey';
let customWingspanScale = 1.0;
let customLaserColor = 'red';

const skinHexMap = {
    grey: 0x5a697c, 
    desert: 0xc2b280, 
    forest: 0x2d4a22,
    crimson: 0x990011, 
    blue: 0x1d4ed8, 
    white: 0xf8fafc
};

const laserHexMap = { 
    red: 0xff0033, 
    green: 0x00ff66, 
    cyan: 0x00f0ff, 
    magenta: 0xff00ff 
};

// Common materials
function getMaterials(skinColor) {
    const metalSkin = new THREE.MeshStandardMaterial({ 
        color: skinHexMap[skinColor] || skinColor, 
        roughness: 0.38, 
        metalness: 0.45 
    });
    const canopyMat = new THREE.MeshStandardMaterial({ 
        color: 0x0a1520, 
        transparent: true, 
        opacity: 0.65, 
        roughness: 0.05 
    });
    const steelMat = new THREE.MeshStandardMaterial({ 
        color: 0x242424, 
        metalness: 0.8, 
        roughness: 0.3 
    });
    const tireSkin = new THREE.MeshStandardMaterial({ 
        color: 0x151515, 
        roughness: 0.95 
    });
    
    return { metalSkin, canopyMat, steelMat, tireSkin };
}

// Aircraft creation functions
function createF22Raptor() {
    const group = new THREE.Group();
    const { metalSkin, canopyMat, steelMat, tireSkin } = getMaterials(customSkin);

    const fuselage = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.6, 5.8), metalSkin);
    fuselage.castShadow = true;
    
    const noseCone = new THREE.Mesh(new THREE.ConeGeometry(0.65, 2.2, 4), metalSkin);
    noseCone.rotateX(Math.PI/2);
    noseCone.position.set(0, -0.05, -3.9);
    noseCone.castShadow = true;
    
    const cockpitGlass = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), canopyMat);
    cockpitGlass.position.set(0, 0.42, -1.3);
    cockpitGlass.scale.set(1, 0.9, 2.2);
    
    let wingWidth = 7.8 * customWingspanScale;
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(wingWidth/2, 0.05, 2.0), metalSkin);
    wingL.position.set(-wingWidth/4 - 0.5, -0.05, 0.3);
    wingL.rotation.y = 0.35;
    wingL.castShadow = true;
    
    const wingR = new THREE.Mesh(new THREE.BoxGeometry(wingWidth/2, 0.05, 2.0), metalSkin);
    wingR.position.set(wingWidth/4 + 0.5, -0.05, 0.3);
    wingR.rotation.y = -0.35;
    wingR.castShadow = true;
    
    const finL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.5, 1.1), metalSkin);
    finL.position.set(-0.6, 0.9, 2.4);
    finL.rotation.z = 0.22;
    finL.castShadow = true;
    
    const finR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.5, 1.1), metalSkin);
    finR.position.set(0.6, 0.9, 2.4);
    finR.rotation.z = -0.22;
    finR.castShadow = true;
    
    const portL = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.5, 12), steelMat);
    portL.rotation.x = Math.PI/2;
    portL.position.set(-0.32, -0.05, 2.9);
    portL.castShadow = true;
    
    const portR = portL.clone();
    portR.position.x = 0.32;
    
    const torchG = new THREE.ConeGeometry(0.16, 2.2, 8);
    torchG.rotateX(-Math.PI/2);
    leftExhaustGlow = new THREE.Mesh(torchG, new THREE.MeshBasicMaterial({ color: 0x3388ff, transparent: true, opacity: 0.75 }));
    leftExhaustGlow.position.z = 1.2;
    rightExhaustGlow = leftExhaustGlow.clone();
    portL.add(leftExhaustGlow);
    portR.add(rightExhaustGlow);
    leftExhaustGlow.visible = false;
    rightExhaustGlow.visible = false;
    
    const barrelL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4), steelMat);
    barrelL.rotation.x = Math.PI/2;
    barrelL.position.set(-0.7, -0.15, -1.5);
    
    const barrelR = barrelL.clone();
    barrelR.position.x = 0.7;
    
    const strutG = new THREE.CylinderGeometry(0.04, 0.04, 1.1);
    const wheelG = new THREE.CylinderGeometry(0.26, 0.26, 0.14);
    wheelG.rotateZ(Math.PI/2);

    leftGearGroup = new THREE.Group();
    const sL = new THREE.Mesh(strutG, steelMat);
    const tL = new THREE.Mesh(wheelG, tireSkin);
    tL.position.y = -0.55;
    leftGearGroup.add(sL, tL);
    leftGearGroup.position.set(-1.1, -0.5, 0);
    
    rightGearGroup = new THREE.Group();
    const sR = new THREE.Mesh(strutG, steelMat);
    const tR = new THREE.Mesh(wheelG, tireSkin);
    tR.position.y = -0.55;
    rightGearGroup.add(sR, tR);
    rightGearGroup.position.set(1.1, -0.5, 0);
    
    fuselage.add(noseCone, cockpitGlass, wingL, wingR, finL, finR, portL, portR, barrelL, barrelR, leftGearGroup, rightGearGroup);
    group.add(fuselage);
    
    return group;
}

function createSu57Felon() {
    const group = new THREE.Group();
    const { metalSkin, canopyMat, steelMat, tireSkin } = getMaterials(customSkin);

    const fuselage = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.7, 6.5), metalSkin);
    fuselage.castShadow = true;
    
    const noseCone = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2.5, 4), metalSkin);
    noseCone.rotateX(Math.PI/2);
    noseCone.position.set(0, -0.1, -4.2);
    noseCone.castShadow = true;
    
    const cockpitGlass = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.6), canopyMat);
    cockpitGlass.position.set(0, 0.5, -2.0);
    cockpitGlass.rotation.x = 0.1;
    
    let wingWidth = 8.0 * customWingspanScale;
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(wingWidth/2, 0.06, 2.2), metalSkin);
    wingL.position.set(-wingWidth/4 - 0.6, -0.1, 0.5);
    wingL.rotation.y = -0.2;
    wingL.castShadow = true;
    
    const wingR = new THREE.Mesh(new THREE.BoxGeometry(wingWidth/2, 0.06, 2.2), metalSkin);
    wingR.position.set(wingWidth/4 + 0.6, -0.1, 0.5);
    wingR.rotation.y = 0.2;
    wingR.castShadow = true;
    
    const finL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.8, 1.3), metalSkin);
    finL.position.set(-1.0, 1.0, 2.8);
    finL.rotation.z = 0.3;
    finL.castShadow = true;
    
    const finR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.8, 1.3), metalSkin);
    finR.position.set(1.0, 1.0, 2.8);
    finR.rotation.z = -0.3;
    finR.castShadow = true;
    
    const portL = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.6, 12), steelMat);
    portL.rotation.x = Math.PI/2;
    portL.position.set(-0.4, -0.1, 3.2);
    portL.castShadow = true;
    
    const portR = portL.clone();
    portR.position.x = 0.4;
    
    const torchG = new THREE.ConeGeometry(0.18, 2.5, 8);
    torchG.rotateX(-Math.PI/2);
    leftExhaustGlow = new THREE.Mesh(torchG, new THREE.MeshBasicMaterial({ color: 0x3388ff, transparent: true, opacity: 0.75 }));
    leftExhaustGlow.position.z = 1.3;
    rightExhaustGlow = leftExhaustGlow.clone();
    portL.add(leftExhaustGlow);
    portR.add(rightExhaustGlow);
    leftExhaustGlow.visible = false;
    rightExhaustGlow.visible = false;
    
    const strutG = new THREE.CylinderGeometry(0.05, 0.05, 1.2);
    const wheelG = new THREE.CylinderGeometry(0.28, 0.28, 0.16);
    wheelG.rotateZ(Math.PI/2);

    leftGearGroup = new THREE.Group();
    const sL = new THREE.Mesh(strutG, steelMat);
    const tL = new THREE.Mesh(wheelG, tireSkin);
    tL.position.y = -0.6;
    leftGearGroup.add(sL, tL);
    leftGearGroup.position.set(-1.3, -0.6, 0.5);
    
    rightGearGroup = new THREE.Group();
    const sR = new THREE.Mesh(strutG, steelMat);
    const tR = new THREE.Mesh(wheelG, tireSkin);
    tR.position.y = -0.6;
    rightGearGroup.add(sR, tR);
    rightGearGroup.position.set(1.3, -0.6, 0.5);
    
    fuselage.add(noseCone, cockpitGlass, wingL, wingR, finL, finR, portL, portR, leftGearGroup, rightGearGroup);
    group.add(fuselage);
    
    return group;
}

function createF16FightingFalcon() {
    const group = new THREE.Group();
    const { metalSkin, canopyMat, steelMat, tireSkin } = getMaterials(customSkin);

    const fuselage = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.5, 5.2), metalSkin);
    fuselage.castShadow = true;
    
    const noseCone = new THREE.Mesh(new THREE.ConeGeometry(0.55, 2.0, 4), metalSkin);
    noseCone.rotateX(Math.PI/2);
    noseCone.position.set(0, -0.02, -3.5);
    noseCone.castShadow = true;
    
    const cockpitGlass = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), canopyMat);
    cockpitGlass.position.set(0, 0.35, -1.0);
    cockpitGlass.scale.set(1, 0.8, 2.0);
    
    let wingWidth = 7.0 * customWingspanScale;
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(wingWidth/2, 0.04, 1.8), metalSkin);
    wingL.position.set(-wingWidth/4 - 0.4, -0.02, 0.0);
    wingL.rotation.y = 0.4;
    wingL.castShadow = true;
    
    const wingR = new THREE.Mesh(new THREE.BoxGeometry(wingWidth/2, 0.04, 1.8), metalSkin);
    wingR.position.set(wingWidth/4 + 0.4, -0.02, 0.0);
    wingR.rotation.y = -0.4;
    wingR.castShadow = true;
    
    const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.6, 1.2), metalSkin);
    tailFin.position.set(0, 0.9, 2.3);
    tailFin.castShadow = true;
    
    const hStabL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.4), metalSkin);
    hStabL.position.set(-0.6, 0.2, 2.8);
    hStabL.castShadow = true;
    
    const hStabR = hStabL.clone();
    hStabR.position.x = 0.6;
    
    const engine = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.8, 12), steelMat);
    engine.rotation.x = Math.PI/2;
    engine.position.set(0, -0.05, 2.7);
    engine.castShadow = true;
    
    const torchG = new THREE.ConeGeometry(0.18, 2.5, 8);
    torchG.rotateX(-Math.PI/2);
    leftExhaustGlow = new THREE.Mesh(torchG, new THREE.MeshBasicMaterial({ color: 0x3388ff, transparent: true, opacity: 0.75 }));
    leftExhaustGlow.position.z = 1.3;
    engine.add(leftExhaustGlow);
    leftExhaustGlow.visible = false;
    
    const strutG = new THREE.CylinderGeometry(0.04, 0.04, 1.0);
    const wheelG = new THREE.CylinderGeometry(0.24, 0.24, 0.14);
    wheelG.rotateZ(Math.PI/2);

    leftGearGroup = new THREE.Group();
    const sL = new THREE.Mesh(strutG, steelMat);
    const tL = new THREE.Mesh(wheelG, tireSkin);
    tL.position.y = -0.5;
    leftGearGroup.add(sL, tL);
    leftGearGroup.position.set(-0.9, -0.5, 0.2);
    
    rightGearGroup = new THREE.Group();
    const sR = new THREE.Mesh(strutG, steelMat);
    const tR = new THREE.Mesh(wheelG, tireSkin);
    tR.position.y = -0.5;
    rightGearGroup.add(sR, tR);
    rightGearGroup.position.set(0.9, -0.5, 0.2);
    
    fuselage.add(noseCone, cockpitGlass, wingL, wingR, tailFin, hStabL, hStabR, engine, leftGearGroup, rightGearGroup);
    group.add(fuselage);
    
    return group;
}

function createB747() {
    const group = new THREE.Group();
    const { metalSkin, canopyMat, steelMat, tireSkin } = getMaterials(customSkin);

    const fuselage = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.5, 12.0), metalSkin);
    fuselage.castShadow = true;
    
    const noseCone = new THREE.Mesh(new THREE.SphereGeometry(1.25, 16, 16), metalSkin);
    noseCone.position.set(0, 0, -6.0);
    noseCone.scale.set(1, 1, 1.5);
    noseCone.castShadow = true;
    
    const cockpitGlass = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.8), canopyMat);
    cockpitGlass.position.set(0, 1.8, -4.5);
    
    let wingWidth = 12.0 * customWingspanScale;
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(wingWidth/2, 0.15, 2.5), metalSkin);
    wingL.position.set(-wingWidth/4 - 1.2, -0.2, -1.0);
    wingL.rotation.y = 0.25;
    wingL.rotation.z = 0.05;
    wingL.castShadow = true;
    
    const wingR = new THREE.Mesh(new THREE.BoxGeometry(wingWidth/2, 0.15, 2.5), metalSkin);
    wingR.position.set(wingWidth/4 + 1.2, -0.2, -1.0);
    wingR.rotation.y = -0.25;
    wingR.rotation.z = -0.05;
    wingR.castShadow = true;
    
    const tailVert = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.0, 1.8), metalSkin);
    tailVert.position.set(0, 2.5, 5.0);
    tailVert.castShadow = true;
    
    const tailHoriz = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.1, 1.2), metalSkin);
    tailHoriz.position.set(0, 0.5, 5.5);
    tailHoriz.castShadow = true;
    
    let spacing = wingWidth * 0.22;
    let podPositions = [-spacing*1.8, -spacing*0.9, spacing*0.9, spacing*1.8];
    podPositions.forEach(posX => {
        const enginePod = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.35, 1.8, 10), steelMat);
        enginePod.rotation.x = Math.PI / 2;
        enginePod.position.set(posX, -0.8, -0.5);
        enginePod.castShadow = true;
        fuselage.add(enginePod);
    });
    
    const strutG = new THREE.CylinderGeometry(0.05, 0.05, 1.3);
    const wheelG = new THREE.CylinderGeometry(0.3, 0.3, 0.2);
    wheelG.rotateZ(Math.PI/2);

    leftGearGroup = new THREE.Group();
    const sL = new THREE.Mesh(strutG, steelMat);
    const tL = new THREE.Mesh(wheelG, tireSkin);
    tL.position.y = -0.65;
    leftGearGroup.add(sL, tL);
    leftGearGroup.position.set(-1.5, -0.8, -2.0);
    
    rightGearGroup = new THREE.Group();
    const sR = new THREE.Mesh(strutG, steelMat);
    const tR = new THREE.Mesh(wheelG, tireSkin);
    tR.position.y = -0.65;
    rightGearGroup.add(sR, tR);
    rightGearGroup.position.set(1.5, -0.8, -2.0);
    
    fuselage.add(noseCone, cockpitGlass, wingL, wingR, tailVert, tailHoriz, leftGearGroup, rightGearGroup);
    group.add(fuselage);
    
    return group;
}

function createA380() {
    const group = new THREE.Group();
    const { metalSkin, canopyMat, steelMat, tireSkin } = getMaterials(customSkin);

    const fuselage = new THREE.Mesh(new THREE.BoxGeometry(3.0, 3.0, 14.0), metalSkin);
    fuselage.castShadow = true;
    
    const noseCone = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 16), metalSkin);
    noseCone.position.set(0, 0, -7.0);
    noseCone.scale.set(1, 1, 1.6);
    noseCone.castShadow = true;
    
    const cockpitGlass = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.6, 1.0), canopyMat);
    cockpitGlass.position.set(0, 2.0, -5.5);
    
    let wingWidth = 13.0 * customWingspanScale;
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(wingWidth/2, 0.2, 3.0), metalSkin);
    wingL.position.set(-wingWidth/4 - 1.5, -0.3, -1.5);
    wingL.rotation.y = 0.2;
    wingL.castShadow = true;
    
    const wingR = new THREE.Mesh(new THREE.BoxGeometry(wingWidth/2, 0.2, 3.0), metalSkin);
    wingR.position.set(wingWidth/4 + 1.5, -0.3, -1.5);
    wingR.rotation.y = -0.2;
    wingR.castShadow = true;
    
    const tailVert = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.5, 2.0), metalSkin);
    tailVert.position.set(0, 3.0, 6.0);
    tailVert.castShadow = true;
    
    const tailHoriz = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, 1.5), metalSkin);
    tailHoriz.position.set(0, 0.6, 6.5);
    tailHoriz.castShadow = true;
    
    let spacing = wingWidth * 0.20;
    let podPositions = [-spacing*1.8, -spacing*0.9, spacing*0.9, spacing*1.8];
    podPositions.forEach(posX => {
        const enginePod = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.45, 2.0, 10), steelMat);
        enginePod.rotation.x = Math.PI / 2;
        enginePod.position.set(posX, -1.0, -0.8);
        enginePod.castShadow = true;
        fuselage.add(enginePod);
    });
    
    const strutG = new THREE.CylinderGeometry(0.06, 0.06, 1.5);
    const wheelG = new THREE.CylinderGeometry(0.35, 0.35, 0.25);
    wheelG.rotateZ(Math.PI/2);

    leftGearGroup = new THREE.Group();
    const sL = new THREE.Mesh(strutG, steelMat);
    const tL = new THREE.Mesh(wheelG, tireSkin);
    tL.position.y = -0.75;
    leftGearGroup.add(sL, tL);
    leftGearGroup.position.set(-1.8, -1.0, -2.5);
    
    rightGearGroup = new THREE.Group();
    const sR = new THREE.Mesh(strutG, steelMat);
    const tR = new THREE.Mesh(wheelG, tireSkin);
    tR.position.y = -0.75;
    rightGearGroup.add(sR, tR);
    rightGearGroup.position.set(1.8, -1.0, -2.5);
    
    fuselage.add(noseCone, cockpitGlass, wingL, wingR, tailVert, tailHoriz, leftGearGroup, rightGearGroup);
    group.add(fuselage);
    
    return group;
}

function createC130Hercules() {
    const group = new THREE.Group();
    const { metalSkin, canopyMat, steelMat, tireSkin } = getMaterials(customSkin);

    const fuselage = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.0, 10.0), metalSkin);
    fuselage.castShadow = true;
    
    const noseCone = new THREE.Mesh(new THREE.SphereGeometry(1.0, 16, 16), metalSkin);
    noseCone.position.set(0, 0, -5.0);
    noseCone.scale.set(1, 1, 1.3);
    noseCone.castShadow = true;
    
    const cockpitGlass = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 0.8), canopyMat);
    cockpitGlass.position.set(0, 1.2, -4.0);
    
    let wingWidth = 11.0 * customWingspanScale;
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(wingWidth/2, 0.15, 2.0), metalSkin);
    wingL.position.set(-wingWidth/4 - 1.0, 1.2, -0.5);
    wingL.castShadow = true;
    
    const wingR = new THREE.Mesh(new THREE.BoxGeometry(wingWidth/2, 0.15, 2.0), metalSkin);
    wingR.position.set(wingWidth/4 + 1.0, 1.2, -0.5);
    wingR.castShadow = true;
    
    const tailVert = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.5, 1.5), metalSkin);
    tailVert.position.set(0, 2.5, 4.5);
    tailVert.castShadow = true;
    
    const tailHoriz = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.1, 1.0), metalSkin);
    tailHoriz.position.set(0, 2.5, 4.5);
    tailHoriz.castShadow = true;
    
    let spacing = wingWidth * 0.25;
    let podPositions = [-spacing*1.5, -spacing*0.5, spacing*0.5, spacing*1.5];
    podPositions.forEach(posX => {
        const enginePod = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.2, 10), steelMat);
        enginePod.rotation.x = Math.PI / 2;
        enginePod.position.set(posX, 0.8, -0.3);
        enginePod.castShadow = true;
        
        const hub = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 8), steelMat);
        hub.rotateX(-Math.PI/2);
        hub.position.set(0, 0, -0.6);
        const blade = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 0.03), steelMat);
        hub.add(blade);
        enginePod.add(hub);
        propEngineBlades.push(blade);
        
        fuselage.add(enginePod);
    });
    
    const strutG = new THREE.CylinderGeometry(0.05, 0.05, 1.2);
    const wheelG = new THREE.CylinderGeometry(0.28, 0.28, 0.2);
    wheelG.rotateZ(Math.PI/2);

    leftGearGroup = new THREE.Group();
    const sL = new THREE.Mesh(strutG, steelMat);
    const tL = new THREE.Mesh(wheelG, tireSkin);
    tL.position.y = -0.6;
    leftGearGroup.add(sL, tL);
    leftGearGroup.position.set(-1.2, -0.7, -1.0);
    
    rightGearGroup = new THREE.Group();
    const sR = new THREE.Mesh(strutG, steelMat);
    const tR = new THREE.Mesh(wheelG, tireSkin);
    tR.position.y = -0.6;
    rightGearGroup.add(sR, tR);
    rightGearGroup.position.set(1.2, -0.7, -1.0);
    
    fuselage.add(noseCone, cockpitGlass, wingL, wingR, tailVert, tailHoriz, leftGearGroup, rightGearGroup);
    group.add(fuselage);
    
    return group;
}

function createP51Mustang() {
    const group = new THREE.Group();
    const { metalSkin, canopyMat, steelMat, tireSkin } = getMaterials(customSkin);

    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.3, 5.5, 8), metalSkin);
    fuselage.rotation.x = Math.PI / 2;
    fuselage.castShadow = true;
    
    const noseCone = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.5, 8), metalSkin);
    noseCone.rotateX(Math.PI/2);
    noseCone.position.set(0, -0.1, -3.8);
    noseCone.castShadow = true;
    
    const cockpitGlass = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), canopyMat);
    cockpitGlass.position.set(0, 0.8, -0.3);
    cockpitGlass.scale.set(1, 1, 1.8);
    
    let wingWidth = 6.5 * customWingspanScale;
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(wingWidth/2, 0.08, 1.4), metalSkin);
    wingL.position.set(-wingWidth/4 - 0.3, 0.1, -0.4);
    wingL.castShadow = true;
    
    const wingR = wingL.clone();
    wingR.position.x = wingWidth/4 + 0.3;
    
    const tailVert = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.3, 1.0), metalSkin);
    tailVert.position.set(0, 0.9, 2.4);
    tailVert.castShadow = true;
    
    const tailHoriz = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.4), metalSkin);
    tailHoriz.position.set(0, 0.2, 2.4);
    tailHoriz.castShadow = true;
    
    const hub = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.6, 8), steelMat);
    hub.rotateX(-Math.PI/2);
    hub.position.set(0, 0, -2.9);
    hub.castShadow = true;
    
    const blade = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.14, 0.04), steelMat);
    hub.add(blade);
    propEngineBlades.push(blade);
    
    const strutG = new THREE.CylinderGeometry(0.04, 0.04, 1.0);
    const wheelG = new THREE.CylinderGeometry(0.26, 0.26, 0.14);
    wheelG.rotateZ(Math.PI/2);

    leftGearGroup = new THREE.Group();
    const sL = new THREE.Mesh(strutG, steelMat);
    const tL = new THREE.Mesh(wheelG, tireSkin);
    tL.position.y = -0.5;
    leftGearGroup.add(sL, tL);
    leftGearGroup.position.set(-0.8, -0.5, -0.5);
    
    rightGearGroup = new THREE.Group();
    const sR = new THREE.Mesh(strutG, steelMat);
    const tR = new THREE.Mesh(wheelG, tireSkin);
    tR.position.y = -0.5;
    rightGearGroup.add(sR, tR);
    rightGearGroup.position.set(0.8, -0.5, -0.5);
    
    fuselage.add(noseCone, cockpitGlass, wingL, wingR, tailVert, tailHoriz, hub, leftGearGroup, rightGearGroup);
    group.add(fuselage);
    
    return group;
}

function createSpitfire() {
    const group = new THREE.Group();
    const { metalSkin, canopyMat, steelMat, tireSkin } = getMaterials(customSkin);

    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.3, 5.2, 8), metalSkin);
    fuselage.rotation.x = Math.PI / 2;
    fuselage.castShadow = true;
    
    const noseCone = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.4, 8), metalSkin);
    noseCone.rotateX(Math.PI/2);
    noseCone.position.set(0, -0.05, -3.6);
    noseCone.castShadow = true;
    
    const cockpitGlass = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), canopyMat);
    cockpitGlass.position.set(0, 0.7, -0.8);
    cockpitGlass.scale.set(1, 0.8, 1.6);
    
    let wingWidth = 6.2 * customWingspanScale;
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(wingWidth/2, 0.07, 1.2), metalSkin);
    wingL.position.set(-wingWidth/4 - 0.2, 0.05, -0.3);
    wingL.castShadow = true;
    
    const wingR = wingL.clone();
    wingR.position.x = wingWidth/4 + 0.2;
    
    const tailVert = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.2, 0.9), metalSkin);
    tailVert.position.set(0, 0.8, 2.2);
    tailVert.castShadow = true;
    
    const tailHoriz = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.07, 0.35), metalSkin);
    tailHoriz.position.set(0, 0.15, 2.2);
    tailHoriz.castShadow = true;
    
    const hub = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.55, 8), steelMat);
    hub.rotateX(-Math.PI/2);
    hub.position.set(0, 0, -2.7);
    hub.castShadow = true;
    
    const blade = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.12, 0.03), steelMat);
    hub.add(blade);
    propEngineBlades.push(blade);
    
    const strutG = new THREE.CylinderGeometry(0.035, 0.035, 0.9);
    const wheelG = new THREE.CylinderGeometry(0.24, 0.24, 0.12);
    wheelG.rotateZ(Math.PI/2);

    leftGearGroup = new THREE.Group();
    const sL = new THREE.Mesh(strutG, steelMat);
    const tL = new THREE.Mesh(wheelG, tireSkin);
    tL.position.y = -0.45;
    leftGearGroup.add(sL, tL);
    leftGearGroup.position.set(-0.7, -0.45, -0.4);
    
    rightGearGroup = new THREE.Group();
    const sR = new THREE.Mesh(strutG, steelMat);
    const tR = new THREE.Mesh(wheelG, tireSkin);
    tR.position.y = -0.45;
    rightGearGroup.add(sR, tR);
    rightGearGroup.position.set(0.7, -0.45, -0.4);
    
    fuselage.add(noseCone, cockpitGlass, wingL, wingR, tailVert, tailHoriz, hub, leftGearGroup, rightGearGroup);
    group.add(fuselage);
    
    return group;
}

function createPittsSpecial() {
    const group = new THREE.Group();
    const { metalSkin, canopyMat, steelMat, tireSkin } = getMaterials(customSkin);

    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.25, 4.0, 8), metalSkin);
    fuselage.rotation.x = Math.PI / 2;
    fuselage.castShadow = true;
    
    const noseCone = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.0, 8), metalSkin);
    noseCone.rotateX(Math.PI/2);
    noseCone.position.set(0, -0.02, -2.8);
    noseCone.castShadow = true;
    
    const cockpitGlass = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), canopyMat);
    cockpitGlass.position.set(0, 0.6, -0.5);
    cockpitGlass.scale.set(1, 0.7, 1.2);
    
    let wingWidth = 5.0 * customWingspanScale;
    const upperWingL = new THREE.Mesh(new THREE.BoxGeometry(wingWidth/2, 0.05, 0.8), metalSkin);
    upperWingL.position.set(-wingWidth/4 - 0.2, 0.3, -0.2);
    upperWingL.castShadow = true;
    
    const upperWingR = upperWingL.clone();
    upperWingR.position.x = wingWidth/4 + 0.2;
    
    const lowerWingL = new THREE.Mesh(new THREE.BoxGeometry(wingWidth/2, 0.05, 0.8), metalSkin);
    lowerWingL.position.set(-wingWidth/4 - 0.2, -0.1, -0.2);
    lowerWingL.castShadow = true;
    
    const lowerWingR = lowerWingL.clone();
    lowerWingR.position.x = wingWidth/4 + 0.2;
    
    const strut1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4), steelMat);
    strut1.rotation.x = Math.PI/2;
    strut1.position.set(-wingWidth/4 - 0.2, 0.1, -0.2);
    strut1.castShadow = true;
    
    const strut2 = strut1.clone();
    strut2.position.x = wingWidth/4 + 0.2;
    
    const tailVert = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.8, 0.6), metalSkin);
    tailVert.position.set(0, 0.6, 1.8);
    tailVert.castShadow = true;
    
    const tailHoriz = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 0.3), metalSkin);
    tailHoriz.position.set(0, 0.0, 1.8);
    tailHoriz.castShadow = true;
    
    const hub = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 8), steelMat);
    hub.rotateX(-Math.PI/2);
    hub.position.set(0, 0, -2.2);
    hub.castShadow = true;
    
    const blade = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 0.03), steelMat);
    hub.add(blade);
    propEngineBlades.push(blade);
    
    const strutG = new THREE.CylinderGeometry(0.035, 0.035, 0.8);
    const wheelG = new THREE.CylinderGeometry(0.22, 0.22, 0.12);
    wheelG.rotateZ(Math.PI/2);

    leftGearGroup = new THREE.Group();
    const sL = new THREE.Mesh(strutG, steelMat);
    const tL = new THREE.Mesh(wheelG, tireSkin);
    tL.position.y = -0.4;
    leftGearGroup.add(sL, tL);
    leftGearGroup.position.set(-0.6, -0.4, -0.3);
    
    rightGearGroup = new THREE.Group();
    const sR = new THREE.Mesh(strutG, steelMat);
    const tR = new THREE.Mesh(wheelG, tireSkin);
    tR.position.y = -0.4;
    rightGearGroup.add(sR, tR);
    rightGearGroup.position.set(0.6, -0.4, -0.3);
    
    fuselage.add(noseCone, cockpitGlass, upperWingL, upperWingR, lowerWingL, lowerWingR, strut1, strut2, tailVert, tailHoriz, hub, leftGearGroup, rightGearGroup);
    group.add(fuselage);
    
    return group;
}

function createCessna172() {
    const group = new THREE.Group();
    const { metalSkin, canopyMat, steelMat, tireSkin } = getMaterials(customSkin);

    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.35, 4.5, 8), metalSkin);
    fuselage.rotation.x = Math.PI / 2;
    fuselage.castShadow = true;
    
    const noseCone = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.2, 8), metalSkin);
    noseCone.rotateX(Math.PI/2);
    noseCone.position.set(0, -0.05, -3.2);
    noseCone.castShadow = true;
    
    const cockpitGlass = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.6), canopyMat);
    cockpitGlass.position.set(0, 0.5, -1.5);
    
    let wingWidth = 6.0 * customWingspanScale;
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(wingWidth/2, 0.08, 1.0), metalSkin);
    wingL.position.set(-wingWidth/4 - 0.3, 0.6, -0.5);
    wingL.castShadow = true;
    
    const wingR = wingL.clone();
    wingR.position.x = wingWidth/4 + 0.3;
    
    const tailVert = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.0, 0.8), metalSkin);
    tailVert.position.set(0, 1.0, 2.0);
    tailVert.castShadow = true;
    
    const tailHoriz = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.3), metalSkin);
    tailHoriz.position.set(0, 1.0, 2.0);
    tailHoriz.castShadow = true;
    
    const hub = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 8), steelMat);
    hub.rotateX(-Math.PI/2);
    hub.position.set(0, 0, -2.5);
    hub.castShadow = true;
    
    const blade = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 0.03), steelMat);
    hub.add(blade);
    propEngineBlades.push(blade);
    
    const strutG = new THREE.CylinderGeometry(0.04, 0.04, 0.9);
    const wheelG = new THREE.CylinderGeometry(0.22, 0.22, 0.14);
    wheelG.rotateZ(Math.PI/2);

    leftGearGroup = new THREE.Group();
    const sL = new THREE.Mesh(strutG, steelMat);
    const tL = new THREE.Mesh(wheelG, tireSkin);
    tL.position.y = -0.45;
    leftGearGroup.add(sL, tL);
    leftGearGroup.position.set(-0.7, -0.45, -0.3);
    
    rightGearGroup = new THREE.Group();
    const sR = new THREE.Mesh(strutG, steelMat);
    const tR = new THREE.Mesh(wheelG, tireSkin);
    tR.position.y = -0.45;
    rightGearGroup.add(sR, tR);
    rightGearGroup.position.set(0.7, -0.45, -0.3);
    
    const noseGear = new THREE.Group();
    const ns = new THREE.Mesh(strutG, steelMat);
    const nt = new THREE.Mesh(wheelG, tireSkin);
    nt.position.y = -0.45;
    noseGear.add(ns, nt);
    noseGear.position.set(0, -0.45, -2.0);
    
    fuselage.add(noseCone, cockpitGlass, wingL, wingR, tailVert, tailHoriz, hub, leftGearGroup, rightGearGroup, noseGear);
    group.add(fuselage);
    
    return group;
}

function createA10Thunderbolt() {
    const group = new THREE.Group();
    const { metalSkin, canopyMat, steelMat, tireSkin } = getMaterials(customSkin);

    const fuselage = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, 7.0), metalSkin);
    fuselage.castShadow = true;
    
    const noseCone = new THREE.Mesh(new THREE.ConeGeometry(0.75, 2.5, 4), metalSkin);
    noseCone.rotateX(Math.PI/2);
    noseCone.position.set(0, -0.1, -4.5);
    noseCone.castShadow = true;
    
    const cockpitGlass = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.4, 1.2), canopyMat);
    cockpitGlass.position.set(0, 0.6, -2.0);
    
    let wingWidth = 8.5 * customWingspanScale;
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(wingWidth/2, 0.1, 2.5), metalSkin);
    wingL.position.set(-wingWidth/4 - 0.8, -0.1, 0.0);
    wingL.castShadow = true;
    
    const wingR = new THREE.Mesh(new THREE.BoxGeometry(wingWidth/2, 0.1, 2.5), metalSkin);
    wingR.position.set(wingWidth/4 + 0.8, -0.1, 0.0);
    wingR.castShadow = true;
    
    const finL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 1.0), metalSkin);
    finL.position.set(-0.8, 0.8, 3.0);
    finL.castShadow = true;
    
    const finR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 1.0), metalSkin);
    finR.position.set(0.8, 0.8, 3.0);
    finR.castShadow = true;
    
    const portL = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.8, 12), steelMat);
    portL.rotation.x = Math.PI/2;
    portL.position.set(-wingWidth/4 - 0.8, -0.2, 1.0);
    portL.castShadow = true;
    
    const portR = portL.clone();
    portR.position.x = wingWidth/4 + 0.8;
    
    const torchG = new THREE.ConeGeometry(0.2, 2.5, 8);
    torchG.rotateX(-Math.PI/2);
    leftExhaustGlow = new THREE.Mesh(torchG, new THREE.MeshBasicMaterial({ color: 0x3388ff, transparent: true, opacity: 0.75 }));
    leftExhaustGlow.position.z = 1.3;
    rightExhaustGlow = leftExhaustGlow.clone();
    portL.add(leftExhaustGlow);
    portR.add(rightExhaustGlow);
    leftExhaustGlow.visible = false;
    rightExhaustGlow.visible = false;
    
    const cannon = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 2.0, 12), steelMat);
    cannon.rotation.x = Math.PI/2;
    cannon.position.set(0, -0.25, -4.0);
    cannon.castShadow = true;
    
    const strutG = new THREE.CylinderGeometry(0.06, 0.06, 1.2);
    const wheelG = new THREE.CylinderGeometry(0.3, 0.3, 0.2);
    wheelG.rotateZ(Math.PI/2);

    leftGearGroup = new THREE.Group();
    const sL = new THREE.Mesh(strutG, steelMat);
    const tL = new THREE.Mesh(wheelG, tireSkin);
    tL.position.y = -0.6;
    leftGearGroup.add(sL, tL);
    leftGearGroup.position.set(-1.2, -0.7, 0.5);
    
    rightGearGroup = new THREE.Group();
    const sR = new THREE.Mesh(strutG, steelMat);
    const tR = new THREE.Mesh(wheelG, tireSkin);
    tR.position.y = -0.6;
    rightGearGroup.add(sR, tR);
    rightGearGroup.position.set(1.2, -0.7, 0.5);
    
    fuselage.add(noseCone, cockpitGlass, wingL, wingR, finL, finR, portL, portR, cannon, leftGearGroup, rightGearGroup);
    group.add(fuselage);
    
    return group;
}

function createConcorde() {
    const group = new THREE.Group();
    const { metalSkin, canopyMat, steelMat, tireSkin } = getMaterials(customSkin);

    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.4, 12.0, 16), metalSkin);
    fuselage.rotation.x = Math.PI / 2;
    fuselage.castShadow = true;
    
    const noseCone = new THREE.Mesh(new THREE.ConeGeometry(0.5, 3.0, 8), metalSkin);
    noseCone.rotateX(Math.PI/2);
    noseCone.position.set(0, -0.05, -7.0);
    noseCone.castShadow = true;
    
    const cockpitGlass = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.8), canopyMat);
    cockpitGlass.position.set(0, 0.5, -5.0);
    
    let wingWidth = 9.0 * customWingspanScale;
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(wingWidth/2, 0.08, 3.0), metalSkin);
    wingL.position.set(-wingWidth/4 - 0.5, -0.1, -1.0);
    wingL.rotation.y = 0.1;
    wingL.castShadow = true;
    
    const wingR = wingL.clone();
    wingR.position.x = wingWidth/4 + 0.5;
    wingR.rotation.y = -0.1;
    
    const tailHoriz = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 0.5), metalSkin);
    tailHoriz.position.set(0, 0.0, 4.5);
    tailHoriz.castShadow = true;
    
    let spacing = wingWidth * 0.25;
    let podPositions = [-spacing*1.5, -spacing*0.5, spacing*0.5, spacing*1.5];
    podPositions.forEach(posX => {
        const enginePod = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.5, 10), steelMat);
        enginePod.rotation.x = Math.PI / 2;
        enginePod.position.set(posX, -0.2, -0.5);
        enginePod.castShadow = true;
        
        const torchG = new THREE.ConeGeometry(0.18, 2.0, 8);
        torchG.rotateX(-Math.PI/2);
        const exhaust = new THREE.Mesh(torchG, new THREE.MeshBasicMaterial({ color: 0x3388ff, transparent: true, opacity: 0.75 }));
        exhaust.position.z = 1.0;
        enginePod.add(exhaust);
        
        fuselage.add(enginePod);
    });
    
    const strutG = new THREE.CylinderGeometry(0.05, 0.05, 1.1);
    const wheelG = new THREE.CylinderGeometry(0.26, 0.26, 0.16);
    wheelG.rotateZ(Math.PI/2);

    leftGearGroup = new THREE.Group();
    const sL = new THREE.Mesh(strutG, steelMat);
    const tL = new THREE.Mesh(wheelG, tireSkin);
    tL.position.y = -0.55;
    leftGearGroup.add(sL, tL);
    leftGearGroup.position.set(-1.0, -0.6, -2.0);
    
    rightGearGroup = new THREE.Group();
    const sR = new THREE.Mesh(strutG, steelMat);
    const tR = new THREE.Mesh(wheelG, tireSkin);
    tR.position.y = -0.55;
    rightGearGroup.add(sR, tR);
    rightGearGroup.position.set(1.0, -0.6, -2.0);
    
    fuselage.add(noseCone, cockpitGlass, wingL, wingR, tailHoriz, leftGearGroup, rightGearGroup);
    group.add(fuselage);
    
    return group;
}

function createSR71Blackbird() {
    const group = new THREE.Group();
    const { metalSkin, canopyMat, steelMat, tireSkin } = getMaterials(customSkin);

    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.3, 10.0, 16), metalSkin);
    fuselage.rotation.x = Math.PI / 2;
    fuselage.castShadow = true;
    
    const noseCone = new THREE.Mesh(new THREE.ConeGeometry(0.4, 4.0, 8), metalSkin);
    noseCone.rotateX(Math.PI/2);
    noseCone.position.set(0, -0.05, -6.0);
    noseCone.castShadow = true;
    
    const cockpitGlass = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.6), canopyMat);
    cockpitGlass.position.set(0, 0.4, -3.5);
    
    let wingWidth = 7.5 * customWingspanScale;
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(wingWidth/2, 0.06, 2.0), metalSkin);
    wingL.position.set(-wingWidth/4 - 0.4, -0.1, -0.5);
    wingL.rotation.y = 0.2;
    wingL.castShadow = true;
    
    const wingR = wingL.clone();
    wingR.position.x = wingWidth/4 + 0.4;
    wingR.rotation.y = -0.2;
    
    const tailVert = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.0, 1.0), metalSkin);
    tailVert.position.set(0, 0.6, 3.5);
    tailVert.castShadow = true;
    
    const portL = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.2, 12), steelMat);
    portL.rotation.x = Math.PI/2;
    portL.position.set(-0.4, -0.1, 2.5);
    portL.castShadow = true;
    
    const portR = portL.clone();
    portR.position.x = 0.4;
    
    const torchG = new THREE.ConeGeometry(0.2, 3.0, 8);
    torchG.rotateX(-Math.PI/2);
    leftExhaustGlow = new THREE.Mesh(torchG, new THREE.MeshBasicMaterial({ color: 0x3388ff, transparent: true, opacity: 0.75 }));
    leftExhaustGlow.position.z = 1.5;
    rightExhaustGlow = leftExhaustGlow.clone();
    portL.add(leftExhaustGlow);
    portR.add(rightExhaustGlow);
    leftExhaustGlow.visible = false;
    rightExhaustGlow.visible = false;
    
    const strutG = new THREE.CylinderGeometry(0.04, 0.04, 1.0);
    const wheelG = new THREE.CylinderGeometry(0.24, 0.24, 0.14);
    wheelG.rotateZ(Math.PI/2);

    leftGearGroup = new THREE.Group();
    const sL = new THREE.Mesh(strutG, steelMat);
    const tL = new THREE.Mesh(wheelG, tireSkin);
    tL.position.y = -0.5;
    leftGearGroup.add(sL, tL);
    leftGearGroup.position.set(-0.8, -0.5, 0.5);
    
    rightGearGroup = new THREE.Group();
    const sR = new THREE.Mesh(strutG, steelMat);
    const tR = new THREE.Mesh(wheelG, tireSkin);
    tR.position.y = -0.5;
    rightGearGroup.add(sR, tR);
    rightGearGroup.position.set(0.8, -0.5, 0.5);
    
    fuselage.add(noseCone, cockpitGlass, wingL, wingR, tailVert, portL, portR, leftGearGroup, rightGearGroup);
    group.add(fuselage);
    
    return group;
}

// Main aircraft manufacturing function
function manufactureAircraft() {
    while (aircraftGroup.children.length > 0) { 
        aircraftGroup.remove(aircraftGroup.children[0]); 
    }
    propEngineBlades = [];

    let aircraft;
    switch(selectedType) {
        case 'f22': aircraft = createF22Raptor(); break;
        case 'su57': aircraft = createSu57Felon(); break;
        case 'f16': aircraft = createF16FightingFalcon(); break;
        case 'b747': aircraft = createB747(); break;
        case 'a380': aircraft = createA380(); break;
        case 'c130': aircraft = createC130Hercules(); break;
        case 'p51': aircraft = createP51Mustang(); break;
        case 'spitfire': aircraft = createSpitfire(); break;
        case 'pitts': aircraft = createPittsSpecial(); break;
        case 'cessna172': aircraft = createCessna172(); break;
        case 'a10': aircraft = createA10Thunderbolt(); break;
        case 'concorde': aircraft = createConcorde(); break;
        case 'sr71': aircraft = createSR71Blackbird(); break;
        default: aircraft = createF22Raptor(); break;
    }
    
    aircraftGroup.add(aircraft);
}
