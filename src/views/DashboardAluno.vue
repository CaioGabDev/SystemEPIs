<template>
  <div class="dashboard-aluno">
    <HeaderAluno />
    <main class="aluno-main">
      <SidebarAluno />
      <section class="content">
        <div class="content-header">
          <h1>Dashboard do Aluno</h1>
          <p>Visão geral rápida dos seus EPIs e solicitações</p>
        </div>

        <div class="dashboard-grid">
          <div class="dashboard-card">
            <h2>EPIs com Você</h2>
            <div class="card-content">
              <div class="stat-number">{{ episAtribuidos.length }}</div>
              <p>EPIs atualmente atribuídos</p>
              <div class="epi-list">
                <div v-for="epi in episAtribuidos.slice(0, 3)" :key="epi.id_entrega_aluno" class="epi-item">
                  {{ epi.epis?.nome || 'EPI' }}
                </div>
              </div>
            </div>
          </div>

          <div class="dashboard-card">
            <h2>Solicitações Pendentes</h2>
            <div class="card-content">
              <div class="stat-number">{{ solicitacoesPendente.length }}</div>
              <p>Aguardando aprovação</p>
              <div class="solicitacao-list">
                <div v-for="sol in solicitacoesPendente.slice(0, 3)" :key="sol.idsolicitacoes" class="solicitacao-item">
                  {{ sol.epis?.nome || 'EPI' }}
                </div>
              </div>
            </div>
          </div>

          <div class="dashboard-card">
            <h2>Avisos Importantes</h2>
            <div class="card-content">
              <ul class="avisos-list">
                <li v-if="episVencendo.length > 0">
                  <i class="fas fa-exclamation-triangle"></i>
                  {{ episVencendo.length }} EPI(s) próximo(s) do vencimento
                </li>
                <li v-if="solicitacoesPendente.length > 0">
                  <i class="fas fa-clock"></i>
                  Você tem solicitações pendentes
                </li>
                <li>
                  <i class="fas fa-info-circle"></i>
                  Mantenha seus EPIs em bom estado
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="recent-activity">
          <h2>Atividade Recente</h2>
          <div class="activity-list">
            <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
              <div class="activity-icon">
                <i :class="activity.icon"></i>
              </div>
              <div class="activity-content">
                <p>{{ activity.description }}</p>
                <span class="activity-date">{{ formatDate(activity.date) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import HeaderAluno from '../components/HeaderAluno.vue'
import SidebarAluno from '../components/SidebarAluno.vue'
// importa a função que conecta com o banco de dados do supabase
import { useSupabase } from '../composables/useSupabase'
import { useRouter } from 'vue-router'

// pega a conexão com supabase, sessão do usuário e função de logout
const { supabase, session, signOut } = useSupabase()
const router = useRouter()

// armazena os epis que estão com o aluno agora
const episAtribuidos = ref([])
// armazena todas as solicitações do aluno
const solicitacoes = ref([])
// armazena os epis que estão perto de vencer (em 30 dias)
const episVencendo = ref([])

// filtra apenas as solicitações que estão pendentes
const solicitacoesPendente = computed(() => {
  return solicitacoes.value.filter(sol => sol.status === 'pendente')
})

// cria uma lista com os ultimos 5 acontecimentos do aluno
const recentActivities = computed(() => {
  const activities = []
  
  // pega as ultimas 5 solicitações do aluno
  solicitacoes.value.slice(0, 5).forEach(sol => {
    activities.push({
      id: `sol-${sol.idsolicitacoes}`,
      description: `Solicitação de ${sol.epis?.nome || 'EPI'}`,
      date: sol.data_solicitacao,
      // muda o ícone de acordo com o status
      icon: sol.status === 'aprovado' ? 'fas fa-check-circle' : 
            sol.status === 'rejeitado' ? 'fas fa-times-circle' : 'fas fa-clock'
    })
  })

  // ordena pela data mais recente primeiro
  return activities.sort((a, b) => new Date(b.date) - new Date(a.date))
})

// carrega todos os dados do dashboard do aluno
const loadDashboardData = async () => {
  try {
    // pega o email do usuário logado
    const userEmail = session.value.user.email;
    // busca o id do aluno usando o email
    const { data: alunoData } = await supabase
      .from('aluno')
      .select('idaluno')
      .eq('email', userEmail)
      .single();

    if (!alunoData) {
      console.error('Aluno não encontrado');
      return;
    }

    const alunoId = alunoData.idaluno;

    // carrega os epis que estão atribuídos ao aluno
    const { data: episData, error: episError } = await supabase
      .from('aluno_has_epis')
      .select(`
        *,
        epis:epis_id (
          nome,
          tipo,
          data_validade
        )
      `)
      .eq('aluno_id', alunoId)

    if (episError) throw episError
    episAtribuidos.value = episData || []

    // carrega todas as solicitações do aluno
    const { data: solData, error: solError } = await supabase
      .from('solicitacoes')
      .select(`
        *,
        epis:epis_id (
          nome,
          tipo
        )
      `)
      .eq('aluno_id', alunoId)
      // ordena pela data mais recente primeiro
      .order('data_solicitacao', { ascending: false })

    if (solError) throw solError
    solicitacoes.value = solData || []

    // verifica quais epis estão vencendo (em até 30 dias)
    episVencendo.value = episAtribuidos.value.filter(epi => {
      if (!epi.epis?.data_validade) return false
      // pega a data de validade do epi
      const validade = new Date(epi.epis.data_validade)
      const hoje = new Date()
      // calcula a diferença em dias
      const diffTime = validade - hoje
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      // retorna true se vencer em até 30 dias e ainda não venceu
      return diffDays <= 30 && diffDays > 0
    })

  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error)
  }
}

// converte string de data em formato legível
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('pt-BR')
}

// faz o logout do aluno
const handleLogout = async () => {
  try {
    // chama a função de logout do supabase
    await signOut()
    // redireciona para a página de login
    router.push('/login')
  } catch (error) {
    alert('Erro ao desconectar: ' + error.message)
  }
}

// executa quando a página carrega
onMounted(() => {
  // carrega todos os dados do dashboard
  loadDashboardData()
})
</script>

<style scoped>
.dashboard-aluno {
  min-height: 100vh;
  background-color: #293140;
}

.aluno-main {
  display: flex;
  min-height: calc(100vh - 80px);
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.content-header {
  margin-bottom: 20px;
}

.content-header h1 {
  color: white;
  font-size: 2rem;
  margin-bottom: 5px;
}

.content-header p {
  color: rgba(255, 255, 255, 0.8);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.dashboard-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dashboard-card h2 {
  color: white;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.card-content {
  text-align: center;
}

.stat-number {
  font-size: 3rem;
  font-weight: bold;
  color: white;
  margin-bottom: 5px;
}

.card-content p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 15px;
}

.epi-list, .solicitacao-list {
  max-height: 100px;
  overflow-y: auto;
}

.epi-item, .solicitacao-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 8px;
  margin: 5px 0;
  border-radius: 6px;
  color: white;
  font-size: 0.9rem;
}

.avisos-list {
  list-style: none;
  padding: 0;
}

.avisos-list li {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.avisos-list i {
  color: #ff9800;
}

.recent-activity h2 {
  color: white;
  margin-bottom: 15px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.activity-item {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 15px;
}

.activity-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.activity-content p {
  color: white;
  margin: 0;
  font-size: 0.9rem;
}

.activity-date {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
}
</style>

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
