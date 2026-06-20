import React, { useState } from "react";
import ArtifactPanel from "./components/ArtifactPanel.jsx";
import HudNav from "./components/HudNav.jsx";
import RobotArmGame from "./components/RobotArmGame.jsx";

export default function App() {
  const [indexOpen, setIndexOpen] = useState(false);
  const [showLegend, setShowLegend] = useState(() => localStorage.getItem("portfolio-controls-seen") !== "1");

  const openArtifact = (id) => {
    window.dispatchEvent(new CustomEvent("portfolio:open", { detail: id }));
    setIndexOpen(false);
  };

  const dismissLegend = () => {
    if (!showLegend) return;
    localStorage.setItem("portfolio-controls-seen", "1");
    setShowLegend(false);
  };

  return (
    <main className="gameShell" onPointerDownCapture={dismissLegend}>
      <RobotArmGame />
      <HudNav onOpenArtifact={openArtifact} onOpenIndex={() => setIndexOpen(true)} />
      <ArtifactPanel isOpen={indexOpen} onClose={() => setIndexOpen(false)} onOpenArtifact={openArtifact} />
      {showLegend && <div className="controlLegend">MOVE TO AIM <span /> CLICK OBJECT TO GRAB <span /> CLICK SCANNER TO RELEASE</div>}
      <div className="sceneCaption"><span>ROBOTICS WORKCELL 01</span><strong>SELECT AN ARTIFACT</strong></div>
    </main>
  );
}
