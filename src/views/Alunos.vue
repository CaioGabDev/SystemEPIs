<template>
  <div class="alunos-container" @click="activeMenu = null">
    <HeaderGeral />

    <main class="alunos-main">
      <div class="alunos-header">
        <h1 class="alunos-title">Gestão de Alunos</h1>
        <p class="sub">Total de alunos cadastrados: {{ stats.total }}</p>
      </div>

      <div class="filter-section">
        <div class="search-box">
          <input v-model="searchQuery" type="text" placeholder="🔍 Buscar por nome, email ou CPF..."
            class="search-input" />
        </div>
        <div class="filter-buttons">
          <button class="btn-filter" @click="openCadastroModal">➕ Cadastrar Aluno</button>
        </div>
      </div>

      <div class="table-section">
        <table class="alunos-table">
          <thead>
            <tr>
              <th>NOME</th>
              <th>EMAIL</th>
              <th>CPF</th>
              <th>TELEFONE</th>
              <th>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="aluno in filteredAlunos" :key="aluno.idaluno">
              <td>
                <div class="user-info">
                  <div class="avatar-mini">
                    <img v-if="aluno.foto" :src="aluno.foto" alt="Foto do aluno" />
                    <span v-else class="avatar-placeholder">
                      {{ aluno.nome ? aluno.nome.charAt(0).toUpperCase() : '👤' }}
                    </span>
                  </div>
                  <strong>{{ aluno.nome }} {{ aluno.sobrenome }}</strong>
                </div>
              </td>
              <td>{{ aluno.email || 'Não informado' }}</td>
              <td>{{ aluno.cpf || 'Não informado' }}</td>
              <td>{{ aluno.telefone || 'Não informado' }}</td>
              <td class="actions">
                <button class="btn-action" @click="openMenu($event, aluno)" title="Opções">
                  ⋮
                </button>
                <div v-if="activeMenu === aluno.idaluno" class="action-menu" @click.stop>
                  <button @click="editarAluno(aluno)" class="menu-item">✏️ Editar</button>
                  <button @click="abrirDetalhesAluno(aluno)" class="menu-item">📦 Ver EPIs</button>
                  <div class="divider"></div>
                  <button @click="deletarAluno(aluno.idaluno)" class="menu-item delete">🗑️ Excluir</button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredAlunos.length === 0">
              <td colspan="5" class="no-data">Nenhum aluno encontrado na busca.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <div v-if="showCadastroModal" class="modal-overlay" @click="closeCadastroModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ isEditando ? 'Editar Aluno' : 'Cadastrar Novo Aluno' }}</h2>
          <button class="btn-close" @click="closeCadastroModal">&times;</button>
        </div>
        <p v-if="!isEditando" class="modal-warning">
          ⚠️ Nota: Cadastrar manualmente não gera uma senha de acesso. O ideal é o aluno usar a tela de /cadastro.
        </p>
        <form class="modal-form" @submit.prevent="salvarAluno">
          <div class="form-row">
            <div class="form-group">
              <label>Nome *</label>
              <input v-model="form.nome" type="text" required placeholder="Ex: João" />
            </div>
            <div class="form-group">
              <label>Sobrenome</label>
              <input v-model="form.sobrenome" type="text" placeholder="Ex: Silva" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>CPF</label>
              <input v-model="form.cpf" type="text" placeholder="Apenas números" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input v-model="form.email" type="email" placeholder="joao@email.com" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Telefone</label>
              <input v-model="form.telefone" type="text" placeholder="(00) 00000-0000" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="closeCadastroModal">Cancelar</button>
            <button type="submit" class="btn-submit">Salvar Dados</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showDetalhesModal" class="modal-overlay" @click="showDetalhesModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>EPIs Vinculados: {{ detalhesAluno.nome }}</h2>
          <button class="btn-close" @click="showDetalhesModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="loadingEPIsAluno" class="loading-state">Carregando equipamentos...</div>
          <div v-else>
            <ul v-if="episDoAluno.length > 0" class="epi-list">
              <li v-for="item in episDoAluno" :key="item.id_entrega_aluno" class="epi-item">
                <span class="epi-nome">{{ item.epis?.nome }}</span>
                <span class="epi-patrimonio">Patrimônio: {{ item.epis?.codigo_patrimonio || 'N/A' }}</span>
              </li>
            </ul>
            <div v-else class="no-data-modal">
              Nenhum EPI registrado ou entregue para este aluno.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import HeaderGeral from '../components/HeaderGeral.vue'
