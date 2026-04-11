import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Cadastro from '../views/Cadastro.vue'
import Dashboard from '../views/Dashboard.vue'
import DashboardAluno from '../views/DashboardAluno.vue'
import EPIs from '../views/EPIs.vue'
import Perfil from '../views/Perfil.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/cadastro', component: Cadastro },
  { path: '/dashboard', component: Dashboard },
  { path: '/dashboard-aluno', component: DashboardAluno },
  { path: '/epis', component: EPIs },
  { path: '/perfil', component: Perfil }
]
    
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router