import React, { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { PORTFOLIO_ARTIFACTS } from "./portfolioData.js";
import "./styles.css";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function makePanelTexture({ title, kicker, lines, accent = "#38d5ff" }) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 640;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(4, 10, 16, 0.78)";
  ctx.strokeStyle = "rgba(125, 222, 255, 0.72)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(28, 28, canvas.width - 56, canvas.height - 56, 26);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 178, 63, 0.62)";
  ctx.beginPath();
  ctx.moveTo(78, 118);
  ctx.lineTo(360, 118);
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.font = "700 36px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillText(kicker.toUpperCase(), 78, 96);

  ctx.fillStyle = "#f3f8fb";
  ctx.font = "900 108px Inter, system-ui, sans-serif";
  ctx.fillText(title, 78, 232);

  ctx.fillStyle = "rgba(222, 238, 247, 0.86)";
  ctx.font = "500 43px Inter, system-ui, sans-serif";
  lines.forEach((line, index) => {
    ctx.fillText(line, 82, 330 + index * 64);
  });

  return new THREE.CanvasTexture(canvas);
}

function makePanel(config, position, scale = 1) {
  const texture = makePanelTexture(config);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3.75 * scale, 2 * scale), material);
  mesh.position.copy(position);
  mesh.userData.base = position.clone();
  mesh.userData.revealed = false;
  mesh.userData.active = false;
  mesh.userData.texture = texture;
  return mesh;
}

function artifactCopy(artifact, index) {
  const rawLines = artifact.lines ?? artifact.evidenceLines ?? artifact.highlights ?? artifact.details ?? artifact.description ?? [];
  const authoredLines = (Array.isArray(rawLines) ? rawLines : [rawLines])
    .flatMap((line) => (typeof line === "string" ? line.split(/\n|(?<=[.!?])\s+/) : []))
    .filter((line) => line && !line.toLowerCase().startsWith("authoring placeholder"));
  const lines = [artifact.subtitle, ...authoredLines]
    .filter(Boolean)
    .slice(0, 3);
  return {
    kicker: artifact.kicker ?? artifact.shortLabel ?? artifact.category ?? artifact.artifactType ?? `artifact ${index + 1}`,
    title: artifact.title ?? artifact.name ?? artifact.label ?? `Artifact ${index + 1}`,
    lines,
    accent: artifact.accent ?? artifact.signalColor ?? artifact.color ?? "#56c7d9",
  };
}

