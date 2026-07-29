/**
 * Vue Router — Game screen navigation
 * Task 12.2: Main Menu → Setup → Game → History / Leaderboard
 */

import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: 'Main Menu' },
    },
    {
      path: '/setup',
      name: 'setup',
      component: () => import('@/views/SetupView.vue'),
      meta: { title: 'Game Setup' },
    },
    {
      path: '/game',
      name: 'game',
      component: () => import('@/views/GameView.vue'),
      meta: { title: 'Play' },
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      // Task 12.5: lazy-load analytics panels
      component: () => import('@/views/LeaderboardView.vue'),
      meta: { title: 'Leaderboard' },
    },
    {
      path: '/history',
      name: 'history',
      // Task 12.5: lazy-load history panel
      component: () => import('@/views/HistoryView.vue'),
      meta: { title: 'Game History' },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'home' },
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const title = (to.meta.title as string) || 'Spider-Man Tic-Tac-Toe'
  document.title = `${title} | Spider-Man Tic-Tac-Toe`
})

export default router
