<template>
  <div class="gerenciar-solicitacoes">
    <HeaderGeral />
    <main class="solicitacoes-admin-main">
      <div class="page-header">
        <h1>Gerenciar Solicitações de EPIs</h1>
        <p>Analise e aprove ou rejeite as solicitações de empréstimo dos alunos.</p>
      </div>

      <div class="filters-section">
        <div class="search-box">
          <i class="fas fa-search search-icon"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Buscar por aluno ou EPI..." 
            class="form-input"
          >
        </div>
        
        <select v-model="statusFilter" class="form-input select-input">
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="aprovado">Aprovado</option>
          <option value="rejeitado">Rejeitado</option>
          <option value="entregue">Entregue</option>
          <option value="devolvido">Devolvido</option>
        </select>

        <button 
          v-if="filteredSolicitacoes.some(s => s.status === 'pendente')"
          @click="aceitarTodos"
          class="btn btn-success-solid"
          title="Aprovar todas as solicitações pendentes"
        >
          <i class="fas fa-check-double"></i> Aceitar Todas
        </button>
      </div>

      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Carregando solicitações...</p>
      </div>

      <div v-else-if="filteredSolicitacoes.length === 0" class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>Nenhuma solicitação encontrada com os filtros atuais.</p>
      </div>

      <div v-else class="solicitacoes-container">
        <div v-for="solicitacao in filteredSolicitacoes" :key="solicitacao.idsolicitacoes" class="solicitacao-card">
          <div class="solicitacao-header">
            
            <div class="aluno-perfil-wrapper">
              <img 
                :src="getFotoUrl(solicitacao.aluno)" 
                alt="Foto do Aluno" 
                class="aluno-foto"
              >
              <div class="aluno-info">
                <h3>{{ solicitacao.aluno?.nome }} {{ solicitacao.aluno?.sobrenome }}</h3>
                <p class="aluno-email"><i class="fas fa-envelope"></i> {{ solicitacao.aluno?.email }}</p>
              </div>
            </div>

            <span :class="['status-badge', `status-${solicitacao.status}`]">
              {{ getStatusText(solicitacao.status) }}
            </span>
          </div>

          <div class="solicitacao-body">
            <div class="epi-info">
              <h4>{{ solicitacao.epis?.nome }}</h4>
              <div class="epi-details">
                <span class="epi-tag"><i class="fas fa-tag"></i> {{ solicitacao.epis?.tipo || 'N/A' }}</span>
                <span class="epi-date"><i class="fas fa-calendar-alt"></i> {{ formatDate(solicitacao.data_solicitacao) }}</span>
              </div>
            </div>

            <div class="solicitacao-actions" v-if="solicitacao.status === 'pendente'">
              <button 
                @click="aprovarSolicitacao(solicitacao)" 
                class="btn btn-success-outline"
                :disabled="processandoId === solicitacao.idsolicitacoes"
              >
                <i class="fas fa-check"></i> Aprovar
              </button>
              <button 
                @click="abrirRejeitarModal(solicitacao)" 
                class="btn btn-danger-outline"
                :disabled="processandoId === solicitacao.idsolicitacoes"
              >
                <i class="fas fa-times"></i> Rejeitar
              </button>
            </div>
            
            <div v-else-if="solicitacao.status === 'aprovado'" class="solicitacao-actions">
              <button 
                @click="marcarEntregue(solicitacao)" 
                class="btn btn-primary-outline"
                :disabled="processandoId === solicitacao.idsolicitacoes"
              >
                <i class="fas fa-box"></i> Entregar
              </button>
            </div>

            <div v-else-if="solicitacao.status === 'entregue'" class="solicitacao-actions">
              <button 
                @click="marcarDevolvido(solicitacao)" 
                class="btn btn-purple-outline"
                :disabled="processandoId === solicitacao.idsolicitacoes"
              >
                <i class="fas fa-undo"></i> Devolver
              </button>
            </div>
          </div>

          <div v-if="solicitacao.motivo_rejeicao" class="motivo-rejeicao">
            <i class="fas fa-exclamation-circle"></i>
            <div>
              <strong>Motivo da rejeição:</strong>
              <p>{{ solicitacao.motivo_rejeicao }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Transition name="modal-fade">
      <div v-if="showRejeitarModal" class="modal-overlay" @click="fecharRejeitarModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Rejeitar Solicitação</h3>
            <button class="btn-close" @click="fecharRejeitarModal"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body">
            <p>Deseja realmente rejeitar a solicitação de <strong>{{ solicitacaoSelecionada?.aluno?.nome }}</strong>?</p>
            <div class="form-group">
              <label for="motivo">Motivo da rejeição (opcional)</label>
              <textarea 
                id="motivo"
                v-model="motivoRejeicao" 
                placeholder="Explique o motivo da rejeição para o aluno..."
                class="form-input textarea-input"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="fecharRejeitarModal" class="btn btn-secondary">Cancelar</button>
            <button @click="confirmarRejeicao" class="btn btn-danger-solid">Confirmar Rejeição</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import HeaderGeral from '../components/HeaderGeral.vue'
import { useSupabase } from '../composables/useSupabase'
import { useRouter } from 'vue-router'

const { supabase, session, registrarEntregaEPI, removerEntregaEPI } = useSupabase()
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

// Função para retornar a foto do banco ou gerar uma imagem com as iniciais
const getFotoUrl = (aluno) => {
  if (aluno?.foto) return aluno.foto;
  
  // Se não tiver foto, gera um avatar com as iniciais do nome e sobrenome
  const inicialNome = aluno?.nome?.charAt(0) || '';
  const inicialSobrenome = aluno?.sobrenome?.charAt(0) || '';
  const iniciais = `${inicialNome}${inicialSobrenome}`.toUpperCase() || 'AL';
  
  // Retorna uma imagem gerada automaticamente
  return `https://ui-avatars.com/api/?name=${iniciais}&background=3b82f6&color=fff&size=128`;
}

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
        idsolicitacoes,
        aluno_id,
        epis_id,
        status,
        data_solicitacao,
        data_aprovacao,
        data_entrega,
        data_devolucao,
        motivo_rejeicao,
        aluno:aluno_id (
          nome,
          sobrenome,
          email,
          cpf,
          foto
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
  if (!confirm('Confirmar entrega do EPI ao aluno?')) return
  processandoId.value = solicitacao.idsolicitacoes

  try {
    const { error: updateError } = await supabase
      .from('solicitacoes')
      .update({
        status: 'entregue',
        data_entrega: new Date().toISOString().split('T')[0]
      })
      .eq('idsolicitacoes', solicitacao.idsolicitacoes)

    if (updateError) throw updateError

    const dataEntrega = new Date().toISOString().split('T')[0]
    await registrarEntregaEPI(
      solicitacao.aluno_id,
      solicitacao.epis_id,
      dataEntrega
    )
    loadSolicitacoes()
  } catch (error) {
    console.error('Erro ao marcar como entregue:', error)
    alert('Erro: ' + error.message)
  } finally {
    processandoId.value = null
  }
}

const marcarDevolvido = async (solicitacao) => {
  if (!confirm('Confirmar devolução do EPI?')) return
  processandoId.value = solicitacao.idsolicitacoes

  try {
    const { error: updateError } = await supabase
      .from('solicitacoes')
      .update({
        status: 'devolvido',
        data_devolucao: new Date().toISOString().split('T')[0]
      })
      .eq('idsolicitacoes', solicitacao.idsolicitacoes)

    if (updateError) throw updateError

    await removerEntregaEPI(solicitacao.aluno_id, solicitacao.epis_id)
    loadSolicitacoes()
  } catch (error) {
    console.error('Erro ao marcar como devolvido:', error)
    alert('Erro: ' + error.message)
  } finally {
    processandoId.value = null
  }
}

const aceitarTodos = async () => {
  const pendentes = solicitacoes.value.filter(s => s.status === 'pendente')
  if (pendentes.length === 0) return

  const confirmar = confirm(`Deseja aceitar todas as ${pendentes.length} solicitações pendentes?`)
  if (!confirmar) return

  try {
    for (const solicitacao of pendentes) {
      await supabase
        .from('solicitacoes')
        .update({
          status: 'aprovado',
          data_aprovacao: new Date().toISOString().split('T')[0]
        })
        .eq('idsolicitacoes', solicitacao.idsolicitacoes)
    }
    loadSolicitacoes()
  } catch (error) {
    console.error('Erro ao aceitar todos:', error)
    alert('Erro ao aceitar todos: ' + error.message)
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
  color: #edf2f7;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.solicitacoes-admin-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #ffffff;
  letter-spacing: -0.5px;
}

.page-header p {
  color: #94a3b8;
  font-size: 1.05rem;
}

.filters-section {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
  align-items: center;
  background: #2d3748;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.4);
  color: #f8fafc;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.search-box .form-input {
  padding-left: 40px;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  background: rgba(15, 23, 42, 0.6);
}

.form-input::placeholder {
  color: #64748b;
}

.select-input {
  flex: 0 1 200px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.btn-success-solid {
  background-color: #10b981;
  color: #ffffff;
}
.btn-success-solid:hover:not(:disabled) {
  background-color: #059669;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-success-outline {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.3);
}
.btn-success-outline:hover:not(:disabled) {
  background: #10b981;
  color: #ffffff;
}

.btn-danger-solid {
  background-color: #ef4444;
  color: #ffffff;
}
.btn-danger-solid:hover:not(:disabled) {
  background-color: #dc2626;
}

.btn-danger-outline {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}
.btn-danger-outline:hover:not(:disabled) {
  background: #ef4444;
  color: #ffffff;
}

.btn-primary-outline {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.3);
}
.btn-primary-outline:hover:not(:disabled) {
  background: #3b82f6;
  color: #ffffff;
}

.btn-purple-outline {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
  border-color: rgba(168, 85, 247, 0.3);
}
.btn-purple-outline:hover:not(:disabled) {
  background: #a855f7;
  color: #ffffff;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
  border-color: rgba(255, 255, 255, 0.1);
}
.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 80px 20px;
  background: #293140;
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  color: #94a3b8;
}

.loading-state i, .empty-state i {
  font-size: 2.5rem;
  margin-bottom: 16px;
  color: #475569;
}

.solicitacoes-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.solicitacao-card {
  background: #1a202c;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s ease;
}

.solicitacao-card:hover {
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

.solicitacao-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* CLASSES NOVAS PARA A FOTO DO ALUNO */
.aluno-perfil-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.aluno-foto {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background-color: #2d3748;
}
/* ================================== */

.aluno-info h3 {
  margin: 0 0 4px 0;
  font-size: 1.15rem;
  color: #f8fafc;
}

.aluno-email {
  margin: 0;
  color: #94a3b8;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.status-pendente { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
.status-aprovado { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
.status-rejeitado { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
.status-entregue { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
.status-devolvido { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }

/* Corpo do Card */
.solicitacao-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.epi-info h4 {
  margin: 0 0 10px 0;
  font-size: 1.05rem;
  color: #f1f5f9;
}

.epi-details {
  display: flex;
  gap: 16px;
  color: #94a3b8;
  font-size: 0.85rem;
}

.epi-details span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.solicitacao-actions {
  display: flex;
  gap: 12px;
}

.motivo-rejeicao {
  margin-top: 20px;
  padding: 16px;
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.motivo-rejeicao i {
  color: #f87171;
  margin-top: 3px;
}

.motivo-rejeicao strong {
  color: #f87171;
  font-size: 0.9rem;
  display: block;
  margin-bottom: 4px;
}

.motivo-rejeicao p {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.95rem;
  line-height: 1.5;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #1e2532;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #f8fafc;
}

.btn-close {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #ffffff;
}

.modal-body {
  padding: 24px;
}

.modal-body p {
  margin-top: 0;
  margin-bottom: 20px;
  color: #cbd5e1;
  line-height: 1.5;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #e2e8f0;
  font-size: 0.95rem;
}

.textarea-input {
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
  line-height: 1.5;
}

.modal-footer {
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .solicitacoes-admin-main {
    padding: 20px 16px;
  }
  
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .select-input {
    flex: none;
  }
  
  .solicitacao-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .status-badge {
    align-self: flex-start;
  }
  
  .solicitacao-body {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .solicitacao-actions {
    width: 100%;
    flex-direction: column;
  }
  
  .solicitacao-actions .btn {
    width: 100%;
  }
}
</style>