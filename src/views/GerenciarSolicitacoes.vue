<template>
  <div class="gerenciar-solicitacoes">
    <HeaderGeral />
    <main class="solicitacoes-admin-main">
      <div class="page-header">
        <h1>Gerenciar Solicitações de EPIs</h1>
        <p>Analise e aprove/rejeite solicitações de empréstimo</p>
      </div>

      <div class="filters-section">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Buscar por aluno ou EPI..." 
          class="search-input"
        >
        <select v-model="statusFilter" class="filter-select">
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="aprovado">Aprovado</option>
          <option value="rejeitado">Rejeitado</option>
          <option value="entregue">Entregue</option>
          <option value="devolvido">Devolvido</option>
        </select>
      </div>

      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Carregando solicitações...
      </div>

      <div v-else-if="filteredSolicitacoes.length === 0" class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>Nenhuma solicitação encontrada</p>
      </div>

      <div v-else class="solicitacoes-container">
        <div v-for="solicitacao in filteredSolicitacoes" :key="solicitacao.idsolicitacoes" class="solicitacao-card">
          <div class="solicitacao-header">
            <div class="aluno-info">
              <h3>{{ solicitacao.aluno?.nome }} {{ solicitacao.aluno?.sobrenome }}</h3>
              <p class="aluno-email">{{ solicitacao.aluno?.email }}</p>
            </div>
            <span :class="['status-badge', `status-${solicitacao.status}`]">
              {{ getStatusText(solicitacao.status) }}
            </span>
          </div>

          <div class="solicitacao-body">
            <div class="epi-info">
              <h4>{{ solicitacao.epis?.nome }}</h4>
              <p>Tipo: {{ solicitacao.epis?.tipo || 'N/A' }}</p>
              <p>Solicitado em: {{ formatDate(solicitacao.data_solicitacao) }}</p>
            </div>

            <div class="solicitacao-actions" v-if="solicitacao.status === 'pendente'">
              <button 
                @click="aprovarSolicitacao(solicitacao)" 
                class="btn-aprovar"
                :disabled="processandoId === solicitacao.idsolicitacoes"
              >
                <i class="fas fa-check"></i> Aprovar
              </button>
              <button 
                @click="abrirRejeitarModal(solicitacao)" 
                class="btn-rejeitar"
                :disabled="processandoId === solicitacao.idsolicitacoes"
              >
                <i class="fas fa-times"></i> Rejeitar
              </button>
            </div>
            
            <div v-else-if="solicitacao.status === 'aprovado'" class="solicitacao-actions">
              <button 
                @click="marcarEntregue(solicitacao)" 
                class="btn-entregar"
              >
                <i class="fas fa-box"></i> Marcar como Entregue
              </button>
            </div>

            <div v-else-if="solicitacao.status === 'entregue'" class="solicitacao-actions">
              <button 
                @click="marcarDevolvido(solicitacao)" 
                class="btn-devolver"
              >
                <i class="fas fa-undo"></i> Marcar como Devolvido
              </button>
            </div>
          </div>

          <div v-if="solicitacao.motivo_rejeicao" class="motivo-rejeicao">
            <strong>Motivo da rejeição:</strong> {{ solicitacao.motivo_rejeicao }}
          </div>
        </div>
      </div>
    </main>

    <!-- Modal para rejeição com motivo -->
    <div v-if="showRejeitarModal" class="modal-overlay" @click="fecharRejeitarModal">
      <div class="modal-content" @click.stop>
        <h3>Rejeitar Solicitação</h3>
        <p>Deseja rejeitar a solicitação de <strong>{{ solicitacaoSelecionada?.aluno?.nome }}</strong>?</p>
        <div class="form-group">
          <label>Motivo da rejeição (opcional)</label>
          <textarea 
            v-model="motivoRejeicao" 
            placeholder="Explique o motivo da rejeição..."
            class="textarea-input"
          ></textarea>
        </div>
        <div class="modal-actions">
          <button @click="fecharRejeitarModal" class="btn-cancel">Cancelar</button>
          <button @click="confirmarRejeicao" class="btn-rejeitar-confirm">Confirmar Rejeição</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import HeaderGeral from '../components/HeaderGeral.vue'
