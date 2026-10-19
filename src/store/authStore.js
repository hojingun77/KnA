import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 인증 상태 스토어
 * user: Firebase Auth 사용자 객체 (uid, email, displayName)
 * profile: Firestore users/{uid} 문서 (countryCode, languageCode, points, role)
 */
const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      profile: null,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      clearAuth: () => set({ user: null, profile: null }),
    }),
    {
      name: 'kna.auth',
      partialize: (state) => ({ profile: state.profile }), // user는 Firebase가 관리, profile만 유지
    }
  )
);

export default useAuthStore;
