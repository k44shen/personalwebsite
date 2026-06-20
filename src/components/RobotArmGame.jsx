import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { PORTFOLIO_ARTIFACTS } from "../data/artifacts.js";
import { clamp } from "../utils/math.js";
import { makeLabelTexture, makePanelTexture } from "../utils/threeTextures.js";

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
    actionLabel: artifact.actionEnabled ? artifact.actionLabel : null,
    accent: artifact.accent ?? artifact.signalColor ?? artifact.color ?? "#56c7d9",
  };
}

export default function RobotArmGame({ controlMode = "auto", onScanComplete, onScanProgress, onStateChange }) {
  const mountRef = useRef(null);
  const debugRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x9ba0a0, 0.018);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0.35, 3.75, 8.9);
    camera.lookAt(0, 1.25, 1.15);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    mount.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const environmentRenderTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = environmentRenderTarget.texture;

    scene.add(new THREE.HemisphereLight(0xf4efe6, 0x303334, 1.2));

    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(-2.5, 9, 5.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 18;
    key.shadow.camera.left = -7;
    key.shadow.camera.right = 7;
    key.shadow.camera.top = 7;
    key.shadow.camera.bottom = -7;
    const rim = new THREE.PointLight(0xdde8ef, 3.5, 16);
    rim.position.set(-4.5, 4.8, 4);
    const ember = new THREE.PointLight(0xffb45c, 2.2, 10);
    ember.position.set(4.5, 2.6, -2.5);
    scene.add(key, rim, ember);

    const workPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(9.2, 6.2),
      new THREE.ShadowMaterial({ color: 0x101212, opacity: 0.34 }),
    );
    workPlane.rotation.x = -Math.PI / 2;
    workPlane.position.set(0, 0.31, 1.4);
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

    const metal = new THREE.MeshStandardMaterial({
      color: 0xb9bec0,
      metalness: 0.82,
      roughness: 0.32,
    });
    const castWhite = new THREE.MeshStandardMaterial({
      color: 0xd8d4c7,
      metalness: 0.18,
      roughness: 0.54,
    });
    const amber = new THREE.MeshStandardMaterial({
      color: 0xd98b22,
      emissive: 0x321500,
      emissiveIntensity: 0.08,
      metalness: 0.35,
      roughness: 0.38,
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

    const addLinkRibs = (group, positions, width) => {
      positions.forEach((y) => {
        const rib = new THREE.Mesh(
          new THREE.TorusGeometry(width, 0.026, 6, 20),
          castWhite,
        );
        rib.rotation.x = Math.PI / 2;
        rib.scale.y = 0.72;
        rib.position.y = y;
        group.add(rib);
      });
    };

    const addServicePlate = (group, y, x, rotationZ = 0) => {
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.38, 0.035), graphite);
      plate.position.set(x, y, -0.2);
      plate.rotation.z = rotationZ;
      const fastenerA = makeBolt(0.024, 0.018);
      const fastenerB = fastenerA.clone();
      fastenerA.rotation.x = Math.PI / 2;
      fastenerB.rotation.x = Math.PI / 2;
      fastenerA.position.set(-0.07, 0.12, -0.025);
      fastenerB.position.set(0.07, -0.12, -0.025);
      plate.add(fastenerA, fastenerB);
      group.add(plate);
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

      const shellMat = new THREE.MeshStandardMaterial({ color: 0x596066, metalness: 0.72, roughness: 0.38 });
      const accentMat = new THREE.MeshStandardMaterial({
        color: accent,
        emissive: accent,
        emissiveIntensity: 0.08,
        metalness: 0.2,
        roughness: 0.2,
      });
      const windowMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.12,
        metalness: 0.2,
        roughness: 0.18,
      });

      const bodyGeometry = index === 0
        ? new THREE.BoxGeometry(0.9, 0.16, 0.58, 3, 1, 2)
        : index === 1
          ? new THREE.BoxGeometry(0.82, 0.1, 0.88)
          : index === 2
            ? new THREE.BoxGeometry(0.72, 0.14, 1.02)
            : new THREE.BoxGeometry(0.78, 0.24, 0.7);
      const body = new THREE.Mesh(bodyGeometry, shellMat);
      body.position.y = 0.15;
      const windowGeometry = index === 1
        ? new THREE.BoxGeometry(0.62, 0.025, 0.66)
        : new THREE.BoxGeometry(index === 3 ? 0.5 : 0.56, 0.025, index === 2 ? 0.72 : 0.34);
      const window = new THREE.Mesh(windowGeometry, windowMat);
      window.position.set(0, index % 4 === 2 ? 0.55 : 0.32, 0.05);
      const spine = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.035, index === 2 ? 0.9 : 0.62), accentMat);
      spine.position.set(-0.3, 0.29, 0);
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 8, 36, Math.PI), graphite);
      handle.rotation.x = Math.PI / 2;
      handle.position.set(0.38, 0.26, 0.34);
      const feet = [-0.24, 0.24].map((x) => {
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.18), rubber);
        foot.position.set(x, -0.05, -0.32);
        return foot;
      });
      const beacon = new THREE.PointLight(accent, 0.22, 1.4);
      beacon.position.y = 0.35;
      const labelTexture = makeLabelTexture(copy.title, copy.accent);
      const label = new THREE.Mesh(
        new THREE.PlaneGeometry(0.58, 0.12),
        new THREE.MeshBasicMaterial({ map: labelTexture, side: THREE.DoubleSide }),
      );
      label.position.set(0, 0.18, 0.48);
      label.rotation.x = -Math.PI / 2;
      group.userData.labelTexture = labelTexture;
      group.userData.beacon = beacon;
      group.add(body, window, spine, handle, ...feet, beacon, label);
      if (index === 1) {
        for (let pin = 0; pin < 10; pin += 1) {
          const component = new THREE.Mesh(
            new THREE.BoxGeometry(pin % 3 === 0 ? 0.11 : 0.05, 0.055, pin % 2 === 0 ? 0.09 : 0.16),
            pin % 3 === 0 ? graphite : metal,
          );
          component.position.set(-0.24 + (pin % 5) * 0.12, 0.36, -0.2 + Math.floor(pin / 5) * 0.3);
          group.add(component);
        }
      }
      if (index === 3) {
        [-0.18, 0, 0.18].forEach((x) => {
          const port = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.08, 20), rubber);
          port.rotation.x = Math.PI / 2;
          port.position.set(x, 0.28, 0.36);
          group.add(port);
        });
      }
      const hitTarget = new THREE.Mesh(
        new THREE.BoxGeometry(0.94, 0.54, 1),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      );
      hitTarget.position.y = 0.24;
      group.add(hitTarget);
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
    const scannerBase = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.18, 1.55), graphite);
    scannerBase.position.y = 0.11;
    const scannerWell = new THREE.Mesh(
      new THREE.BoxGeometry(1.12, 0.14, 1.05),
      new THREE.MeshStandardMaterial({
        color: 0x07131c,
        emissive: 0x082f40,
        emissiveIntensity: 0.08,
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
        opacity: 0.025,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    scannerBeam.position.y = 1.2;
    const scannerRing = new THREE.Mesh(
      new THREE.BoxGeometry(1.34, 0.025, 1.22),
      new THREE.MeshBasicMaterial({ color: 0x8fd6d9, transparent: true, opacity: 0.32 }),
    );
    scannerRing.rotation.x = Math.PI / 2;
    scannerRing.position.y = 0.48;
    const scannerGate = new THREE.Mesh(
      new THREE.BoxGeometry(1.28, 0.03, 1.16),
      new THREE.MeshBasicMaterial({ color: 0x7fced5, transparent: true, opacity: 0.08 }),
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

    const identityActionMeshes = [];

    const base = new THREE.Group();
    scene.add(base);

    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.55, 0.48, 64), graphite);
    pedestal.position.y = 0.24;
    base.add(pedestal);
    addBoltRing(base, 14, 1.18, 0.5);

    const turntable = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.3, 64), castWhite);
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
    const upperArm = makeLinkShell(2.62, 0.34, 0.27, castWhite);
    upperArm.position.y = 1.38;
    upperArm.scale.x = 0.82;
    upperArm.scale.z = 0.62;
    upper.add(upperArm);
    addTwinRails(upper, 2.45, 0.41, 0.18, graphite);
    addLinkRibs(upper, [0.72, 1.46, 2.18], 0.29);
    addServicePlate(upper, 1.35, 0.16, -0.08);
    addCable(upper, [
      [-0.34, 0.2, -0.28],
      [-0.58, 0.95, -0.34],
      [-0.5, 1.85, -0.31],
      [-0.28, 2.54, -0.26],
    ]);

    const elbow = new THREE.Group();
    elbow.position.y = 2.76;
    upper.add(elbow);
    const elbowMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.78, 48), graphite);
    elbowMotor.rotation.z = Math.PI / 2;
    elbow.add(elbowMotor);
    const elbowSafetyBand = new THREE.Mesh(new THREE.CylinderGeometry(0.372, 0.372, 0.09, 32), amber);
    elbowSafetyBand.rotation.z = Math.PI / 2;
    elbowSafetyBand.position.x = 0.28;
    elbow.add(elbowSafetyBand);
    const elbowRing = new THREE.Mesh(new THREE.TorusGeometry(0.39, 0.026, 8, 64), boltMat);
    elbowRing.rotation.y = Math.PI / 2;
    elbow.add(elbowRing);

    const forearm = new THREE.Group();
    elbow.add(forearm);
    const lowerArm = makeLinkShell(2.04, 0.25, 0.19, castWhite);
    lowerArm.position.y = 1.09;
    lowerArm.scale.x = 0.86;
    lowerArm.scale.z = 0.62;
    forearm.add(lowerArm);
    addTwinRails(forearm, 1.86, 0.31, 0.16, graphite);
    addLinkRibs(forearm, [0.64, 1.28, 1.84], 0.215);
    addServicePlate(forearm, 1.06, -0.12, 0.06);
    addCable(forearm, [
      [0.25, 0.1, -0.23],
      [0.46, 0.66, -0.28],
      [0.42, 1.38, -0.23],
      [0.21, 1.98, -0.18],
    ]);

    const wrist = new THREE.Group();
    wrist.position.y = 2.18;
    forearm.add(wrist);
    const wristMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.58, 36), graphite);
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
      const knuckle = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.22, 20), graphite);
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
    const gripperRail = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.14), metal);
    gripperRail.position.set(0, 0.2, 0.17);
    toolBase.add(gripperRail);
    const gripSocket = new THREE.Object3D();
    gripSocket.position.set(0, 1.08, 0.34);
    toolBase.add(gripSocket);

    const target = new THREE.Mesh(
      new THREE.CircleGeometry(0.045, 20),
      new THREE.MeshStandardMaterial({
        color: 0xffb02e,
        emissive: 0xff7a00,
        emissiveIntensity: 0.8,
        side: THREE.DoubleSide,
      }),
    );
    target.rotation.x = -Math.PI / 2;
    scene.add(target);

    const reachableMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 18, 12),
      new THREE.MeshBasicMaterial({ color: 0x38d5ff, depthTest: false }),
    );
    const actualMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 18, 12),
      new THREE.MeshBasicMaterial({ color: 0x64e6a2, depthTest: false }),
    );
    const clampLineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(),
      new THREE.Vector3(),
    ]);
    const clampLine = new THREE.Line(
      clampLineGeometry,
      new THREE.LineBasicMaterial({ color: 0xff6b4a, depthTest: false }),
    );
    reachableMarker.renderOrder = 20;
    actualMarker.renderOrder = 21;
    clampLine.renderOrder = 19;
    scene.add(reachableMarker, actualMarker, clampLine);

    const artifacts = PORTFOLIO_ARTIFACTS.slice(0, 4);
    const panelPositions = [
      new THREE.Vector3(-3.4, 3.15, -2.3),
      new THREE.Vector3(3.55, 2.72, -1.75),
      new THREE.Vector3(-3.95, 1.65, 1.15),
      new THREE.Vector3(3.55, 1.35, 1.35),
    ];
    const panels = artifacts.map((artifact, index) => {
      const panel = makePanel(
        artifactCopy(artifact, index),
        panelPositions[index],
        [1.06, 0.9, 0.82, 0.78][index],
      );
      panel.userData.artifact = artifact;
      panel.userData.action = {
        enabled: artifact.actionEnabled === true,
        href: artifact.actionHref,
        kind: artifact.actionKind,
      };
      return panel;
    });
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
        object.geometry.computeBoundingSphere?.();
        const radius = object.geometry.boundingSphere?.radius ?? 0;
        object.castShadow = radius > 0.18 && object.material !== boltMat;
        object.receiveShadow = radius > 0.12;
      }
    });

    const desired = new THREE.Vector3(0.9, 2.35, 0.8);
    const pointer = new THREE.Vector2(0.18, 0.04);
    const pointerWorld = new THREE.Vector3(0.5, 1.36, 1.4);
    const raycaster = new THREE.Raycaster();
    const dragPlane = new THREE.Plane();
    const dragPlaneAnchor = new THREE.Vector3(0, 1.55, 1.35);
    const dragPlaneNormal = new THREE.Vector3();
    const dragHit = new THREE.Vector3();
    const sphereHit = new THREE.Vector3();
    const workSurfacePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.32);
    const requestedSurface = new THREE.Vector3(0.9, 0.325, 0.8);
    const requestedTcp = new THREE.Vector3(0.9, 1.55, 0.8);
    const smoothedTcp = requestedTcp.clone();
    const reachableTcp = requestedTcp.clone();
    const verifiedTcp = new THREE.Vector3();
    const manualActualTcp = new THREE.Vector3();
    const screenProbe = new THREE.Vector3();
    const tcpWorld = new THREE.Vector3();
    const moduleWorld = new THREE.Vector3();
    const scannerCenter = new THREE.Vector3(-1.55, 1.02, 2.35);
    const scannerTcpTarget = new THREE.Vector3(-1.55, 1.02, 2.35);
    const acceptedModuleTarget = new THREE.Vector3(-1.55, 0.68, 2.35);
    const normalScale = new THREE.Vector3(1, 1, 1);
    const targetScale = new THREE.Vector3(1.07, 1.07, 1.07);
    const approachOffset = new THREE.Vector3(0, 0.18, 0);
    const safeHeightOffset = 0.9;
    const scanDuration = 0.9;
    const upperLength = 2.76;
    const lowerLength = 2.18;
    const toolLength = 1.42;
    const toolDepth = 0.34;
    const shoulderCenter = new THREE.Vector3(0, 0.84, 0);
    const reachSphere = new THREE.Sphere(shoulderCenter, 4.2);
    const debugIK = new URLSearchParams(window.location.search).get("debugIK") === "1";
    const manualHoverHeight = 1.55;
    const workBounds = { minX: -4.6, maxX: 4.6, minZ: -1.7, maxZ: 4.5 };
    // These signs and ranges include every existing automatic pose plus near/far test poses.
    const jointLimits = {
      base: [-THREE.MathUtils.degToRad(170), THREE.MathUtils.degToRad(170)],
      upper: [THREE.MathUtils.degToRad(-55), THREE.MathUtils.degToRad(80)],
      forearm: [THREE.MathUtils.degToRad(8), THREE.MathUtils.degToRad(145)],
      wrist: [THREE.MathUtils.degToRad(45), THREE.MathUtils.degToRad(115)],
    };
    const motionSpeedParam = Number(new URLSearchParams(window.location.search).get("motionSpeed"));
    const motionSpeed = clamp(Number.isFinite(motionSpeedParam) && motionSpeedParam > 0 ? motionSpeedParam : 1, 0.1, 2);
    const interaction = {
      state: "idle",
      module: null,
      elapsed: 0,
      attached: false,
      resetRequested: false,
      pickGrip: new THREE.Vector3(),
      pickAbove: new THREE.Vector3(),
      scannerAbove: new THREE.Vector3(),
      placeTcp: new THREE.Vector3(),
      homeAbove: new THREE.Vector3(),
      homePlaceTcp: new THREE.Vector3(),
    };
    const motion = {
      active: false,
      elapsed: 0,
      duration: 1,
      from: new THREE.Vector3(),
      to: new THREE.Vector3(),
    };
    const armSolution = { base: 0, upper: 0, forearm: 0, wrist: 0 };
    const manualSolution = { base: 0, upper: 0, forearm: 0, wrist: 0 };
    const jointVelocity = { base: 0, upper: 0, forearm: 0, wrist: 0 };
    const closedFingerStates = new Set([
      "gripPause", "liftPick", "rotateToScanner", "transportToScanner", "descendPlace",
      "returnGrip", "returnLift", "returnRotate", "returnTransport", "returnDescendHome",
    ]);
    let activePanel = null;
    let fingerClosure = 0;
    let lastReportedScanPercent = -1;
    let manualTargetClamped = false;
    let manualTcpError = 0;
    let manualSolverResidual = 0;
    let manualBaseTarget = 0;

    let frame = 0;
    let animationId = 0;
    let lastTime = performance.now();

    camera.getWorldDirection(dragPlaneNormal);
    dragPlane.setFromNormalAndCoplanarPoint(dragPlaneNormal, dragPlaneAnchor);

    const transitionTo = (state) => {
      interaction.state = state;
      interaction.elapsed = 0;
      mount.dataset.interactionState = state;
      if (state === "scanning") {
        lastReportedScanPercent = 0;
        onScanProgress(0);
      } else if (state === "scanned") {
        lastReportedScanPercent = 100;
        onScanProgress(1);
      }
      onStateChange(state);
    };

    const rotatedWaypoint = (from, toward, height = from.y) => {
      const radius = Math.max(Math.hypot(from.x, from.z), 1.8);
      const yaw = Math.atan2(toward.x, toward.z);
      return new THREE.Vector3(Math.sin(yaw) * radius, height, Math.cos(yaw) * radius);
    };

    const startMotion = (state, targetPosition, duration) => {
      scene.updateMatrixWorld(true);
      gripSocket.getWorldPosition(tcpWorld);
      motion.from.copy(tcpWorld);
      motion.to.copy(targetPosition);
      motion.elapsed = 0;
      motion.duration = duration;
      motion.active = true;
      transitionTo(state);
    };

    const resetInteraction = () => {
      if (interaction.state === "scanned" && interaction.module) {
        interaction.resetRequested = false;
        startMotion(
          "returnApproach",
          interaction.placeTcp.clone().add(new THREE.Vector3(0, safeHeightOffset, 0)),
          0.3,
        );
        return;
      }
      if (interaction.state !== "idle") {
        interaction.resetRequested = true;
        return;
      }
      panels.forEach((panel) => {
        panel.userData.active = false;
        panel.userData.revealed = false;
      });
      activePanel = null;
    };

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
      if (raycaster.ray.intersectPlane(dragPlane, dragHit)) {
        pointerWorld.copy(dragHit);
        const reachableHit = raycaster.ray.intersectSphere(reachSphere, sphereHit);
        if (!reachSphere.containsPoint(pointerWorld) && reachableHit) pointerWorld.copy(reachableHit);

        const direction = raycaster.ray.direction;
        if (pointerWorld.y < 0.98 && Math.abs(direction.y) > 0.0001) {
          pointerWorld.copy(raycaster.ray.at((0.98 - raycaster.ray.origin.y) / direction.y, dragHit));
        }
      }
    };

    const updateManualPointerTarget = () => {
      raycaster.setFromCamera(pointer, camera);
      if (!raycaster.ray.intersectPlane(workSurfacePlane, dragHit)) return;
      requestedSurface.set(dragHit.x, 0.325, dragHit.z);
      requestedTcp.set(dragHit.x, manualHoverHeight, dragHit.z);
    };

    const handlePointerMove = (event) => {
      if (event.target !== renderer.domElement && event.target !== mount) return;
      updatePointer(event);
      if (controlMode === "manual") updateManualPointerTarget();
    };

    const updateTouch = (event) => {
      if (event.touches[0]) updatePointer(event.touches[0]);
    };

    const beginInteraction = (event) => {
      updatePointer(event);
      raycaster.setFromCamera(pointer, camera);

      if (controlMode === "manual") return;
      if (interaction.state !== "idle") return;

      const [identityHit] = raycaster.intersectObjects(identityActionMeshes, false);
      if (identityHit) {
        const { href, kind } = identityHit.object.userData.action;
        if (href.startsWith("mailto:")) window.location.href = href;
        else if (kind === "document") window.open(href, "_blank", "noopener,noreferrer");
        else window.open(href, "_blank", "noopener,noreferrer");
        return;
      }

      const actionablePanels = panels.filter((panel) => {
        const action = panel.userData.action;
        return panel.userData.revealed && panel.userData.active && action.enabled && action.href;
      });
      const [panelHit] = raycaster.intersectObjects(actionablePanels, false);
      if (panelHit) {
        const { href, kind } = panelHit.object.userData.action;
        if (href.startsWith("mailto:")) window.location.href = href;
        else if (kind === "navigate") window.location.assign(href);
        else window.open(href, "_blank", "noopener,noreferrer");
        return;
      }

      const pickables = dataModules
        .filter((module) => !module.userData.scanned)
        .flatMap((module) => module.children);
      const [hit] = raycaster.intersectObjects(pickables, true);
      let picked = hit?.object.userData.moduleRoot;

      if (picked) {
        mount.setPointerCapture?.(event.pointerId);
        interaction.module = picked;
        picked.userData.grabbed = true;
        picked.userData.scanned = false;
        scene.updateMatrixWorld(true);
        picked.getWorldPosition(moduleWorld);
        gripSocket.getWorldPosition(tcpWorld);
        interaction.pickGrip.copy(moduleWorld).add(approachOffset);
        interaction.pickAbove.copy(interaction.pickGrip).add(new THREE.Vector3(0, safeHeightOffset, 0));
        const rotateTarget = rotatedWaypoint(
          tcpWorld,
          interaction.pickGrip,
          Math.max(tcpWorld.y, interaction.pickAbove.y),
        );
        interaction.attached = false;
        interaction.resetRequested = false;
        startMotion("rotateToPick", rotateTarget, 0.2);
      }
    };

    const calculateArmSolution = (tcpTarget) => {
      const baseHeight = 0.84;
      const tcpRadius = Math.hypot(tcpTarget.x, tcpTarget.z);
      const yaw = tcpRadius > 0.04 ? Math.atan2(tcpTarget.x, tcpTarget.z) : base.rotation.y;
      const wristBlend = THREE.MathUtils.smoothstep(tcpRadius, 0.15, 1.1);
      const toolPitch = THREE.MathUtils.lerp(Math.PI, 2.55, wristBlend);
      const radialToolOffset = Math.sin(toolPitch) * toolLength + Math.cos(toolPitch) * toolDepth;
      const verticalToolOffset = Math.cos(toolPitch) * toolLength - Math.sin(toolPitch) * toolDepth;
      const radius = tcpRadius - radialToolOffset;
      const vertical = tcpTarget.y - verticalToolOffset - baseHeight;
      const reach = clamp(Math.hypot(radius, vertical), 0.44, upperLength + lowerLength - 0.05);
      const shoulderTerm =
        (upperLength * upperLength + reach * reach - lowerLength * lowerLength) /
        (2 * upperLength * reach);
      const elbowTerm =
        (upperLength * upperLength + lowerLength * lowerLength - reach * reach) /
        (2 * upperLength * lowerLength);
      const shoulderAngle = Math.atan2(radius, vertical) - Math.acos(clamp(shoulderTerm, -1, 1));
      const elbowAngle = Math.PI - Math.acos(clamp(elbowTerm, -1, 1));

      armSolution.base = yaw;
      armSolution.upper = shoulderAngle;
      armSolution.forearm = elbowAngle;
      armSolution.wrist = toolPitch - shoulderAngle - elbowAngle;
    };

    const unwrapNear = (angle, reference) =>
      reference + Math.atan2(Math.sin(angle - reference), Math.cos(angle - reference));

    const forwardKinematics = (solution, result) => {
      const combinedElbow = solution.upper + solution.forearm;
      const toolPitch = combinedElbow + solution.wrist;
      const radial =
        upperLength * Math.sin(solution.upper) +
        lowerLength * Math.sin(combinedElbow) +
        toolLength * Math.sin(toolPitch) +
        toolDepth * Math.cos(toolPitch);
      const vertical =
        shoulderCenter.y +
        upperLength * Math.cos(solution.upper) +
        lowerLength * Math.cos(combinedElbow) +
        toolLength * Math.cos(toolPitch) -
        toolDepth * Math.sin(toolPitch);
      result.set(
        Math.sin(solution.base) * radial,
        vertical,
        Math.cos(solution.base) * radial,
      );
      return result;
    };

    const calculateManualArmSolution = (tcpTarget) => {
      const boundedX = clamp(tcpTarget.x, workBounds.minX, workBounds.maxX);
      const boundedZ = clamp(tcpTarget.z, workBounds.minZ, workBounds.maxZ);
      const tcpRadius = Math.hypot(boundedX, boundedZ);
      if (tcpRadius >= 0.18) {
        const nearestYaw = unwrapNear(Math.atan2(boundedX, boundedZ), base.rotation.y);
        const validYawCandidates = [nearestYaw, nearestYaw - Math.PI * 2, nearestYaw + Math.PI * 2]
          .filter((angle) => angle >= jointLimits.base[0] && angle <= jointLimits.base[1]);
        manualBaseTarget = validYawCandidates.length
          ? validYawCandidates.reduce((best, angle) =>
            Math.abs(angle - base.rotation.y) < Math.abs(best - base.rotation.y) ? angle : best)
          : nearestYaw;
      }

      const targetBase = clamp(manualBaseTarget, ...jointLimits.base);
      const wristBlend = THREE.MathUtils.smoothstep(tcpRadius, 0.15, 1.1);
      const toolPitch = THREE.MathUtils.lerp(Math.PI, 2.55, wristBlend);
      const radialToolOffset = Math.sin(toolPitch) * toolLength + Math.cos(toolPitch) * toolDepth;
      const verticalToolOffset = Math.cos(toolPitch) * toolLength - Math.sin(toolPitch) * toolDepth;
      const radial = tcpRadius - radialToolOffset;
      const vertical = tcpTarget.y - verticalToolOffset - shoulderCenter.y;
      const minReach = Math.abs(upperLength - lowerLength) + 0.05;
      const maxReach = upperLength + lowerLength - 0.05;
      const reach = clamp(Math.hypot(radial, vertical), minReach, maxReach);
      const shoulderTerm =
        (upperLength * upperLength + reach * reach - lowerLength * lowerLength) /
        (2 * upperLength * reach);
      const elbowTerm =
        (upperLength * upperLength + lowerLength * lowerLength - reach * reach) /
        (2 * upperLength * lowerLength);
      const shoulderAngle = Math.atan2(radial, vertical) - Math.acos(clamp(shoulderTerm, -1, 1));
      const elbowAngle = Math.PI - Math.acos(clamp(elbowTerm, -1, 1));

      manualSolution.base = targetBase;
      manualSolution.upper = clamp(shoulderAngle, ...jointLimits.upper);
      manualSolution.forearm = clamp(elbowAngle, ...jointLimits.forearm);
      manualSolution.wrist = clamp(
        toolPitch - manualSolution.upper - manualSolution.forearm,
        ...jointLimits.wrist,
      );
      forwardKinematics(manualSolution, reachableTcp);
      verifiedTcp.copy(reachableTcp);
      manualSolverResidual = verifiedTcp.distanceTo(tcpTarget);
      manualTargetClamped =
        Math.abs(boundedX - tcpTarget.x) > 0.001 ||
        Math.abs(boundedZ - tcpTarget.z) > 0.001 ||
        manualSolverResidual > 0.025;
    };

    const updateJoint = (object, axis, targetAngle, velocityKey, dt, maxSpeed = 10, limits = null) => {
      const angleDelta = limits
        ? targetAngle - object.rotation[axis]
        : Math.atan2(
          Math.sin(targetAngle - object.rotation[axis]),
          Math.cos(targetAngle - object.rotation[axis]),
        );
      const acceleration = angleDelta * 320 - jointVelocity[velocityKey] * 34;
      jointVelocity[velocityKey] = clamp(
        jointVelocity[velocityKey] + acceleration * dt,
        -maxSpeed,
        maxSpeed,
      );
      object.rotation[axis] += jointVelocity[velocityKey] * dt;
      if (limits) {
        const limitedAngle = clamp(object.rotation[axis], ...limits);
        if (limitedAngle !== object.rotation[axis]) jointVelocity[velocityKey] = 0;
        object.rotation[axis] = limitedAngle;
      }
    };

    const updateMotion = (dt) => {
      if (!motion.active) return;
      motion.elapsed += dt;
      const progress = clamp(motion.elapsed / motion.duration, 0, 1);
      const eased = progress * progress * progress * (progress * (progress * 6 - 15) + 10);
      desired.lerpVectors(motion.from, motion.to, eased);
    };

    const animate = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.04);
      const simulationDt = dt * motionSpeed;
      lastTime = now;
      frame += 1;
      interaction.elapsed += simulationDt;
      if (controlMode === "auto") {
        updatePointerWorld();
        updateMotion(simulationDt);
      }

      scene.updateMatrixWorld(true);
      gripSocket.getWorldPosition(tcpWorld);
      const carried = interaction.module;
      if (controlMode === "manual") {
        smoothedTcp.x = THREE.MathUtils.damp(smoothedTcp.x, requestedTcp.x, 14, simulationDt);
        smoothedTcp.y = THREE.MathUtils.damp(smoothedTcp.y, requestedTcp.y, 14, simulationDt);
        smoothedTcp.z = THREE.MathUtils.damp(smoothedTcp.z, requestedTcp.z, 14, simulationDt);
        calculateManualArmSolution(smoothedTcp);
        updateJoint(base, "y", manualSolution.base, "base", simulationDt, 4, jointLimits.base);
        updateJoint(upper, "x", manualSolution.upper, "upper", simulationDt, 6, jointLimits.upper);
        updateJoint(forearm, "x", manualSolution.forearm, "forearm", simulationDt, 6, jointLimits.forearm);
        updateJoint(wrist, "x", manualSolution.wrist, "wrist", simulationDt, 7, jointLimits.wrist);
      } else {
        if (interaction.state === "idle" && !motion.active) desired.copy(pointerWorld);
        calculateArmSolution(desired);
        updateJoint(base, "y", armSolution.base, "base", simulationDt, 9);
        updateJoint(upper, "x", armSolution.upper, "upper", simulationDt);
        updateJoint(forearm, "x", armSolution.forearm, "forearm", simulationDt);
        updateJoint(wrist, "x", armSolution.wrist, "wrist", simulationDt, 11);
      }
      wrist.rotation.z = THREE.MathUtils.damp(wrist.rotation.z, 0, 10, simulationDt);
      scene.updateMatrixWorld(true);
      gripSocket.getWorldPosition(tcpWorld);
      if (controlMode === "manual") {
        manualActualTcp.copy(tcpWorld);
        manualTcpError = manualActualTcp.distanceTo(reachableTcp);
      }

      const motionComplete = motion.active &&
        motion.elapsed >= motion.duration &&
        (tcpWorld.distanceTo(motion.to) < 0.08 || motion.elapsed >= motion.duration + 0.04);
      if (motionComplete) motion.active = false;

      if (motionComplete && interaction.state === "rotateToPick") {
        startMotion("approachPick", interaction.pickAbove, 0.38);
      } else if (motionComplete && interaction.state === "approachPick") {
        startMotion("descendPick", interaction.pickGrip, 0.18);
      } else if (motionComplete && interaction.state === "descendPick") {
        transitionTo("gripPause");
      } else if (interaction.state === "gripPause" && interaction.elapsed >= 0.14 && !interaction.attached) {
        gripSocket.attach(carried);
        interaction.attached = true;
        startMotion("liftPick", tcpWorld.clone().add(new THREE.Vector3(0, safeHeightOffset, 0)), 0.28);
      } else if (motionComplete && interaction.state === "liftPick") {
        startMotion(
          "rotateToScanner",
          rotatedWaypoint(tcpWorld, scannerCenter, tcpWorld.y),
          0.16,
        );
      } else if (motionComplete && interaction.state === "rotateToScanner") {
        interaction.scannerAbove.copy(scannerTcpTarget).add(new THREE.Vector3(0, safeHeightOffset, 0));
        startMotion("transportToScanner", interaction.scannerAbove, 0.4);
      } else if (motionComplete && interaction.state === "transportToScanner") {
        carried.getWorldPosition(moduleWorld);
        interaction.placeTcp.copy(tcpWorld).add(acceptedModuleTarget.clone().sub(moduleWorld));
        startMotion("descendPlace", interaction.placeTcp, 0.16);
      } else if (motionComplete && interaction.state === "descendPlace") {
        scene.attach(carried);
        interaction.attached = false;
        transitionTo("releasePause");
      } else if (interaction.state === "releasePause" && interaction.elapsed >= 0.1) {
        startMotion(
          "retractFromScanner",
          tcpWorld.clone().add(new THREE.Vector3(0, safeHeightOffset, 0)),
          0.16,
        );
      } else if (motionComplete && interaction.state === "retractFromScanner") {
        transitionTo("scanning");
      } else if (interaction.state === "scanning" && interaction.elapsed >= scanDuration) {
        carried.userData.grabbed = false;
        carried.userData.scanned = true;
        carried.userData.panel.userData.revealed = true;
        activePanel = carried.userData.panel;
        panels.forEach((panel) => {
          panel.userData.active = panel === activePanel;
        });
        transitionTo("scanned");
        if (interaction.resetRequested) resetInteraction();
        else onScanComplete(carried.userData.artifact);
      } else if (motionComplete && interaction.state === "returnApproach") {
        startMotion("returnDescend", interaction.placeTcp, 0.22);
      } else if (motionComplete && interaction.state === "returnDescend") {
        transitionTo("returnGrip");
      } else if (interaction.state === "returnGrip" && interaction.elapsed >= 0.14 && !interaction.attached) {
        gripSocket.attach(carried);
        interaction.attached = true;
        carried.userData.scanned = false;
        startMotion("returnLift", tcpWorld.clone().add(new THREE.Vector3(0, safeHeightOffset, 0)), 0.28);
      } else if (motionComplete && interaction.state === "returnLift") {
        startMotion(
          "returnRotate",
          rotatedWaypoint(tcpWorld, carried.userData.home, tcpWorld.y),
          0.18,
        );
      } else if (motionComplete && interaction.state === "returnRotate") {
        interaction.homeAbove.copy(carried.userData.home)
          .add(approachOffset)
          .add(new THREE.Vector3(0, safeHeightOffset, 0));
        startMotion("returnTransport", interaction.homeAbove, 0.4);
      } else if (motionComplete && interaction.state === "returnTransport") {
        carried.getWorldPosition(moduleWorld);
        interaction.homePlaceTcp.copy(tcpWorld).add(carried.userData.home.clone().sub(moduleWorld));
        startMotion("returnDescendHome", interaction.homePlaceTcp, 0.18);
      } else if (motionComplete && interaction.state === "returnDescendHome") {
        scene.attach(carried);
        interaction.attached = false;
        transitionTo("returnRelease");
      } else if (interaction.state === "returnRelease" && interaction.elapsed >= 0.1) {
        startMotion(
          "returnRetract",
          tcpWorld.clone().add(new THREE.Vector3(0, safeHeightOffset, 0)),
          0.18,
        );
      } else if (motionComplete && interaction.state === "returnRetract") {
        carried.userData.grabbed = false;
        carried.userData.scanned = false;
        panels.forEach((panel) => {
          panel.userData.active = false;
          panel.userData.revealed = false;
        });
        activePanel = null;
        interaction.module = null;
        interaction.resetRequested = false;
        transitionTo("idle");
      }

      const targetClosure = closedFingerStates.has(interaction.state) ? 1 : 0;
      fingerClosure = THREE.MathUtils.damp(fingerClosure, targetClosure, 10, simulationDt);
      fingerPivots.forEach((pivot) => {
        const openAngle = pivot.userData.side * 0.22;
        const closedAngle = pivot.userData.side * -0.06;
        pivot.rotation.z = THREE.MathUtils.lerp(openAngle, closedAngle, fingerClosure);
      });

      if (controlMode === "manual") {
        target.position.copy(requestedSurface);
        target.material.color.setHex(manualTargetClamped ? 0xff6b4a : 0xffb02e);
        target.material.emissive.setHex(manualTargetClamped ? 0x7a1608 : 0xff7a00);
        reachableMarker.position.copy(reachableTcp);
        actualMarker.position.copy(manualActualTcp);
        reachableMarker.visible = true;
        actualMarker.visible = debugIK;
        clampLine.visible = manualTargetClamped;
        const positions = clampLine.geometry.attributes.position;
        positions.setXYZ(0, smoothedTcp.x, smoothedTcp.y, smoothedTcp.z);
        positions.setXYZ(1, reachableTcp.x, reachableTcp.y, reachableTcp.z);
        positions.needsUpdate = true;
      } else {
        target.position.copy(tcpWorld);
        target.position.y = 0.335;
        target.material.color.setHex(0xffb02e);
        target.material.emissive.setHex(0xff7a00);
        reachableMarker.visible = false;
        actualMarker.visible = false;
        clampLine.visible = false;
      }
      const scannerActive = interaction.state === "scanning";
      const scannerComplete = interaction.state === "scanned";
      const scannerFeedback = scannerComplete ? 0x82ffb0 : carried ? 0x7fced5 : 0x5b8790;
      scannerRing.material.color.setHex(scannerFeedback);
      scannerGate.material.color.setHex(scannerFeedback);
      const scanPulse = scannerActive ? 0.5 + Math.sin(interaction.elapsed * 18) * 0.22 : 0;
      scannerGate.material.opacity = THREE.MathUtils.damp(scannerGate.material.opacity, scannerActive ? 0.38 + scanPulse * 0.2 : carried ? 0.2 : 0.1, 8, simulationDt);
      scannerBeam.material.opacity = THREE.MathUtils.damp(scannerBeam.material.opacity, scannerActive ? 0.22 + scanPulse * 0.2 : carried ? 0.12 : 0.06, 7, simulationDt);
      const scannerGateTargetY = scannerActive ? 0.98 + Math.sin(interaction.elapsed * Math.PI * 1.6) * 0.34 : 0.82;
      scannerGate.position.y = THREE.MathUtils.damp(scannerGate.position.y, scannerGateTargetY, 10, simulationDt);
      if (scannerActive) {
        const scanPercent = Math.min(100, Math.floor((interaction.elapsed / scanDuration) * 100));
        if (scanPercent !== lastReportedScanPercent) {
          lastReportedScanPercent = scanPercent;
          onScanProgress(scanPercent / 100);
        }
      }

      dataModules.forEach((module) => {
        if (module === interaction.module) {
          const highlighted = ["rotateToPick", "approachPick", "descendPick", "gripPause"].includes(interaction.state);
          const scaleAlpha = 1 - Math.exp(-9 * simulationDt);
          module.scale.lerp(highlighted ? targetScale : normalScale, scaleAlpha);
          module.userData.beacon.intensity = THREE.MathUtils.damp(
            module.userData.beacon.intensity,
            highlighted || scannerActive ? 1.5 : 0.22,
            9,
            simulationDt,
          );
          return;
        }

        module.scale.lerp(normalScale, 1 - Math.exp(-7 * simulationDt));
        if (controlMode === "auto") module.rotation.y += 0.12 * simulationDt;
        module.userData.beacon.intensity = THREE.MathUtils.damp(module.userData.beacon.intensity, 0.22, 7, simulationDt);
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

      if (frame % 10 === 0) {
        const rect = mount.getBoundingClientRect();
        const projectToScreen = (worldPoint) => {
          screenProbe.copy(worldPoint).project(camera);
          return `${Math.round((screenProbe.x * 0.5 + 0.5) * rect.width)},${Math.round((-screenProbe.y * 0.5 + 0.5) * rect.height)}`;
        };
        dataModules[0].getWorldPosition(moduleWorld);
        mount.dataset.moduleScreen = projectToScreen(moduleWorld);
        mount.dataset.scannerScreen = projectToScreen(scannerCenter);
        mount.dataset.tcpScreen = projectToScreen(tcpWorld);
        mount.dataset.targetScreen = projectToScreen(desired);
        mount.dataset.targetWorld = desired.toArray().map((value) => value.toFixed(3)).join(",");
        mount.dataset.tcpWorld = tcpWorld.toArray().map((value) => value.toFixed(3)).join(",");
        mount.dataset.interactionState = interaction.state;
        mount.dataset.scannedCount = String(dataModules.filter((module) => module.userData.scanned).length);
        if (controlMode === "manual") {
          const formatVector = (vector) => vector.toArray().map((value) => value.toFixed(3)).join(",");
          mount.dataset.manualRequested = formatVector(requestedTcp);
          mount.dataset.manualReachable = formatVector(reachableTcp);
          mount.dataset.manualActual = formatVector(manualActualTcp);
          mount.dataset.manualError = manualTcpError.toFixed(4);
          mount.dataset.manualResidual = manualSolverResidual.toFixed(4);
          mount.dataset.manualClamped = String(manualTargetClamped);
          mount.dataset.manualAngles = Object.values(manualSolution)
            .map((value) => THREE.MathUtils.radToDeg(value).toFixed(1))
            .join(",");
          mount.dataset.manualJointActual = [base.rotation.y, upper.rotation.x, forearm.rotation.x, wrist.rotation.x]
            .map((value) => THREE.MathUtils.radToDeg(value).toFixed(1))
            .join(",");
          if (debugRef.current) {
            debugRef.current.textContent = [
              "IK DEBUG / MANUAL",
              `REQUESTED  ${formatVector(requestedTcp)}`,
              `REACHABLE  ${formatVector(reachableTcp)}`,
              `ACTUAL     ${formatVector(manualActualTcp)}`,
              `TCP ERROR  ${manualTcpError.toFixed(4)} / LIMIT 0.0500`,
              `CLAMP DELTA ${manualSolverResidual.toFixed(4)} / ${manualTargetClamped ? "CLAMPED" : "IN RANGE"}`,
              `JOINT CMD  ${mount.dataset.manualAngles}`,
              `JOINT ACT  ${mount.dataset.manualJointActual}`,
            ].join("\n");
          }
        }
      }

      camera.lookAt(0, 1.42, 1.1);

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    setSize();
    mount.addEventListener("pointermove", handlePointerMove);
    mount.addEventListener("pointerdown", beginInteraction);
    mount.addEventListener("touchmove", updateTouch, { passive: true });
    window.addEventListener("resize", setSize);
    const openArtifact = (event) => {
      const panel = panels.find((item) => item.userData.artifact.id === event.detail);
      if (!panel) return;
      panel.userData.revealed = true;
      activePanel = panel;
      panels.forEach((item) => { item.userData.active = item === panel; });
    };
    window.addEventListener("portfolio:open", openArtifact);
    window.addEventListener("portfolio:reset", resetInteraction);
    onStateChange("idle");
    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      mount.removeEventListener("pointermove", handlePointerMove);
      mount.removeEventListener("pointerdown", beginInteraction);
      mount.removeEventListener("touchmove", updateTouch);
      window.removeEventListener("resize", setSize);
      window.removeEventListener("portfolio:open", openArtifact);
      window.removeEventListener("portfolio:reset", resetInteraction);
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
  }, [controlMode, onScanComplete, onScanProgress, onStateChange]);

  const debugIK = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debugIK") === "1";

  return (
    <>
      <div className="gameCanvas" ref={mountRef} aria-label="Interactive 3D robotics portfolio" />
      {debugIK && <output className="ikDebug" ref={debugRef} aria-live="polite">IK DEBUG / WAITING</output>}
    </>
  );
}