import { useSupabase } from '../composables/useSupabase'
import { useRouter } from 'vue-router'

const { supabase, session } = useSupabase()
const router = useRouter()

const solicitacoes = ref([])
const searchQuery = ref('')
const statusFilter = ref('')
const loading = ref(true)
const showRejeitarModal = ref(false)
const solicitacaoSelecionada = ref(null)
const motivoRejeicao = ref('')
const processandoId = ref(null)

const filteredSolicitacoes = computed(() => {
  return solicitacoes.value.filter(sol => {
    const matchesSearch = !searchQuery.value || 
      sol.aluno?.nome.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      sol.aluno?.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      sol.epis?.nome.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesStatus = !statusFilter.value || sol.status === statusFilter.value
    
    return matchesSearch && matchesStatus
  })
})

const formatDate = (dateString) => {
  if (!dateString) return '---'
  return new Date(dateString).toLocaleDateString('pt-BR')
}

const getStatusText = (status) => {
  const statusMap = {
    pendente: 'Pendente',
    aprovado: 'Aprovado',
    rejeitado: 'Rejeitado',
    entregue: 'Entregue',
    devolvido: 'Devolvido'
  }
  return statusMap[status] || status
}

const loadSolicitacoes = async () => {
  try {
    const { data, error } = await supabase
      .from('solicitacoes')
      .select(`
        *,
        aluno:aluno_id (
          nome,
          sobrenome,
          email,
          cpf
        ),
        epis:epis_id (
          nome,
          tipo,
          codigo_patrimonio
        )
      `)
      .order('data_solicitacao', { ascending: false })

    if (error) throw error
    solicitacoes.value = data || []
  } catch (error) {
    console.error('Erro ao carregar solicitações:', error)
    alert('Erro ao carregar solicitações')
  } finally {
    loading.value = false
  }
}

const aprovarSolicitacao = async (solicitacao) => {
  if (!confirm(`Aprovar solicitação de ${solicitacao.aluno?.nome}?`)) return

  processandoId.value = solicitacao.idsolicitacoes

  try {
    const { error } = await supabase
      .from('solicitacoes')
      .update({
        status: 'aprovado',
        data_aprovacao: new Date().toISOString().split('T')[0]
      })
      .eq('idsolicitacoes', solicitacao.idsolicitacoes)

    if (error) throw error

    alert('Solicitação aprovada com sucesso!')
    loadSolicitacoes()
  } catch (error) {
    console.error('Erro ao aprovar solicitação:', error)
    alert('Erro ao aprovar solicitação: ' + error.message)
  } finally {
    processandoId.value = null
  }
}

const abrirRejeitarModal = (solicitacao) => {
  solicitacaoSelecionada.value = solicitacao
  motivoRejeicao.value = ''
  showRejeitarModal.value = true
}

const fecharRejeitarModal = () => {
  showRejeitarModal.value = false
  solicitacaoSelecionada.value = null
  motivoRejeicao.value = ''
}

const confirmarRejeicao = async () => {
  if (!solicitacaoSelecionada.value) return

  processandoId.value = solicitacaoSelecionada.value.idsolicitacoes

  try {
    const { error } = await supabase
      .from('solicitacoes')
      .update({
        status: 'rejeitado',
        motivo_rejeicao: motivoRejeicao.value || null
      })
      .eq('idsolicitacoes', solicitacaoSelecionada.value.idsolicitacoes)

    if (error) throw error

    alert('Solicitação rejeitada com sucesso!')
    fecharRejeitarModal()
    loadSolicitacoes()
  } catch (error) {
    console.error('Erro ao rejeitar solicitação:', error)
    alert('Erro ao rejeitar solicitação: ' + error.message)
  } finally {
    processandoId.value = null
  }
}

const marcarEntregue = async (solicitacao) => {
  if (!confirm('Marcar como entregue?')) return

  processandoId.value = solicitacao.idsolicitacoes

  try {
    const { error } = await supabase
      .from('solicitacoes')
      .update({
        status: 'entregue',
        data_entrega: new Date().toISOString().split('T')[0]
      })
      .eq('idsolicitacoes', solicitacao.idsolicitacoes)

    if (error) throw error

    alert('Marcado como entregue!')
    loadSolicitacoes()
  } catch (error) {
    console.error('Erro ao marcar como entregue:', error)
    alert('Erro: ' + error.message)
  } finally {
    processandoId.value = null
  }
}

