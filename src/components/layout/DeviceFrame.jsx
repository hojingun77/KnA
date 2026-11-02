import { useEffect, useState } from 'react';
import statusTime from '@/assets/figma/status-time.svg';
import statusRightSide from '@/assets/figma/status-right-side.svg';
import statusNotch from '@/assets/figma/status-notch.svg';

const FRAME_WIDTH = 393;
const FRAME_HEIGHT = 852;

function viewportScale() {
  if (typeof window === 'undefined') return 1;
  const viewport = window.visualViewport;
  return Math.min(1, (viewport?.width ?? window.innerWidth) / FRAME_WIDTH, (viewport?.height ?? window.innerHeight) / FRAME_HEIGHT);
}

/**
 * 모바일 앱 프레임 (Figma 393×852 기준)
 * 브라우저에서 모바일 앱처럼 보이도록 감싸는 컨테이너.
 */
export default function DeviceFrame({ children, login = false }) {
  const [scale, setScale] = useState(viewportScale);
  useEffect(() => {
    const update = () => setScale(viewportScale());
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
    };
  }, []);
  return (
    <div className="device-stage">
      <div className={`device-frame${login ? ' device-frame-login' : ''}`} style={{ transform: `scale(${scale})` }}>
        <div className="status-bar" aria-hidden="true"><img className="status-time" src={statusTime} alt="" /><img className="status-notch" src={statusNotch} alt="" /><img className="status-signals" src={statusRightSide} alt="" /></div>
        <div className="device-content">{children}</div>
      </div>
    </div>
  );
}
