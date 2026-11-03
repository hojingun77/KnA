// 로컬 Node API(server/index.js) 클라이언트. 키는 서버에만 있고 여기서는 /api만 호출한다.
// API 서버가 꺼져 있으면 기능이 모두 꺼진 것으로 보고 main과 같은 흐름으로 동작한다.
let capabilitiesPromise;

async function postJson(path, payload, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `http_${res.status}`);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

export function getCapabilities() {
  if (!capabilitiesPromise) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    capabilitiesPromise = fetch('/api/health', { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => ({
        translate: Boolean(data?.translate?.google || data?.translate?.sllm),
        reward: Boolean(data?.reward?.sllm),
      }))
      .catch(() => ({ translate: false, reward: false }))
      .finally(() => clearTimeout(timer));
    // 서버를 나중에 켜도 다시 확인할 수 있게 30초 뒤 캐시를 비운다.
    setTimeout(() => { capabilitiesPromise = undefined; }, 30_000);
  }
  return capabilitiesPromise;
}

// 여러 문장(예: 질문 제목+본문)을 요청 한 번으로 번역한다. 응답: { results: [{ text, detectedSource }], engine }
export function translateTexts(texts, target) {
  return postJson('/api/translate', { texts, target }, 32_000);
}

export function classifyReward({ title, body, outputLocale }) {
  return postJson('/api/reward', { title, body, outputLocale }, 22_000);
}