const marcarDevolvido = async (solicitacao) => {
  if (!confirm('Marcar como devolvido?')) return

  processandoId.value = solicitacao.idsolicitacoes

  try {
    const { error } = await supabase
      .from('solicitacoes')
      .update({
        status: 'devolvido',
        data_devolucao: new Date().toISOString().split('T')[0]
      })
      .eq('idsolicitacoes', solicitacao.idsolicitacoes)

    if (error) throw error

    alert('Marcado como devolvido!')
    loadSolicitacoes()
  } catch (error) {
    console.error('Erro ao marcar como devolvido:', error)
    alert('Erro: ' + error.message)
  } finally {
    processandoId.value = null
  }
}

onMounted(() => {
  loadSolicitacoes()
})
</script>

<style scoped>
.gerenciar-solicitacoes {
  min-height: 100vh;
  background-color: #293140;
}

.solicitacoes-admin-main {
  padding: 20px 50px;
  color: #edf2f7;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 2rem;
  margin-bottom: 5px;
  color: white;
}

.page-header p {
  color: rgba(255, 255, 255, 0.8);
}

.filters-section {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-input, .filter-select {
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-input, .filter-select {
  flex: 1;
  min-width: 200px;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.solicitacoes-container {
  display: grid;
  gap: 20px;
}

.solicitacao-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s;
}

.solicitacao-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.solicitacao-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.aluno-info h3 {
  margin: 0;
  font-size: 1.1rem;
}

.aluno-email {
  margin: 5px 0 0 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.85rem;
  white-space: nowrap;
}

.status-pendente {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid #ffc107;
}

.status-aprovado {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  border: 1px solid #4caf50;
}

.status-rejeitado {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border: 1px solid #f44336;
}

.status-entregue {
  background: rgba(33, 150, 243, 0.2);
  color: #2196f3;
  border: 1px solid #2196f3;
}

.status-devolvido {
  background: rgba(156, 39, 176, 0.2);
  color: #9c27b0;
  border: 1px solid #9c27b0;
}

.solicitacao-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.epi-info {
  flex: 1;
}

.epi-info h4 {
  margin: 0 0 8px 0;
  font-size: 1rem;
}

.epi-info p {
  margin: 4px 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.solicitacao-actions {
  display: flex;
  gap: 10px;
}

.btn-aprovar, .btn-rejeitar, .btn-entregar, .btn-devolver, .btn-rejeitar-confirm {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-aprovar {
  background: rgba(76, 175, 80, 0.3);
  color: #4caf50;
  border: 1px solid #4caf50;
}

.btn-aprovar:hover:not(:disabled) {
  background: #4caf50;
  color: white;
}

.btn-rejeitar {
  background: rgba(244, 67, 54, 0.3);
  color: #f44336;
  border: 1px solid #f44336;
}

.btn-rejeitar:hover:not(:disabled) {
  background: #f44336;
  color: white;
}

.btn-entregar {
  background: rgba(33, 150, 243, 0.3);
  color: #2196f3;
  border: 1px solid #2196f3;
}

.btn-entregar:hover {
  background: #2196f3;
  color: white;
}

.btn-devolver {
  background: rgba(156, 39, 176, 0.3);
  color: #9c27b0;
  border: 1px solid #9c27b0;
}

.btn-devolver:hover {
  background: #9c27b0;
  color: white;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.motivo-rejeicao {
  margin-top: 15px;
  padding: 12px;
  background: rgba(244, 67, 54, 0.1);
  border-left: 3px solid #f44336;
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #383e49;
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  color: white;
}

.modal-content h3 {
  margin-top: 0;
  font-size: 1.3rem;
  margin-bottom: 15px;
}

.modal-content p {
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.8);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.textarea-input {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
}

.textarea-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-rejeitar-confirm {
  padding: 10px 20px;
  background: #f44336;
  color: white;
  border: none;
}

.btn-rejeitar-confirm:hover {
  background: #da190b;
}
</style>