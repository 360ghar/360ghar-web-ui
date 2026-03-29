import { create } from 'zustand';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

export const useBlogStore = create((set) => ({
  blogData: null,
  setBlogData: (data) => set({ blogData: data }),
  currentMonthName: monthNames[new Date().getMonth()],
}));
