/**
 * 모바일 앱 프레임 (iPhone 14 기준 390x844)
 * 브라우저에서 모바일 앱처럼 보이도록 감싸는 컨테이너.
 */
export default function DeviceFrame({ children, login = false }) {
  return (
    <div className="device-stage">
      <div className={`device-frame${login ? ' device-frame-login' : ''}`}>
        <div className="status-bar" aria-hidden="true"><span>9:41</span><span className="notch" /><span>▮▮  ◕  ▰</span></div>
        <div className="device-content">{children}</div>
      </div>
    </div>
  );
}
