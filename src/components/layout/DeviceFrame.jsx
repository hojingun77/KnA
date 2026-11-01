/**
 * 모바일 앱 프레임 (iPhone 14 기준 390x844)
 * 브라우저에서 모바일 앱처럼 보이도록 감싸는 컨테이너.
 */
export default function DeviceFrame({ children, login = false }) {
  return (
    <div className="device-stage">
      <div className={`device-frame${login ? ' device-frame-login' : ''}`}>
        <div className="status-bar" aria-hidden="true"><span>9:41</span><span className="notch" /><span className="status-signals"><svg viewBox="0 0 56 18" fill="none"><path d="M2 13h2v3H2zM6 10h2v6H6zM10 7h2v9h-2zM14 4h2v12h-2z" fill="currentColor" /><path d="M23 8c3.2-3 8.8-3 12 0M26 11c1.8-1.7 4.2-1.7 6 0M29 14h.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><rect x="40" y="5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><path d="M54 8v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><rect x="42" y="7" width="9" height="5" rx=".5" fill="currentColor" /></svg></span></div>
        <div className="device-content">{children}</div>
      </div>
    </div>
  );
}
