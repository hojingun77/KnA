/**
 * 모바일 앱 프레임 (iPhone 14 기준 390x844)
 * 브라우저에서 모바일 앱처럼 보이도록 감싸는 컨테이너.
 */
export default function DeviceFrame({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-card">
      <div
        className="relative overflow-hidden bg-surface shadow-2xl"
        style={{ width: 390, height: 844, borderRadius: 44 }}
      >
        {/* 상태바 영역 (노치) */}
        <div className="h-[44px] w-full bg-surface" />
        {/* 실제 콘텐츠 */}
        <div className="h-[calc(844px-44px)] w-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
