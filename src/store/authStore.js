import { create } from 'zustand';

const SESSION_KEY = 'kna.demo.session';
const initialId = typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(SESSION_KEY);

const useAuthStore = create((set) => ({
  userId: initialId,
  user: null,
  setUser(user) {
    if (user) sessionStorage.setItem(SESSION_KEY, user.id);
    else sessionStorage.removeItem(SESSION_KEY);
    set({ userId: user?.id ?? null, user: user ?? null });
  },
}));

export default useAuthStore;
