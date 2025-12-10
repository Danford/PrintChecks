import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/customization',
      name: 'customization',
      component: () => import('../views/CustomizationView.vue')
    },
    {
      path: '/receipt',
      name: 'receipt',
      component: () => import('../views/ReceiptView.vue')
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../views/HistoryView.vue')
    },
    {
      path: '/banks',
      name: 'banks',
      component: () => import('../views/BankAccountsView.vue')
    },
    {
      path: '/vendors',
      name: 'vendors',
      component: () => import('../views/VendorsView.vue')
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: () => import('../views/AnalyticsView.vue')
    }
  ]
})

export default router
