import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Cadastro from '../views/Cadastro.vue'
import CadastroFuncionario from '../views/CadastroFuncionario.vue'
import Dashboard from '../views/Dashboard.vue'
import DashboardAluno from '../views/DashboardAluno.vue'
import EPIs from '../views/EPIs.vue'
import Perfil from '../views/Perfil.vue'
import PerfilAluno from '../views/PerfilAluno.vue'
import CatalogoEPIs from '../views/CatalogoEPIs.vue'
import MinhasSolicitacoes from '../views/MinhasSolicitacoes.vue'
import GerenciarSolicitacoes from '../views/GerenciarSolicitacoes.vue'
import Alunos from '../views/Alunos.vue'
import { useSupabase } from '../composables/useSupabase'


// DEFINIÇÃO DAS ROTAS
const routes = [
  { 
    path: '/', 
    component: Home,
    meta: { requiresAuth: false }
  },
  { 
    path: '/login', 
    component: Login,
    meta: { requiresAuth: false }
  },
  { 
    path: '/cadastro', 
    component: Cadastro,
    meta: { requiresAuth: false }
  },
  { 
    path: '/cadastrar', 
    component: CadastroFuncionario,
    meta: { requiresAuth: false }
  },
  // ROTAS PROTEGIDAS - APENAS ADMIN/FUNCIONARIO
  { 
    path: '/dashboard', 
    component: Dashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { 
    path: '/epis', 
    component: EPIs,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { 
    path: '/gerenciar-solicitacoes', 
    component: GerenciarSolicitacoes,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { 
    path: '/perfil-adm', 
    component: Perfil,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { 
    path: '/alunos', 
    component: Alunos,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  // ROTAS PROTEGIDAS - APENAS ALUNO
  { 
    path: '/dashboard-aluno', 
    component: DashboardAluno,
    meta: { requiresAuth: true, requiresAluno: true }
  },
  { 
    path: '/catalogo-epis', 
    component: CatalogoEPIs,
    meta: { requiresAuth: true, requiresAluno: true }
  },
  { 
    path: '/minhas-solicitacoes', 
    component: MinhasSolicitacoes,
    meta: { requiresAuth: true, requiresAluno: true }
  },
  // ROTAS PROTEGIDAS - QUALQUER USUÁRIO AUTENTICADO
  { 
    path: '/perfil', 
    component: PerfilAluno,
    meta: { requiresAuth: true }
  }
]
    
const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const { session, loadingSession, getTipoUsuario, isAdmin, isAluno } = useSupabase()
  
  // AGUARDA CARREGAMENTO DA SESSÃO
  if (loadingSession.value) {
    await new Promise(resolve => {
      const interval = setInterval(() => {
        if (!loadingSession.value) {
          clearInterval(interval)
          resolve()
        }
      }, 50)
    })
  }
  
  // Verifica se a rota exige autenticação
  const requiresAuth = to.meta.requiresAuth
  const requiresAdmin = to.meta.requiresAdmin
  const requiresAluno = to.meta.requiresAluno
  
  // Pega o tipo do usuário atual
  const userType = getTipoUsuario()
  const isUserAdmin = isAdmin()
  const isUserAluno = isAluno()
  const isAuthenticated = !!session.value?.user
  
  // VALIDAÇÃO 1: Verifica autenticação

  if (requiresAuth && !isAuthenticated) {
    // Redireciona para login
    next('/login')
    return
  }
  

  // VALIDAÇÃO 2: Verifica se precisa ser ADMIN

  if (requiresAdmin && !isUserAdmin) {
    // Se for aluno, redireciona para dashboard do aluno
    if (isUserAluno) {
      next('/dashboard-aluno')
    } else {
      // Se não for autenticado, redireciona para home
      next('/')
    }
    return
  }
  

  // VALIDAÇÃO 3: Verifica se precisa ser ALUNO

  // Se a rota exige aluno mas usuário não é aluno
  if (requiresAluno && !isUserAluno) {
    // Se for admin, redireciona para dashboard de admin
    if (isUserAdmin) {
      next('/dashboard')
    } else {
      // Se não for autenticado, redireciona para home
      next('/')
    }
    return
  }
  

  // Permite a navegação
  next()
})

export default router