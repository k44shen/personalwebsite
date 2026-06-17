import React, { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import * as THREE from "three";
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
    opacity: 0.04,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3.75 * scale, 2 * scale), material);
  mesh.position.copy(position);
  mesh.userData.base = position.clone();
  mesh.userData.texture = texture;
  return mesh;
}

function RobotArmGame() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x02070d, 8, 23);

    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
    camera.position.set(0, 4.4, 11.5);
    camera.lookAt(0, 1.6, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x02070d, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x7ab6ff, 0.62));

    const key = new THREE.DirectionalLight(0xffffff, 2.8);
    key.position.set(4, 8, 6);
    const rim = new THREE.PointLight(0x22ddff, 26, 18);
    rim.position.set(-4.5, 3.4, 4);
    const ember = new THREE.PointLight(0xffb23f, 16, 16);
    ember.position.set(4.5, 2.6, -2.5);
    scene.add(key, rim, ember);

    const grid = new THREE.GridHelper(22, 44, 0x22ddff, 0x172f3f);
    grid.material.transparent = true;
    grid.material.opacity = 0.23;
    scene.add(grid);

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
    [-1, 1].forEach((side) => {
      const knuckle = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.22, 20), amber);
      knuckle.rotation.x = Math.PI / 2;
      knuckle.position.set(side * 0.28, 0.23, 0.2);
      const finger = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.74, 0.13), metal);
      finger.position.set(side * 0.29, 0.55, 0.29);
      finger.rotation.z = side * 0.18;
      const fingerTip = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.3, 0.13), graphite);
      fingerTip.position.set(side * 0.35, 0.94, 0.3);
      fingerTip.rotation.z = side * 0.34;
      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.15), rubber);
      pad.position.set(side * 0.39, 1.04, 0.34);
      pad.rotation.z = side * 0.18;
      toolBase.add(knuckle, finger, fingerTip, pad);
    });

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

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x38d5ff,
      transparent: true,
      opacity: 0.34,
    });
    const tracePoints = Array.from({ length: 64 }, () => new THREE.Vector3());
    const traceGeometry = new THREE.BufferGeometry().setFromPoints(tracePoints);
    const trace = new THREE.Line(traceGeometry, lineMaterial);
    scene.add(trace);

    const panels = [
      makePanel(
        {
          kicker: "identity",
          title: "Kevin Shen",
          lines: ["Robotics, software,", "control systems,", "and mechatronics."],
        },
        new THREE.Vector3(-3.4, 3.15, -2.3),
        1.06,
      ),
      makePanel(
        {
          kicker: "projects",
          title: "Selected Builds",
          lines: ["Gesture robot hand", "Autonomous rover", "Embedded experiments"],
          accent: "#ffb23f",
        },
        new THREE.Vector3(3.55, 2.72, -1.75),
        0.9,
      ),
      makePanel(
        {
          kicker: "resume",
          title: "Systems Profile",
          lines: ["Python · C++ · React", "ROS · CAD · controls", "hardware to interface"],
        },
        new THREE.Vector3(-3.95, 1.65, 1.15),
        0.82,
      ),
      makePanel(
        {
          kicker: "contact",
          title: "Docking Bay",
          lines: ["GitHub", "LinkedIn", "hello@kevinshen.com"],
          accent: "#64e6a2",
        },
        new THREE.Vector3(3.55, 1.35, 1.35),
        0.78,
      ),
    ];
    panels.forEach((panel) => scene.add(panel));

    const desired = new THREE.Vector3(0.9, 2.35, 0.8);
    const tracked = desired.clone();
    const velocity = new THREE.Vector3();
    const integral = new THREE.Vector3();
    const error = new THREE.Vector3();
    const lastError = new THREE.Vector3();
    const pointer = new THREE.Vector2(0.18, 0.04);
    const upperLength = 2.76;
    const lowerLength = 2.18;
    const pid = { kp: 14.5, ki: 0.72, kd: 4.4 };

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

    const updateTouch = (event) => {
      if (event.touches[0]) updatePointer(event.touches[0]);
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

      desired.set(pointer.x * 4.45, 2.35 + pointer.y * 1.62, 1.08 + pointer.y * 0.55);
      desired.x = clamp(desired.x, -4.35, 4.35);
      desired.y = clamp(desired.y, 0.95, 4.25);
      desired.z = clamp(desired.z, -0.45, 3.25);

      error.copy(desired).sub(tracked);
      integral.addScaledVector(error, dt);
      integral.clampScalar(-1.25, 1.25);
      const derivative = error.clone().sub(lastError).multiplyScalar(1 / Math.max(dt, 0.001));
      const acceleration = error
        .clone()
        .multiplyScalar(pid.kp)
        .add(integral.clone().multiplyScalar(pid.ki))
        .add(derivative.multiplyScalar(pid.kd));
      velocity.addScaledVector(acceleration, dt);
      velocity.multiplyScalar(0.875);
      tracked.addScaledVector(velocity, dt);
      lastError.copy(error);

      solveArm();

      target.position.copy(tracked);
      targetRing.position.copy(tracked);
      targetRing.rotation.z += 0.014;
      tracePoints.push(tracked.clone());
      tracePoints.shift();
      traceGeometry.setFromPoints(tracePoints);

      panels.forEach((panel, index) => {
        const distance = tracked.distanceTo(panel.userData.base);
        const reveal = clamp(1.4 - distance / 2.45, 0, 1);
        panel.material.opacity += (0.08 + reveal * 0.88 - panel.material.opacity) * 0.08;
        panel.position.y =
          panel.userData.base.y + Math.sin(frame * 0.018 + index * 1.7) * (0.04 + reveal * 0.05);
        panel.lookAt(camera.position);
        panel.scale.setScalar(1 + reveal * 0.08);
      });

      camera.position.x += (pointer.x * 1.6 - camera.position.x) * 0.018;
      camera.position.y += (4.4 + pointer.y * 0.42 - camera.position.y) * 0.018;
      camera.position.z += (11.5 - pointer.y * 0.48 - camera.position.z) * 0.018;
      camera.lookAt(0, 1.7, 0);

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    setSize();
    mount.addEventListener("pointermove", updatePointer);
    mount.addEventListener("touchmove", updateTouch, { passive: true });
    window.addEventListener("resize", setSize);
    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      mount.removeEventListener("pointermove", updatePointer);
      mount.removeEventListener("touchmove", updateTouch);
      window.removeEventListener("resize", setSize);
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
