import { createRouter, createWebHistory } from 'vue-router'

import LandingPageView from '../views/LandingPageView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: LandingPageView,
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('../views/CalendarView.vue'),
    },
  ],
})
