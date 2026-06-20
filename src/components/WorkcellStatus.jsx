const STATUS_BY_STATE = {
  rotateToPick: "TARGET ACQUIRED",
  approachPick: "APPROACHING",
  descendPick: "APPROACHING",
  gripPause: "GRIPPING",
  liftPick: "TRANSPORTING",
  rotateToScanner: "TRANSPORTING",
  transportToScanner: "TRANSPORTING",
  descendPlace: "TRANSPORTING",
  releasePause: "TRANSPORTING",
  retractFromScanner: "TRANSPORTING",
  scanning: "SCANNING",
  scanned: "SCAN COMPLETE",
  returnApproach: "RESETTING WORKCELL",
  returnDescend: "RESETTING WORKCELL",
  returnGrip: "RESETTING WORKCELL",
  returnLift: "RESETTING WORKCELL",
  returnRotate: "RESETTING WORKCELL",
  returnTransport: "RESETTING WORKCELL",
  returnDescendHome: "RESETTING WORKCELL",
  returnRelease: "RESETTING WORKCELL",
  returnRetract: "RESETTING WORKCELL",
};

export default function WorkcellStatus({ interactionState, scanProgress }) {
  const label = STATUS_BY_STATE[interactionState];
  const isScanning = interactionState === "scanning";
  const percent = Math.round(scanProgress * 100);

  return (
    <div className={`workcellStatus ${label ? "isVisible" : ""}`} aria-live="polite" aria-hidden={!label}>
      <span className="statusKicker">WORKCELL STATUS</span>
      <strong>{isScanning ? `${label} ${percent}%` : label}</strong>
      <div className={`statusProgress ${isScanning ? "isScanning" : ""}`} aria-hidden="true">
        <span style={{ width: `${isScanning ? percent : interactionState === "scanned" ? 100 : 0}%` }} />
      </div>
    </div>
  );
}
