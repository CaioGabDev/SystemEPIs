<template>
  <div class="dashboard-aluno">
    <HeaderGeral />
    <main class="aluno-main">
      <section class="welcome-section">
        <div class="welcome-card">
          <h1>Bem-vindo(a) ao Sistema DashEPI</h1>
          <p>Gerencie seus EPIs (Equipamentos de Proteção Individual) de forma segura e eficiente.</p>
          <div class="quick-links">
            <router-link to="/perfil" class="link-btn">Acessar Perfil</router-link>
            <button @click="handleLogout" class="link-btn logout-btn">Sair</button>
          </div>
        </div>
      </section>

      <section class="info-section">
        <div class="info-card">
          <h2>Meus EPIs</h2>
          <p>Você ainda não tem EPIs atribuídos.</p>
        </div>
        <div class="info-card">
          <h2>Minhas Turmas</h2>
          <p>Você ainda não está matriculado em uma turma.</p>
        </div>
        <div class="info-card">
          <h2>Solicitações</h2>
          <p>Nenhuma solicitação pendente.</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import HeaderGeral from '../components/HeaderGeral.vue'
import { useSupabase } from '../composables/useSupabase'
import { useRouter } from 'vue-router'

const { signOut } = useSupabase()
const router = useRouter()

const handleLogout = async () => {
  try {
    await signOut()
    router.push('/login')
  } catch (error) {
    alert('Erro ao desconectar: ' + error.message)
  }
}
</script>

<style scoped>
.dashboard-aluno {
  min-height: 100vh;
  background: #1f2532;
  color: #edf2f7;
}

.aluno-main {
  width: min(1200px, 100%);
  margin: 0 auto;
  padding: 2rem;
}

.welcome-section {
  margin-bottom: 2rem;
}

.welcome-card {
  background: linear-gradient(135deg, #262c3d 0%, #3d4555 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 2.5rem;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
  text-align: center;
}

.welcome-card h1 {
  font-size: 2.2rem;
  margin: 0 0 1rem;
  color: #ffffff;
}

.welcome-card p {
  font-size: 1.1rem;
  color: #a0aec0;
  margin: 0 0 1.8rem;
  line-height: 1.6;
}

.quick-links {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.link-btn {
  padding: 0.9rem 2rem;
  border-radius: 999px;
  border: none;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  background: #f05432;
  color: white;
}

.link-btn:hover {
  background: #d64320;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(240, 84, 50, 0.3);
}

.logout-btn {
  background: #7b2d2d;
}

.logout-btn:hover {
  background: #5e1f1f;
}

.info-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.info-card {
  background: #262c3d;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 1.8rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.info-card h2 {
  margin: 0 0 1rem;
  font-size: 1.4rem;
  color: #f05432;
}

.info-card p {
  margin: 0;
  color: #94a3b8;
  font-size: 0.95rem;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .aluno-main {
    padding: 1rem;
  }

  .welcome-card {
    padding: 1.5rem;
  }

  .welcome-card h1 {
    font-size: 1.6rem;
  }

  .quick-links {
    flex-direction: column;
  }

  .link-btn {
    width: 100%;
  }

  .info-section {
    grid-template-columns: 1fr;
  }
}
</style>
