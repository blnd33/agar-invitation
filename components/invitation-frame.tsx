export default function InvitationFrame() {
  const outline = "M30 150V114Q30 80 64 72Q72 42 109 40Q145 14 200 14Q255 14 291 40Q328 42 336 72Q370 80 370 114V690Q370 725 341 732Q329 764 290 764H110Q71 764 59 732Q30 725 30 690Z";
  return <div className="invitation-frame" aria-hidden="true"><svg viewBox="0 0 400 800" preserveAspectRatio="none" fill="none"><path d={outline} vectorEffect="non-scaling-stroke"/><path d={outline} transform="translate(5 8) scale(.975 .979)" vectorEffect="non-scaling-stroke"/></svg></div>;
}
