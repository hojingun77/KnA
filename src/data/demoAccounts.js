// Test-only credentials in the browser bundle; this is not production authentication.
export const DEMO_CREDENTIALS = Object.freeze([
  { id: 'demo-skyking', email: 'skyhao@google.com', password: 'skyhao2195!' },
  { id: 'demo-cutetl123', email: 'thilinh@google.com', password: 'thilinh7692!' },
]);

export const DEMO_USERS = Object.freeze([
  { id: 'demo-skyking', ownerId: 'demo-skyking', email: 'skyhao@google.com', nickname: 'skyking', countryCode: 'CN', uiLanguage: 'zh-CN' },
  { id: 'demo-cutetl123', ownerId: 'demo-cutetl123', email: 'thilinh@google.com', nickname: 'cutetl123', countryCode: 'VN', uiLanguage: 'vi' },
]);
