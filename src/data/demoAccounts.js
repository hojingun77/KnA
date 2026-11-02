// Test-only credentials in the browser bundle; this is not production authentication.
export const DEMO_CREDENTIALS = Object.freeze([
  { id: 'demo-skyking', email: 'skyhao@gmail.com', password: 'skyhao2195!' },
  { id: 'demo-cutetl123', email: 'thilinh@gmail.com', password: 'thilinh7692!' },
  {
    id: 'demo-ghwlsrns03',
    email: 'ghwlsrns03@naver.com',
    salt: 'dd7c5ccbf1dd323283163c2296dd1396',
    passwordHash: '5a12bb0cf9d21215a4b272b4dfa688bc09ab07d0360bb994b6cb853aaa7cdc51',
  },
]);

export const DEMO_USERS = Object.freeze([
  { id: 'demo-skyking', ownerId: 'demo-skyking', email: 'skyhao@gmail.com', nickname: 'skyking', countryCode: 'CN', uiLanguage: 'zh-CN', openingPoints: 1000 },
  { id: 'demo-cutetl123', ownerId: 'demo-cutetl123', email: 'thilinh@gmail.com', nickname: 'cutetl123', countryCode: 'VN', uiLanguage: 'vi', openingPoints: 1000 },
  { id: 'demo-ghwlsrns03', ownerId: 'demo-ghwlsrns03', email: 'ghwlsrns03@naver.com', nickname: '달려라호순', countryCode: 'KR', uiLanguage: 'ko', openingPoints: 5000 },
]);
