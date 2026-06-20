import React, { useCallback, useState } from "react";
import ArtifactPanel from "./components/ArtifactPanel.jsx";
import HudNav from "./components/HudNav.jsx";
import RobotArmGame from "./components/RobotArmGame.jsx";
import WorkcellStatus from "./components/WorkcellStatus.jsx";
import { PORTFOLIO_ARTIFACTS } from "./data/artifacts.js";

export default function App() {
  const [indexOpen, setIndexOpen] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState(null);
  const [interactionState, setInteractionState] = useState("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [controlMode, setControlMode] = useState("auto");
  const [showLegend, setShowLegend] = useState(() => localStorage.getItem("portfolio-controls-seen") !== "1");

  const resetWorkcell = useCallback(() => {
    window.dispatchEvent(new CustomEvent("portfolio:reset"));
  }, []);

  const openArtifact = (id) => {
    const artifact = PORTFOLIO_ARTIFACTS.find((item) => item.id === id);
    if (!artifact) return;
    if (interactionState === "scanned") resetWorkcell();
    setActiveArtifact(artifact);
    setIndexOpen(false);
  };

  const openIndex = () => {
    if (interactionState === "scanned") resetWorkcell();
    setActiveArtifact(null);
    setIndexOpen(true);
  };

  const closePanel = () => {
    const shouldReset = Boolean(activeArtifact) && interactionState === "scanned";
    setIndexOpen(false);
    setActiveArtifact(null);
    if (shouldReset) resetWorkcell();
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
      <RobotArmGame
        controlMode={controlMode}
        onScanComplete={handleScanComplete}
        onScanProgress={setScanProgress}
        onStateChange={setInteractionState}
      />
      <HudNav
        controlMode={controlMode}
        onControlModeChange={setControlMode}
        onOpenArtifact={openArtifact}
        onOpenIndex={openIndex}
      />
      <ArtifactPanel
        artifact={activeArtifact}
        isOpen={indexOpen || Boolean(activeArtifact)}
        onClose={closePanel}
        onOpenArtifact={openArtifact}
      />
      <WorkcellStatus interactionState={interactionState} scanProgress={scanProgress} />
      {showLegend && <div className="controlLegend">CLICK AN ARTIFACT <span /> ROBOT PICKS UP <span /> SCAN OPENS DETAILS</div>}
      <div className="sceneCaption"><span>ROBOTICS WORKCELL 01</span><strong>{controlMode === "manual" ? "CURSOR TARGETING ACTIVE" : interactionState === "idle" ? "SELECT AN ARTIFACT" : "AUTOMATED PICK + SCAN"}</strong></div>
    </main>
  );
}