import { ref, computed, onMounted } from 'vue'
import { useSupabase } from '../composables/useSupabase'

const { getAlunos, addAluno, updateAluno, deleteAluno, getAlunoComEPIs } = useSupabase()

const alunos = ref([])
const searchQuery = ref('')
const activeMenu = ref(null)
const showCadastroModal = ref(false)
const isEditando = ref(false)
const form = ref({ nome: '', sobrenome: '', cpf: '', email: '', telefone: '' })
const editandoId = ref(null)
const stats = ref({ total: 0 })

const showDetalhesModal = ref(false)
const detalhesAluno = ref({})
const episDoAluno = ref([])
const loadingEPIsAluno = ref(false)

const filteredAlunos = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return alunos.value
  return alunos.value.filter(a =>
    (a.nome || '').toLowerCase().includes(q) ||
    (a.sobrenome || '').toLowerCase().includes(q) ||
    (a.email || '').toLowerCase().includes(q) ||
    (a.cpf || '').includes(q)
  )
})

const carregarAlunos = async () => {
  try {
    alunos.value = await getAlunos() || []
    stats.value.total = alunos.value.length
  } catch (error) {
    console.error('Erro ao carregar alunos:', error)
    alert('Erro ao carregar a lista de alunos.')
  }
}

const openCadastroModal = () => {
  isEditando.value = false
  form.value = { nome: '', sobrenome: '', cpf: '', email: '', telefone: '' }
  editandoId.value = null
  showCadastroModal.value = true
}

const closeCadastroModal = () => {
  showCadastroModal.value = false
}

const salvarAluno = async () => {
  try {
    if (!form.value.nome || !form.value.nome.trim()) {
      alert('O nome do aluno é obrigatório.')
      return
    }

    if (isEditando.value && editandoId.value) {
      await updateAluno(editandoId.value, form.value)
      alert('Dados do aluno atualizados com sucesso!')
    } else {
      await addAluno(form.value)
      alert('Aluno cadastrado com sucesso!')
    }

    await carregarAlunos()
    closeCadastroModal()
  } catch (error) {
    console.error('Erro ao salvar aluno:', error)
    alert('Erro ao salvar aluno: ' + (error.message || error))
  }
}

const openMenu = (event, aluno) => {
  event.stopPropagation() // Evita que o click propague e feche o menu imediatamente
  activeMenu.value = activeMenu.value === aluno.idaluno ? null : aluno.idaluno
}

const editarAluno = (aluno) => {
  isEditando.value = true
  editandoId.value = aluno.idaluno
  form.value = {
    nome: aluno.nome || '',
    sobrenome: aluno.sobrenome || '',
    cpf: aluno.cpf || '',
    email: aluno.email || '',
    telefone: aluno.telefone || ''
  }
  showCadastroModal.value = true
  activeMenu.value = null
}

const abrirDetalhesAluno = async (aluno) => {
  detalhesAluno.value = aluno
  loadingEPIsAluno.value = true
  showDetalhesModal.value = true
  activeMenu.value = null
  try {
    console.log('Buscando EPIs do aluno:', aluno.idaluno)
    episDoAluno.value = await getAlunoComEPIs(aluno.idaluno) || []
    console.log('EPIs encontrados:', episDoAluno.value)
  } catch (error) {
    console.error('Erro ao carregar EPIs do aluno:', error)
    episDoAluno.value = []
  } finally {
    loadingEPIsAluno.value = false
  }
}

const deletarAluno = async (id) => {
  if (!confirm('ATENÇÃO: Deseja realmente deletar este aluno do sistema?')) return
  try {
    await deleteAluno(id)
    alert('Aluno removido com sucesso.')
    await carregarAlunos()
  } catch (error) {
    console.error('Erro ao deletar aluno:', error)
    alert('Erro ao deletar aluno. Verifique se ele possui EPIs pendentes.')
  }
  activeMenu.value = null
}