function makeLabelTexture(text, accent = "#d7e1e5") {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 160;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#182126";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, 18, canvas.height);
  ctx.fillStyle = "#eef3f4";
  ctx.font = "700 46px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textBaseline = "middle";
  ctx.fillText(String(text).toUpperCase().slice(0, 25), 48, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function RobotArmGame() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x02070d, 7, 21);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(5.2, 4.35, 8.6);
    camera.lookAt(0, 1.45, 1.1);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x02070d, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    mount.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const environmentRenderTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = environmentRenderTarget.texture;

    scene.add(new THREE.HemisphereLight(0xc8d8de, 0x182127, 0.48));

    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(4.5, 8, 5.5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 18;
    key.shadow.camera.left = -7;
    key.shadow.camera.right = 7;
    key.shadow.camera.top = 7;
    key.shadow.camera.bottom = -7;
    const rim = new THREE.PointLight(0x8cc9d2, 8, 18);
    rim.position.set(-4.5, 3.4, 4);
    const ember = new THREE.PointLight(0xffb45c, 7, 16);
    ember.position.set(4.5, 2.6, -2.5);
    scene.add(key, rim, ember);

    const grid = new THREE.GridHelper(22, 44, 0x6f939b, 0x243339);
    grid.material.transparent = true;
    grid.material.opacity = 0.23;
    scene.add(grid);

    const workPlane = new THREE.Mesh(
      new THREE.BoxGeometry(7.8, 0.18, 5.4),
      new THREE.MeshStandardMaterial({
        color: 0x0a121a,
        metalness: 0.42,
        roughness: 0.68,
      }),
    );
    workPlane.position.set(0, 0.22, 1.4);
    workPlane.receiveShadow = true;
    scene.add(workPlane);

    const backRail = new THREE.Mesh(
      new THREE.BoxGeometry(7.5, 0.12, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x566269, metalness: 0.72, roughness: 0.32 }),
    );
    backRail.position.set(0, 0.58, -1.18);
    const controlBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.62, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x263238, metalness: 0.44, roughness: 0.48 }),
    );
    controlBox.position.set(3.15, 0.64, -0.85);
    const eStop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.12, 24),
      new THREE.MeshStandardMaterial({ color: 0xb9322d, roughness: 0.3 }),
    );
    eStop.position.set(3.15, 1.01, -0.84);
    scene.add(backRail, controlBox, eStop);

    const arena = new THREE.Mesh(
      new THREE.RingGeometry(2.2, 6.9, 128),
      new THREE.MeshStandardMaterial({
        color: 0x08131d,
        metalness: 0.46,
        roughness: 0.7,
        transparent: true,
        opacity: 0.76,
      }),
    );
    arena.rotation.x = -Math.PI / 2;
    arena.position.y = -0.03;
    scene.add(arena);

    const metal = new THREE.MeshStandardMaterial({
      color: 0xaab9c8,
      metalness: 0.78,
      roughness: 0.28,
    });
    const blue = new THREE.MeshStandardMaterial({
      color: 0x109bd1,
      emissive: 0x06374b,
      emissiveIntensity: 0.78,
      metalness: 0.42,
      roughness: 0.24,
    });
    const amber = new THREE.MeshStandardMaterial({
      color: 0xffb23f,
      emissive: 0x733800,
      emissiveIntensity: 0.62,
      metalness: 0.24,
      roughness: 0.24,
    });
    const graphite = new THREE.MeshStandardMaterial({
      color: 0x101923,
      metalness: 0.9,
      roughness: 0.3,
    });
    const rubber = new THREE.MeshStandardMaterial({
      color: 0x05090d,
      metalness: 0.35,
      roughness: 0.62,
    });
    const cableMat = new THREE.MeshStandardMaterial({
      color: 0x071015,
      metalness: 0.18,
      roughness: 0.55,
    });
    const boltMat = new THREE.MeshStandardMaterial({
      color: 0xd8e3ea,
      metalness: 0.86,
      roughness: 0.22,
    });

    const makeBolt = (radius = 0.045, depth = 0.028) =>
      new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, depth, 6), boltMat);

    const addBoltRing = (group, count, ringRadius, y, face = "top") => {
      for (let index = 0; index < count; index += 1) {
        const angle = (index / count) * Math.PI * 2;
        const bolt = makeBolt();
        bolt.position.set(Math.cos(angle) * ringRadius, y, Math.sin(angle) * ringRadius);
        bolt.rotation.x = Math.PI / 2;
        if (face === "side") bolt.rotation.z = Math.PI / 2;
        group.add(bolt);
      }
    };

    const makeLinkShell = (length, bottomRadius, topRadius, material) => {
      const shell = new THREE.Mesh(
        new THREE.CylinderGeometry(topRadius, bottomRadius, length, 28, 1, false),
        material,
      );
      shell.position.y = length / 2;
      return shell;
    };

    const addTwinRails = (group, length, width, yOffset, material) => {
      [-1, 1].forEach((side) => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.13, length, 0.18), material);
        rail.position.set(side * width, yOffset + length / 2, 0);
        group.add(rail);
      });
    };

    const addCable = (group, points) => {
      const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
      const cable = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.025, 8, false), cableMat);
      group.add(cable);
      return cable;
    };

    const makeDataModule = (artifact, position, panel, index) => {
      const copy = artifactCopy(artifact, index);
      const color = new THREE.Color(artifact.color ?? artifact.signalColor ?? copy.accent);
      const accent = new THREE.Color(artifact.accent ?? artifact.signalColor ?? copy.accent);
      const artifactType = String(artifact.artifactType ?? artifact.type ?? "module").toLowerCase();
      const group = new THREE.Group();
      group.position.copy(position);
      group.userData.home = position.clone();
      group.userData.panel = panel;
      group.userData.scanned = false;
      group.userData.floatOffset = Math.random() * Math.PI * 2;
      group.userData.artifact = artifact;
      group.userData.artifactType = artifactType;

      const shellMat = new THREE.MeshStandardMaterial({
        color: 0x111a22,
        metalness: 0.62,
        roughness: 0.34,
      });
      const accentMat = new THREE.MeshStandardMaterial({
        color: accent,
        emissive: accent,
        emissiveIntensity: 0.55,
        metalness: 0.2,
        roughness: 0.2,
      });
      const windowMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.42,
        metalness: 0.2,
        roughness: 0.18,
      });

      let bodyGeometry;
      if (/code|software|web/.test(artifactType)) bodyGeometry = new THREE.BoxGeometry(0.82, 0.22, 0.96);
      else if (/robot|hardware|mech/.test(artifactType)) bodyGeometry = new THREE.CylinderGeometry(0.45, 0.45, 0.3, 8);
      else if (/design|cad|prototype/.test(artifactType)) bodyGeometry = new THREE.OctahedronGeometry(0.5, 0);
      else if (/research|document|resume/.test(artifactType)) bodyGeometry = new THREE.BoxGeometry(0.68, 0.16, 1.04);
      else bodyGeometry = [
        new THREE.BoxGeometry(0.82, 0.22, 0.96),
        new THREE.CylinderGeometry(0.45, 0.45, 0.3, 8),
        new THREE.OctahedronGeometry(0.5, 0),
        new THREE.BoxGeometry(0.68, 0.16, 1.04),
      ][index % 4];
      const body = new THREE.Mesh(bodyGeometry, shellMat);
      body.position.y = 0.15;
      const windowGeometry = index % 4 === 1
        ? new THREE.CylinderGeometry(0.24, 0.24, 0.04, 24)
        : new THREE.BoxGeometry(index % 4 === 3 ? 0.42 : 0.48, 0.035, index % 4 === 3 ? 0.68 : 0.48);
      const window = new THREE.Mesh(windowGeometry, windowMat);
      window.position.set(0, index % 4 === 2 ? 0.55 : 0.32, 0.05);
      const spine = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.96), accentMat);
      spine.position.set(-0.37, 0.34, 0);
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.028, 8, 36), graphite);
      handle.rotation.x = Math.PI / 2;
      handle.position.set(0.38, 0.26, 0.34);
      const feet = [-0.24, 0.24].map((x) => {
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.18), rubber);
        foot.position.set(x, -0.05, -0.32);
        return foot;
      });
      const beacon = new THREE.PointLight(accent, 1.4, 2.6);
      beacon.position.y = 0.35;
      const labelTexture = makeLabelTexture(copy.title, copy.accent);
      const label = new THREE.Mesh(
        new THREE.PlaneGeometry(0.58, 0.12),
        new THREE.MeshBasicMaterial({ map: labelTexture, side: THREE.DoubleSide }),
      );
      label.position.set(0, 0.18, 0.48);
      label.rotation.x = -Math.PI / 2;
      group.userData.labelTexture = labelTexture;
      group.add(body, window, spine, handle, ...feet, beacon, label);
      group.traverse((object) => {
        object.castShadow = true;
        object.receiveShadow = true;
        object.userData.moduleRoot = group;
      });
      return group;
    };

    const scanner = new THREE.Group();
    scanner.position.set(-1.55, 0.32, 2.35);
    scene.add(scanner);
    const scannerBase = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.12, 0.22, 64), graphite);
    scannerBase.position.y = 0.11;
    const scannerWell = new THREE.Mesh(
      new THREE.CylinderGeometry(0.62, 0.72, 0.18, 64),
      new THREE.MeshStandardMaterial({
        color: 0x07131c,
        emissive: 0x082f40,
        emissiveIntensity: 0.35,
        metalness: 0.58,
        roughness: 0.36,
      }),
    );
    scannerWell.position.y = 0.34;
    const scannerBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.74, 1.9, 48, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0x38d5ff,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    scannerBeam.position.y = 1.2;
    const scannerRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.78, 0.028, 8, 88),
      new THREE.MeshBasicMaterial({ color: 0x38d5ff, transparent: true, opacity: 0.78 }),
    );
    scannerRing.rotation.x = Math.PI / 2;
    scannerRing.position.y = 0.48;
    const scannerGate = new THREE.Mesh(
      new THREE.BoxGeometry(1.28, 0.82, 1.28),
      new THREE.MeshBasicMaterial({ color: 0x7fced5, wireframe: true, transparent: true, opacity: 0.1 }),
    );
    scannerGate.position.y = 0.82;
    const scannerLabelTexture = makeLabelTexture("SCAN / ALIGN", "#8fd6d9");
    const scannerLabel = new THREE.Mesh(
      new THREE.PlaneGeometry(1.18, 0.25),
      new THREE.MeshBasicMaterial({ map: scannerLabelTexture, side: THREE.DoubleSide }),
    );
    scannerLabel.position.set(0, 0.38, 0.92);
    scannerLabel.rotation.x = -Math.PI / 5;
    scanner.add(scannerBase, scannerWell, scannerBeam, scannerRing, scannerGate, scannerLabel);
    scanner.traverse((object) => {
      object.castShadow = true;
      object.receiveShadow = true;
    });

    const base = new THREE.Group();
    scene.add(base);

    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.55, 0.48, 64), graphite);
    pedestal.position.y = 0.24;
    base.add(pedestal);
    addBoltRing(base, 14, 1.18, 0.5);

    const turntable = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.3, 64), metal);
    turntable.position.y = 0.64;
    base.add(turntable);
    const bearing = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.035, 10, 80), amber);
    bearing.position.y = 0.8;
    bearing.rotation.x = Math.PI / 2;
    base.add(bearing);

    const shoulder = new THREE.Group();
    shoulder.position.y = 0.84;
    base.add(shoulder);
    const shoulderMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.86, 48), graphite);
    shoulderMotor.rotation.z = Math.PI / 2;
    shoulder.add(shoulderMotor);
    const shoulderCapA = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.1, 48), graphite);
    shoulderCapA.rotation.z = Math.PI / 2;
    shoulderCapA.position.x = -0.48;
    const shoulderCapB = shoulderCapA.clone();
    shoulderCapB.position.x = 0.48;
    const shoulderTrimA = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.022, 8, 64), amber);
    shoulderTrimA.rotation.y = Math.PI / 2;
    shoulderTrimA.position.x = -0.54;
    const shoulderTrimB = shoulderTrimA.clone();
    shoulderTrimB.position.x = 0.54;
    shoulder.add(shoulderCapA, shoulderCapB);
    shoulder.add(shoulderTrimA, shoulderTrimB);
    addBoltRing(shoulderCapA, 8, 0.34, 0, "side");
    addBoltRing(shoulderCapB, 8, 0.34, 0, "side");

    const upper = new THREE.Group();
    shoulder.add(upper);
    const upperArm = makeLinkShell(2.62, 0.34, 0.27, blue);
    upperArm.position.y = 1.38;
    upperArm.scale.x = 0.82;
    upperArm.scale.z = 0.62;
    upper.add(upperArm);
    addTwinRails(upper, 2.45, 0.43, 0.18, graphite);
    addCable(upper, [
      [-0.34, 0.2, -0.28],
      [-0.58, 0.95, -0.34],
      [-0.5, 1.85, -0.31],
      [-0.28, 2.54, -0.26],
    ]);

    const elbow = new THREE.Group();
    elbow.position.y = 2.76;
    upper.add(elbow);
    const elbowMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.78, 48), amber);
    elbowMotor.rotation.z = Math.PI / 2;
    elbow.add(elbowMotor);
    const elbowRing = new THREE.Mesh(new THREE.TorusGeometry(0.39, 0.026, 8, 64), boltMat);
    elbowRing.rotation.y = Math.PI / 2;
    elbow.add(elbowRing);

    const forearm = new THREE.Group();
    elbow.add(forearm);
    const lowerArm = makeLinkShell(2.04, 0.25, 0.19, metal);
    lowerArm.position.y = 1.09;
    lowerArm.scale.x = 0.86;
    lowerArm.scale.z = 0.62;
    forearm.add(lowerArm);
    addTwinRails(forearm, 1.86, 0.31, 0.16, graphite);
    addCable(forearm, [
      [0.25, 0.1, -0.23],
      [0.46, 0.66, -0.28],
      [0.42, 1.38, -0.23],
      [0.21, 1.98, -0.18],
    ]);

    const wrist = new THREE.Group();
    wrist.position.y = 2.18;
    forearm.add(wrist);
    const wristMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.58, 36), blue);
    wristMotor.rotation.z = Math.PI / 2;
    const wristCollar = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.026, 8, 60), amber);
    wristCollar.rotation.y = Math.PI / 2;
    wrist.add(wristMotor, wristCollar);

    const toolBase = new THREE.Group();
    toolBase.position.y = 0.34;
    wrist.add(toolBase);
    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.28, 0.5), graphite);
    palm.position.y = 0.04;
    toolBase.add(palm);
    const fingerPivots = [];
    [-1, 1].forEach((side) => {
      const fingerPivot = new THREE.Group();
      fingerPivot.position.set(side * 0.28, 0.23, 0.2);
      fingerPivot.userData.side = side;
      fingerPivots.push(fingerPivot);
      const knuckle = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.22, 20), amber);
      knuckle.rotation.x = Math.PI / 2;
      const finger = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.74, 0.13), metal);
      finger.position.set(0, 0.36, 0.09);
      const fingerTip = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.3, 0.13), graphite);
      fingerTip.position.set(side * 0.055, 0.76, 0.1);
      fingerTip.rotation.z = side * 0.16;
      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.15), rubber);
      pad.position.set(side * 0.08, 0.91, 0.14);
      fingerPivot.add(knuckle, finger, fingerTip, pad);
      toolBase.add(fingerPivot);
    });
    const gripSocket = new THREE.Object3D();
    gripSocket.position.set(0, 1.08, 0.34);
    toolBase.add(gripSocket);

    const target = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 24, 16),
      new THREE.MeshStandardMaterial({
        color: 0x78f2ff,
        emissive: 0x23dfff,
        emissiveIntensity: 1.5,
      }),
    );
    scene.add(target);

    const targetRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.012, 10, 96),
      new THREE.MeshBasicMaterial({ color: 0x5bf3ff, transparent: true, opacity: 0.8 }),
    );
    targetRing.rotation.x = Math.PI / 2;
    scene.add(targetRing);

    const mouseTarget = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.012, 8, 64),
      new THREE.MeshBasicMaterial({
        color: 0xffd27a,
        transparent: true,
        opacity: 0.86,
        depthWrite: false,
      }),
    );
    mouseTarget.rotation.x = Math.PI / 2;
    scene.add(mouseTarget);

    const aimLineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(),
      new THREE.Vector3(),
    ]);
    const aimLine = new THREE.Line(
      aimLineGeometry,
      new THREE.LineBasicMaterial({
        color: 0xffd27a,
        transparent: true,
        opacity: 0.42,
      }),
    );
    scene.add(aimLine);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x38d5ff,
      transparent: true,
      opacity: 0.34,
    });
    const tracePoints = Array.from({ length: 64 }, () => new THREE.Vector3());
    const traceGeometry = new THREE.BufferGeometry().setFromPoints(tracePoints);
    const trace = new THREE.Line(traceGeometry, lineMaterial);
    scene.add(trace);

    const artifacts = PORTFOLIO_ARTIFACTS.slice(0, 4);
    const panelPositions = [
      new THREE.Vector3(-3.4, 3.15, -2.3),
      new THREE.Vector3(3.55, 2.72, -1.75),
      new THREE.Vector3(-3.95, 1.65, 1.15),
      new THREE.Vector3(3.55, 1.35, 1.35),
    ];
    const panels = artifacts.map((artifact, index) =>
      makePanel(artifactCopy(artifact, index), panelPositions[index], [1.06, 0.9, 0.82, 0.78][index]),
    );
    panels.forEach((panel) => scene.add(panel));

    const modulePositions = [
      new THREE.Vector3(-2.9, 0.72, 1.9),
      new THREE.Vector3(2.55, 0.72, 2.25),
      new THREE.Vector3(-2.55, 0.72, 0.42),
      new THREE.Vector3(2.5, 0.72, 0.58),
    ];
    const dataModules = artifacts.map((artifact, index) =>
      makeDataModule(artifact, modulePositions[index], panels[index], index),
    );
    dataModules.forEach((module) => scene.add(module));
    scene.traverse((object) => {
      if (object.isMesh && object.material?.isMeshStandardMaterial) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    const desired = new THREE.Vector3(0.9, 2.35, 0.8);
    const tracked = desired.clone();
    const ikTarget = desired.clone();
    const velocity = new THREE.Vector3();
    const error = new THREE.Vector3();
    const acceleration = new THREE.Vector3();
    const pointer = new THREE.Vector2(0.18, 0.04);
    const pointerWorld = new THREE.Vector3(0.5, 1.36, 1.4);
    const raycaster = new THREE.Raycaster();
    const dragPlane = new THREE.Plane();
    const dragPlaneAnchor = pointerWorld.clone();
    const dragPlaneNormal = new THREE.Vector3();
    const dragHit = new THREE.Vector3();
    const dragOffset = new THREE.Vector3();
    const tcpWorld = new THREE.Vector3();
    const wristWorld = new THREE.Vector3();
    const tcpOffset = new THREE.Vector3();
    const moduleWorld = new THREE.Vector3();
    const scannerCenter = new THREE.Vector3(-1.55, 1.02, 2.35);
    const scannerTcpTarget = new THREE.Vector3(-1.55, 1.48, 2.35);
    const acceptedModuleTarget = new THREE.Vector3(-1.55, 0.68, 2.35);
    const scannedModuleTarget = new THREE.Vector3();
    const scannedScale = new THREE.Vector3(0.55, 0.55, 0.55);
    const approachOffset = new THREE.Vector3(0, 0.48, 0);
    const scannerVolume = new THREE.Box3(
      new THREE.Vector3(-2.13, 0.58, 1.77),
      new THREE.Vector3(-0.97, 1.46, 2.93),
    );
    const upperLength = 2.76;
    const lowerLength = 2.18;
    const contactThreshold = 0.11;
    const interaction = { state: "idle", module: null, elapsed: 0, pointerHeld: false };
    let activePanel = null;

    let frame = 0;
    let animationId = 0;
    let lastTime = performance.now();

    const setSize = () => {
      const { width, height } = mount.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };

    const updatePointer = (event) => {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    };

    const updatePointerWorld = () => {
      raycaster.setFromCamera(pointer, camera);
      camera.getWorldDirection(dragPlaneNormal);
      dragPlane.setFromNormalAndCoplanarPoint(dragPlaneNormal, dragPlaneAnchor);
      if (raycaster.ray.intersectPlane(dragPlane, dragHit)) {
        pointerWorld.set(
          clamp(dragHit.x, -3.35, 3.35),
          clamp(dragHit.y, 0.84, 2.55),
          clamp(dragHit.z, -0.2, 2.85),
        );
      }
    };

    const updateTouch = (event) => {
      if (event.touches[0]) updatePointer(event.touches[0]);
    };

    const beginInteraction = (event) => {
      updatePointer(event);
      if (interaction.state !== "idle") return;
      raycaster.setFromCamera(pointer, camera);
      const pickables = dataModules
        .filter((module) => !module.userData.scanned)
        .flatMap((module) => module.children);
      const [hit] = raycaster.intersectObjects(pickables, true);
      let picked = hit?.object.userData.moduleRoot;

      if (picked) {
        mount.setPointerCapture?.(event.pointerId);
        interaction.module = picked;
        interaction.state = "approach";
        interaction.elapsed = 0;
        interaction.pointerHeld = true;
        picked.userData.grabbed = true;
        picked.getWorldPosition(moduleWorld);
        dragPlaneAnchor.copy(moduleWorld).add(approachOffset);
        pointerWorld.copy(dragPlaneAnchor);
        dragOffset.set(0, 0, 0);
        velocity.set(0, 0, 0);
      }
    };

    const requestRelease = () => {
      if (interaction.state === "idle") return;
      interaction.pointerHeld = false;
      if (interaction.state === "carry" || interaction.state === "insert") {
        interaction.state = "release";
        interaction.elapsed = 0;
      } else if (interaction.state === "approach" || interaction.state === "close") {
        interaction.module.userData.grabbed = false;
        interaction.module = null;
        interaction.state = "idle";
        interaction.elapsed = 0;
      }
    };

    const solveArm = () => {
      const baseHeight = 0.84;
      const radius = Math.hypot(tracked.x, tracked.z);
      const vertical = tracked.y - baseHeight;
      const reach = clamp(Math.hypot(radius, vertical), 0.44, upperLength + lowerLength - 0.05);
      const yaw = Math.atan2(tracked.x, tracked.z);
      const shoulderTerm =
        (upperLength * upperLength + reach * reach - lowerLength * lowerLength) /
        (2 * upperLength * reach);
      const elbowTerm =
        (upperLength * upperLength + lowerLength * lowerLength - reach * reach) /
        (2 * upperLength * lowerLength);
      const shoulderAngle = Math.atan2(radius, vertical) - Math.acos(clamp(shoulderTerm, -1, 1));
      const elbowAngle = Math.PI - Math.acos(clamp(elbowTerm, -1, 1));

      base.rotation.y += (yaw - base.rotation.y) * 0.18;
      upper.rotation.x += (shoulderAngle - upper.rotation.x) * 0.2;
      forearm.rotation.x += (elbowAngle - forearm.rotation.x) * 0.22;
      wrist.rotation.x = -(upper.rotation.x + forearm.rotation.x) * 0.55;
      wrist.rotation.z = Math.sin(frame * 0.04) * 0.18;
    };

    const animate = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.04);
      lastTime = now;
      frame += 1;
      interaction.elapsed += dt;
      updatePointerWorld();

      scene.updateMatrixWorld(true);
      gripSocket.getWorldPosition(tcpWorld);
      wrist.getWorldPosition(wristWorld);
      tcpOffset.copy(tcpWorld).sub(wristWorld);
      const carried = interaction.module;
      if (interaction.state === "approach" || interaction.state === "close") {
        carried.getWorldPosition(moduleWorld);
        desired.copy(moduleWorld).add(approachOffset);
      } else if (interaction.state === "carry" || interaction.state === "insert") {
        desired.copy(pointerWorld).add(dragOffset);
        carried.getWorldPosition(moduleWorld);
        const magneticDistance = moduleWorld.distanceTo(scannerCenter);
        if (magneticDistance < 1.25) {
          const magneticStrength = THREE.MathUtils.smoothstep(1.25 - magneticDistance, 0, 1.25) * 0.72;
          desired.lerp(scannerTcpTarget, magneticStrength);
        }
      } else if (interaction.state === "idle") {
        desired.copy(pointerWorld);
      }
      desired.x = clamp(desired.x, -3.15, 3.15);
      desired.y = clamp(desired.y, 1.0, 2.45);
      desired.z = clamp(desired.z, 0, 2.75);

      ikTarget.copy(desired).sub(tcpOffset);
      ikTarget.x = clamp(ikTarget.x, -3.25, 3.25);
      ikTarget.y = clamp(ikTarget.y, 0.72, 2.65);
      ikTarget.z = clamp(ikTarget.z, -0.2, 2.85);
      error.copy(ikTarget).sub(tracked);
      const isManipulating = interaction.state !== "idle";
      const kp = isManipulating ? 16 : 10;
      const kd = isManipulating ? 7 : 6;
      const maxAcceleration = isManipulating ? 9 : 6;
      const maxVelocity = isManipulating ? 2.15 : 1.45;
      acceleration.copy(error).multiplyScalar(kp).addScaledVector(velocity, -kd);
      acceleration.clampLength(0, maxAcceleration);
      velocity.addScaledVector(acceleration, dt);
      velocity.clampLength(0, maxVelocity);
      tracked.addScaledVector(velocity, dt);
      tracked.x = clamp(tracked.x, -3.25, 3.25);
      tracked.y = clamp(tracked.y, 0.72, 2.65);
      tracked.z = clamp(tracked.z, -0.2, 2.85);

      solveArm();
      scene.updateMatrixWorld(true);
      gripSocket.getWorldPosition(tcpWorld);

      const contactDistance = tcpWorld.distanceTo(desired);
      if (interaction.state === "approach" && interaction.pointerHeld && contactDistance <= contactThreshold) {
        interaction.state = "close";
        interaction.elapsed = 0;
      } else if (interaction.state === "close" && contactDistance > contactThreshold) {
        interaction.state = "approach";
        interaction.elapsed = 0;
      } else if (
        interaction.state === "close" &&
        interaction.pointerHeld &&
        interaction.elapsed > 0.18 &&
        contactDistance <= contactThreshold
      ) {
        gripSocket.attach(carried);
        carried.position.set(0, -0.48, 0);
        carried.rotation.set(0, 0, 0);
        dragPlaneAnchor.copy(tcpWorld);
        updatePointerWorld();
        dragOffset.copy(tcpWorld).sub(pointerWorld);
        interaction.state = "carry";
        interaction.elapsed = 0;
      }

      let scannerReady = false;
      if (interaction.state === "carry" || interaction.state === "insert") {
        carried.getWorldPosition(moduleWorld);
        scannerReady = scannerVolume.containsPoint(moduleWorld) && moduleWorld.distanceTo(scannerCenter) < 0.38;
        interaction.state = scannerReady ? "insert" : "carry";
      }
      if (interaction.state === "release" && interaction.elapsed > 0.2) {
        const released = interaction.module;
        scene.updateMatrixWorld(true);
        released.getWorldPosition(moduleWorld);
        const acceptedAtRelease =
          scannerVolume.containsPoint(moduleWorld) && moduleWorld.distanceTo(scannerCenter) < 0.38;
        scene.attach(released);
        released.userData.grabbed = false;
        if (acceptedAtRelease) {
          released.userData.scanned = true;
          released.position.copy(acceptedModuleTarget);
          released.rotation.set(0, 0, 0);
          released.userData.panel.userData.revealed = true;
          activePanel = released.userData.panel;
          panels.forEach((panel) => {
            panel.userData.active = panel === activePanel;
          });
        } else {
          released.position.copy(released.userData.home);
          released.rotation.set(0, 0, 0);
        }
        interaction.state = "idle";
        interaction.module = null;
        interaction.pointerHeld = false;
        interaction.elapsed = 0;
        velocity.multiplyScalar(0.35);
      }

      const closedFingers =
        interaction.state === "close" ||
        interaction.state === "carry" ||
        interaction.state === "insert" ||
        interaction.state === "release";
      fingerPivots.forEach((pivot) => {
        const targetAngle = pivot.userData.side * (closedFingers ? -0.06 : 0.22);
        pivot.rotation.z += (targetAngle - pivot.rotation.z) * 0.2;
      });

      target.position.copy(tcpWorld);
      targetRing.position.copy(tcpWorld);
      targetRing.rotation.z += 0.014;
      mouseTarget.position.copy(desired);
      mouseTarget.rotation.z -= 0.018;
      aimLineGeometry.setFromPoints([tcpWorld, desired]);
      scannerRing.rotation.z -= 0.018;
      const scannerFeedback = scannerReady ? 0x82ffb0 : carried ? 0x7fced5 : 0x5b8790;
      scannerRing.material.color.setHex(scannerFeedback);
      scannerGate.material.color.setHex(scannerFeedback);
      scannerGate.material.opacity += ((scannerReady ? 0.38 : carried ? 0.2 : 0.1) - scannerGate.material.opacity) * 0.12;
      scannerBeam.material.opacity += ((scannerReady ? 0.3 : carried ? 0.16 : 0.06) - scannerBeam.material.opacity) * 0.08;
      const oldestTracePoint = tracePoints.shift();
      oldestTracePoint.copy(tcpWorld);
      tracePoints.push(oldestTracePoint);
      traceGeometry.setFromPoints(tracePoints);

      dataModules.forEach((module, index) => {
        if (module === interaction.module) return;

        if (module.userData.scanned) {
          scannedModuleTarget.copy(scannerCenter);
          scannedModuleTarget.y += -0.34 + index * 0.025;
          module.position.lerp(scannedModuleTarget, 0.08);
          module.scale.lerp(scannedScale, 0.08);
        } else {
          module.position.lerp(module.userData.home, 0.04);
          module.rotation.y += 0.002;
        }
      });

      panels.forEach((panel, index) => {
        const isActive = panel.userData.active;
        const isRevealed = panel.userData.revealed;
        const targetOpacity = isActive ? 0.95 : isRevealed ? 0.18 : 0;
        panel.material.opacity += (targetOpacity - panel.material.opacity) * 0.08;
        panel.position.y =
          panel.userData.base.y + Math.sin(frame * 0.018 + index * 1.7) * (isActive ? 0.08 : 0.035);
        panel.lookAt(camera.position);
        panel.scale.setScalar(isActive ? 1.08 : 1);
      });

      const freezeParallax = interaction.state !== "idle";
      if (!freezeParallax) {
        camera.position.x += (5.2 + pointer.x * 0.28 - camera.position.x) * 0.012;
        camera.position.y += (4.35 + pointer.y * 0.12 - camera.position.y) * 0.012;
        camera.position.z += (8.6 - pointer.y * 0.12 - camera.position.z) * 0.012;
      }
      camera.lookAt(0, 1.42, 1.1);

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    setSize();
    mount.addEventListener("pointermove", updatePointer);
    mount.addEventListener("pointerdown", beginInteraction);
    mount.addEventListener("pointerup", requestRelease);
    mount.addEventListener("pointercancel", requestRelease);
    mount.addEventListener("touchmove", updateTouch, { passive: true });
    window.addEventListener("resize", setSize);
    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      mount.removeEventListener("pointermove", updatePointer);
      mount.removeEventListener("pointerdown", beginInteraction);
      mount.removeEventListener("pointerup", requestRelease);
      mount.removeEventListener("pointercancel", requestRelease);
      mount.removeEventListener("touchmove", updateTouch);
      window.removeEventListener("resize", setSize);
      environmentRenderTarget.dispose();
      pmremGenerator.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) object.material.forEach((item) => item.dispose());
          else object.material.dispose();
        }
      });
      panels.forEach((panel) => panel.userData.texture.dispose());
      dataModules.forEach((module) => module.userData.labelTexture.dispose());
      scannerLabelTexture.dispose();
    };
  }, []);

  return <div className="gameCanvas" ref={mountRef} aria-label="Interactive 3D robotics portfolio" />;
}

function App() {
  return (
    <main className="gameShell">
      <RobotArmGame />
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
