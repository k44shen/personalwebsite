import React, { useCallback, useState } from "react";
import ArtifactPanel from "./components/ArtifactPanel.jsx";
import HudNav from "./components/HudNav.jsx";
import RobotArmGame from "./components/RobotArmGame.jsx";
import { PORTFOLIO_ARTIFACTS } from "./data/artifacts.js";

const STATE_LABELS = {
  idle: "SELECT AN ARTIFACT",
  targeted: "TARGET ACQUIRED",
  pickup: "PICKING UP ARTIFACT",
  transporting: "MOVING TO SCANNER",
  scanning: "SCANNING ARTIFACT",
  scanned: "SCAN COMPLETE",
};

export default function App() {
  const [indexOpen, setIndexOpen] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState(null);
  const [interactionState, setInteractionState] = useState("idle");
  const [showLegend, setShowLegend] = useState(() => localStorage.getItem("portfolio-controls-seen") !== "1");

  const resetWorkcell = useCallback(() => {
    window.dispatchEvent(new CustomEvent("portfolio:reset"));
  }, []);

  const openArtifact = (id) => {
    const artifact = PORTFOLIO_ARTIFACTS.find((item) => item.id === id);
    if (!artifact) return;
    resetWorkcell();
    setActiveArtifact(artifact);
    setIndexOpen(false);
  };

  const openIndex = () => {
    resetWorkcell();
    setActiveArtifact(null);
    setIndexOpen(true);
  };

  const closePanel = () => {
    setIndexOpen(false);
    setActiveArtifact(null);
    resetWorkcell();
  };

  const handleScanComplete = useCallback((artifact) => {
    setActiveArtifact(artifact);
    setIndexOpen(false);
  }, []);

  const dismissLegend = () => {
    if (!showLegend) return;
    localStorage.setItem("portfolio-controls-seen", "1");
    setShowLegend(false);
  };

  return (
    <main className="gameShell" onPointerDownCapture={dismissLegend}>
      <RobotArmGame onScanComplete={handleScanComplete} onStateChange={setInteractionState} />
      <HudNav onOpenArtifact={openArtifact} onOpenIndex={openIndex} />
      <ArtifactPanel
        artifact={activeArtifact}
        isOpen={indexOpen || Boolean(activeArtifact)}
        onClose={closePanel}
        onOpenArtifact={openArtifact}
      />
      {showLegend && <div className="controlLegend">CLICK AN ARTIFACT <span /> ROBOT PICKS UP <span /> SCAN OPENS DETAILS</div>}
      <div className="sceneCaption"><span>ROBOTICS WORKCELL 01</span><strong>{STATE_LABELS[interactionState]}</strong></div>
    </main>
  );
}
