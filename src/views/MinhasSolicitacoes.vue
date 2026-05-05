<template>
  <div class="minhas-solicitacoes">
    <HeaderAluno />
    <main class="solicitacoes-main">
      <SidebarAluno />
      <section class="content">
        <div class="content-header">
          <h1>Minhas Solicitações</h1>
          <p>Histórico de todas as suas solicitações de EPIs</p>
        </div>

        <div class="solicitacoes-list">
          <div v-for="solicitacao in solicitacoes" :key="solicitacao.idsolicitacoes" class="solicitacao-card">
            <div class="solicitacao-info">
              <h3>{{ solicitacao.epis?.nome || 'EPI' }}</h3>
              <p class="solicitacao-type">{{ solicitacao.epis?.tipo || 'Tipo não informado' }}</p>
              <p class="solicitacao-date">Solicitado em: {{ formatDate(solicitacao.data_solicitacao) }}</p>
              <p v-if="solicitacao.data_aprovacao" class="solicitacao-date">Aprovado em: {{ formatDate(solicitacao.data_aprovacao) }}</p>
              <p v-if="solicitacao.data_entrega" class="solicitacao-date">Entregue em: {{ formatDate(solicitacao.data_entrega) }}</p>
              <p v-if="solicitacao.data_devolucao" class="solicitacao-date">Devolvido em: {{ formatDate(solicitacao.data_devolucao) }}</p>
            </div>
            <div class="solicitacao-status" :class="getStatusClass(solicitacao.status)">
              {{ getStatusText(solicitacao.status) }}
            </div>
          </div>
        </div>

        <div v-if="solicitacoes.length === 0" class="empty-state">
          Você ainda não fez nenhuma solicitação.
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import HeaderAluno from '../components/HeaderAluno.vue'
import SidebarAluno from '../components/SidebarAluno.vue'
// importa a função que conecta com o banco de dados do supabase
import { useSupabase } from '../composables/useSupabase'

// pega a conexão com o supabase e a sessão do usuário
const { supabase, session } = useSupabase()

// armazena todas as solicitações do aluno
const solicitacoes = ref([])

// carrega todas as solicitações do aluno logado
const loadSolicitacoes = async () => {
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

    // busca todas as solicitações do aluno
    const { data, error } = await supabase
      .from('solicitacoes')
      .select(`
        *,
        epis:epis_id (
          nome,
          tipo
        )
      `)
      .eq('aluno_id', alunoData.idaluno)
      // ordena pela data mais recente primeiro
      .order('data_solicitacao', { ascending: false })

    if (error) throw error
    // armazena as solicitações encontradas
    solicitacoes.value = data || []
  } catch (error) {
    console.error('Erro ao carregar solicitações:', error)
    alert('Erro ao carregar solicitações')
  }
}

// converte string de data em formato legível
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('pt-BR')
}

// retorna a classe css de acordo com o status
const getStatusClass = (status) => {
  switch (status) {
    case 'pendente': return 'status-pendente'
    case 'aprovado': return 'status-aprovado'
    case 'rejeitado': return 'status-rejeitado'
    case 'entregue': return 'status-entregue'
    case 'devolvido': return 'status-devolvido'
    default: return 'status-desconhecido'
  }
}

// converte o status em um texto legível
const getStatusText = (status) => {
  switch (status) {
    case 'pendente': return 'Pendente'
    case 'aprovado': return 'Aprovado'
    case 'rejeitado': return 'Rejeitado'
    case 'entregue': return 'Entregue'
    case 'devolvido': return 'Devolvido'
    default: return status
  }
}

// executa quando a página carrega
onMounted(() => {
  // carrega as solicitações do aluno
  loadSolicitacoes()
})
</script>

<style scoped>
.minhas-solicitacoes {
  min-height: 100vh;
  background-color: #293140;
}

.solicitacoes-main {
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

.solicitacoes-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.solicitacao-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.solicitacao-info h3 {
  color: white;
  margin-bottom: 5px;
}

.solicitacao-type, .solicitacao-date {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin: 2px 0;
}

.solicitacao-status {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
  text-align: center;
}

.status-pendente {
  background: #ff9800;
  color: white;
}

.status-aprovado {
  background: #4CAF50;
  color: white;
}

.status-rejeitado {
  background: #f44336;
  color: white;
}

.status-entregue {
  background: #9C27B0;
  color: white;
}

.status-devolvido {
  background: #2196F3;
  color: white;
}

.empty-state {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
  margin-top: 50px;
}
</style>