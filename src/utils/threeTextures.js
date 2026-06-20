import * as THREE from "three";

export function makePanelTexture({ title, kicker, lines, actionLabel, accent = "#38d5ff" }) {
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

  if (actionLabel) {
    ctx.fillStyle = accent;
    ctx.font = "700 30px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.fillText(`[ ${actionLabel.toUpperCase()} ]`, 82, 574);
  }

  return new THREE.CanvasTexture(canvas);
}

export function makeLabelTexture(text, accent = "#d7e1e5") {
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

export function makeIdentityTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1536;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0a1117";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#82d9e7";
  ctx.lineWidth = 8;
  ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);
  ctx.fillStyle = "#8ce9f2";
  ctx.font = "700 38px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText("ROBOTICS WORKCELL / OPERATOR 01", 70, 78);
  ctx.fillStyle = "#f4f8fa";
  ctx.font = "900 112px Inter, system-ui, sans-serif";
  ctx.fillText("KEVIN SHEN", 66, 218);
  ctx.fillStyle = "#cedbe0";
  ctx.font = "600 48px Inter, system-ui, sans-serif";
  ctx.fillText("WATERLOO MECHATRONICS", 70, 310);
  ctx.fillStyle = "#ffbd59";
  ctx.fillText("WATERLOO ROCKETRY", 70, 382);
  ctx.fillStyle = "#7e959f";
  ctx.font = "600 28px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText("SELECT A HARDKEY FOR ENGINEERING RECORDS", 72, 452);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