onMounted(carregarAlunos)
</script>

<style scoped>
.alunos-container {
  min-height: 100vh;
  background: #293140;
  color: #edf2f7;
}

.alunos-main {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.alunos-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-direction: column;
}

.alunos-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
}

.sub {
  color: #a0aec0;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 24px;
}

.search-box {
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 10px 16px;
  border-radius: 8px;
  background: #1a202c;
  border: 1px solid #4a5568;
  color: #edf2f7;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #f05432;
}

.btn-filter {
  background: #f05432;
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
}

.btn-filter:hover {
  background: #d94a2b;
}


.table-section {
  background: #1a202c;
  border-radius: 12px;
  padding: 1px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  overflow: visible;
}

.alunos-table {
  width: 100%;
  border-collapse: collapse;
}

.alunos-table thead {
  background: #2d3748;
}

.alunos-table th {
  padding: 16px;
  text-align: left;
  font-size: 0.85rem;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.alunos-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #2d3748;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-mini {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  background: #3d4555;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.avatar-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: #edf2f7;
  font-weight: 700;
  font-size: 1rem;
}

.no-data {
  text-align: center;
  padding: 32px;
  color: #a0aec0;
}


.actions {
  position: relative;
  width: 60px;
  text-align: center;
}

.btn-action {
  background: transparent;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 4px 12px;
  transition: color 0.2s;
}

.btn-action:hover {
  color: #fff;
}

.action-menu {
  position: absolute;
  right: 20px;
  top: 40px;
  background: #2d3748;
  border: 1px solid #4a5568;
  border-radius: 8px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  z-index: 10;
  min-width: 150px;
}

.action-menu .menu-item {
  display: block;
  padding: 12px 16px;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  color: #edf2f7;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.action-menu .menu-item:hover {
  background: #4a5568;
}

.divider {
  height: 1px;
  background: #4a5568;
  margin: 4px 0;
}

.action-menu .menu-item.delete {
  color: #fc8181;
}

.action-menu .menu-item.delete:hover {
  background: rgba(252, 129, 129, 0.1);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #1a202c;
  width: 100%;
  max-width: 600px;
  border-radius: 12px;
  padding: 24px;
  color: #edf2f7;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.5);
  border: 1px solid #2d3748;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #2d3748;
  padding-bottom: 16px;
  margin-bottom: 20px;
}

.btn-close {
  background: transparent;
  border: none;
  color: #a0aec0;
  font-size: 1.5rem;
  cursor: pointer;
}

.btn-close:hover {
  color: #fff;
}

.modal-warning {
  background: rgba(237, 137, 54, 0.1);
  color: #ed8936;
  padding: 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  margin-bottom: 20px;
  border: 1px solid rgba(237, 137, 54, 0.2);
}

.modal-form .form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.85rem;
  color: #a0aec0;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  background: #2d3748;
  border: 1px solid #4a5568;
  color: #fff;
}

.form-group input:focus {
  outline: none;
  border-color: #f05432;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #2d3748;
}

.btn-submit {
  background: #f05432;
  color: #fff;
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

.btn-submit:hover {
  background: #d94a2b;
}

.btn-cancel {
  background: transparent;
  color: #a0aec0;
  padding: 10px 20px;
  border-radius: 6px;
  border: 1px solid #4a5568;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #2d3748;
  color: #fff;
}

.modal-body {
  padding: 10px 0;
}

.epi-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.epi-item {
  background: #2d3748;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.epi-nome {
  font-weight: bold;
  color: #fff;
}

.epi-patrimonio {
  font-size: 0.85rem;
  color: #a0aec0;
  background: #1a202c;
  padding: 4px 8px;
  border-radius: 4px;
}

.no-data-modal {
  text-align: center;
  color: #a0aec0;
  padding: 20px;
  font-style: italic;
}

.loading-state {
  text-align: center;
  color: #a0aec0;
  padding: 20px;
}
</style>