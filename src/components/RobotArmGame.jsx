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

export default function RobotArmGame() {
  const mountRef = useRef(null);

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
        new THREE.BoxGeometry(1.18, 0.72, 1.24),
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
    const screenProbe = new THREE.Vector3();
    const tcpWorld = new THREE.Vector3();
    const moduleWorld = new THREE.Vector3();
    const scannerCenter = new THREE.Vector3(-1.55, 1.02, 2.35);
    const scannerTcpTarget = new THREE.Vector3(-1.55, 1.02, 2.35);
    const acceptedModuleTarget = new THREE.Vector3(-1.55, 0.68, 2.35);
    const scannedModuleTarget = new THREE.Vector3();
    const scannedScale = new THREE.Vector3(0.55, 0.55, 0.55);
    const approachOffset = new THREE.Vector3(0, 0.18, 0);
    const scannerVolume = new THREE.Box3(
      new THREE.Vector3(-2.13, 0.58, 1.77),
      new THREE.Vector3(-0.97, 1.46, 2.93),
    );
    const upperLength = 2.76;
    const lowerLength = 2.18;
    const toolLength = 1.42;
    const toolDepth = 0.34;
    const shoulderCenter = new THREE.Vector3(0, 0.84, 0);
    const reachSphere = new THREE.Sphere(shoulderCenter, 4.2);
    const contactThreshold = 0.11;
    const interaction = { state: "idle", module: null, elapsed: 0 };
    let activePanel = null;

    let frame = 0;
    let animationId = 0;
    let lastTime = performance.now();

    camera.getWorldDirection(dragPlaneNormal);
    dragPlane.setFromNormalAndCoplanarPoint(dragPlaneNormal, dragPlaneAnchor);

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

    const updateTouch = (event) => {
      if (event.touches[0]) updatePointer(event.touches[0]);
    };

    const beginInteraction = (event) => {
      updatePointer(event);
      raycaster.setFromCamera(pointer, camera);

      if (interaction.state === "carry" || interaction.state === "insert") {
        interaction.state = "release";
        interaction.elapsed = 0;
        return;
      }
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
        interaction.state = "approach";
        interaction.elapsed = 0;
        picked.userData.grabbed = true;
        picked.getWorldPosition(moduleWorld);
      }
    };

    const solveArm = (tcpTarget) => {
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

      base.rotation.y = yaw;
      upper.rotation.x = shoulderAngle;
      forearm.rotation.x = elbowAngle;
      wrist.rotation.x = toolPitch - shoulderAngle - elbowAngle;
      wrist.rotation.z = 0;
    };

    const animate = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.04);
      lastTime = now;
      frame += 1;
      interaction.elapsed += dt;
      updatePointerWorld();

      scene.updateMatrixWorld(true);
      gripSocket.getWorldPosition(tcpWorld);
      const carried = interaction.module;
      if (interaction.state === "approach" || interaction.state === "close") {
        carried.getWorldPosition(moduleWorld);
        desired.copy(moduleWorld).add(approachOffset);
      } else if (interaction.state === "carry" || interaction.state === "insert") {
        desired.copy(pointerWorld);
        carried.getWorldPosition(moduleWorld);
        const magneticDistance = moduleWorld.distanceTo(scannerCenter);
        if (magneticDistance < 1.25) {
          const magneticStrength = THREE.MathUtils.smoothstep(1.25 - magneticDistance, 0, 1.25) * 0.72;
          desired.lerp(scannerTcpTarget, magneticStrength);
        }
      } else if (interaction.state === "idle") {
        desired.copy(pointerWorld);
      }
      solveArm(desired);
      scene.updateMatrixWorld(true);
      gripSocket.getWorldPosition(tcpWorld);

      const contactDistance = tcpWorld.distanceTo(desired);
      if (interaction.state === "approach" && contactDistance <= contactThreshold) {
        interaction.state = "close";
        interaction.elapsed = 0;
      } else if (interaction.state === "close" && contactDistance > contactThreshold) {
        interaction.state = "approach";
        interaction.elapsed = 0;
      } else if (
        interaction.state === "close" &&
        interaction.elapsed > 0.18 &&
        contactDistance <= contactThreshold
      ) {
        gripSocket.attach(carried);
        carried.position.set(0, 0, 0);
        carried.rotation.set(0, 0, 0);
        interaction.state = "carry";
        interaction.elapsed = 0;
      }

      let scannerReady = false;
      if (interaction.state === "carry" || interaction.state === "insert") {
        carried.getWorldPosition(moduleWorld);
        scannerReady = scannerVolume.containsPoint(moduleWorld) && moduleWorld.distanceTo(scannerCenter) < 0.52;
        interaction.state = scannerReady ? "insert" : "carry";
      }
      if (interaction.state === "release" && interaction.elapsed > 0.2) {
        const released = interaction.module;
        scene.updateMatrixWorld(true);
        released.getWorldPosition(moduleWorld);
        const acceptedAtRelease =
          scannerVolume.containsPoint(moduleWorld) && moduleWorld.distanceTo(scannerCenter) < 0.52;
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
        interaction.elapsed = 0;
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
      target.position.y = 0.335;
      const scannerFeedback = scannerReady ? 0x82ffb0 : carried ? 0x7fced5 : 0x5b8790;
      scannerRing.material.color.setHex(scannerFeedback);
      scannerGate.material.color.setHex(scannerFeedback);
      scannerGate.material.opacity += ((scannerReady ? 0.38 : carried ? 0.2 : 0.1) - scannerGate.material.opacity) * 0.12;
      scannerBeam.material.opacity += ((scannerReady ? 0.3 : carried ? 0.16 : 0.06) - scannerBeam.material.opacity) * 0.08;

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
      }

      camera.lookAt(0, 1.42, 1.1);

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    setSize();
    mount.addEventListener("pointermove", updatePointer);
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
    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      mount.removeEventListener("pointermove", updatePointer);
      mount.removeEventListener("pointerdown", beginInteraction);
      mount.removeEventListener("touchmove", updateTouch);
      window.removeEventListener("resize", setSize);
      window.removeEventListener("portfolio:open", openArtifact);
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
