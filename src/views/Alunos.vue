<template>
  <div class="alunos-container">
    <HeaderGeral />
    <main class="alunos-main">
      <div class="alunos-header">
        <h1 class="alunos-title">Gestão de Alunos</h1>
        <p class="sub">Total: {{ stats.total }}</p>
      </div>

      <div class="filter-section">
        <div class="search-box">
          <input v-model="searchQuery" type="text" placeholder="🔍 Buscar por nome, email ou CPF..." class="search-input" />
        </div>
        <div class="filter-buttons">
          <button class="btn-filter" @click="openCadastroModal">➕ Cadastrar</button>
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
              <td>{{ aluno.nome }} {{ aluno.sobrenome }}</td>
              <td>{{ aluno.email || '---' }}</td>
              <td>{{ aluno.cpf || '---' }}</td>
              <td>{{ aluno.telefone || '---' }}</td>
              <td class="actions">
                <button class="btn-action" @click="openMenu($event, aluno)">⋮</button>
                <div v-if="activeMenu === aluno.idaluno" class="action-menu">
                  <button @click="editarAluno(aluno)" class="menu-item">Editar</button>
                  <button @click="abrirDetalhesAluno(aluno)" class="menu-item">Detalhes</button>
                  <button @click="deletarAluno(aluno.idaluno)" class="menu-item delete">Deletar</button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredAlunos.length === 0">
              <td colspan="5" class="no-data">Nenhum aluno encontrado</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <div v-if="showCadastroModal" class="modal-overlay" @click="closeCadastroModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ isEditando ? 'Editar' : 'Cadastrar' }} Aluno</h2>
          <button class="btn-close" @click="closeCadastroModal">&times;</button>
        </div>
        <form class="modal-form" @submit.prevent="salvarAluno">
          <div class="form-row">
            <div class="form-group">
              <label>Nome *</label>
              <input v-model="form.nome" type="text" required />
            </div>
            <div class="form-group">
              <label>Sobrenome</label>
              <input v-model="form.sobrenome" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>CPF</label>
              <input v-model="form.cpf" type="text" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input v-model="form.email" type="email" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="submit" class="btn-submit">Salvar</button>
            <button type="button" class="btn-cancel" @click="closeCadastroModal">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showDetalhesModal" class="modal-overlay" @click="showDetalhesModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>EPIs de {{ detalhesAluno.nome }}</h2>
          <button class="btn-close" @click="showDetalhesModal = false">&times;</button>
        </div>
        <div class="modal-form">
          <div v-if="loadingEPIsAluno">Carregando...</div>
          <div v-else>
            <ul>
              <li v-for="item in episDoAluno" :key="item.id_entrega_aluno">
                {{ item.epis.nome }} — {{ item.epis.codigo_patrimonio || 'sem patrimônio' }}
              </li>
            </ul>
            <div v-if="episDoAluno.length === 0">Nenhum EPI registrado para este aluno.</div>
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
const form = ref({ nome: '', sobrenome: '', cpf: '', email: '' })
const editandoId = ref(null)
const stats = ref({ total: 0 })

// O ERRO ESTAVA AQUI: A variável e a função tinham o mesmo nome
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
    alert('Erro ao carregar alunos')
  }
}

const openCadastroModal = () => {
  isEditando.value = false
  form.value = { nome: '', sobrenome: '', cpf: '', email: '' }
  editandoId.value = null
  showCadastroModal.value = true
}

const closeCadastroModal = () => {
  showCadastroModal.value = false
}

const salvarAluno = async () => {
  try {
    if (!form.value.nome || !form.value.nome.trim()) {
      alert('Nome é obrigatório')
      return
    }

    if (isEditando.value && editandoId.value) {
      await updateAluno(editandoId.value, form.value)
      alert('Aluno atualizado')
    } else {
      await addAluno(form.value)
      alert('Aluno cadastrado')
    }

    await carregarAlunos()
    closeCadastroModal()
  } catch (error) {
    console.error('Erro ao salvar aluno:', error)
    alert('Erro ao salvar aluno: ' + (error.message || error))
  }
}

const openMenu = (event, aluno) => {
  event.stopPropagation()
  activeMenu.value = activeMenu.value === aluno.idaluno ? null : aluno.idaluno
}

const editarAluno = (aluno) => {
  isEditando.value = true
  editandoId.value = aluno.idaluno
  form.value = { nome: aluno.nome || '', sobrenome: aluno.sobrenome || '', cpf: aluno.cpf || '', email: aluno.email || '' }
  showCadastroModal.value = true
  activeMenu.value = null
}

// CORREÇÃO: Mudei o nome da função para evitar o conflito
const abrirDetalhesAluno = async (aluno) => {
  detalhesAluno.value = aluno
  loadingEPIsAluno.value = true
  showDetalhesModal.value = true
  activeMenu.value = null
  try {
    episDoAluno.value = await getAlunoComEPIs(aluno.idaluno) || []
  } catch (error) {
    console.error('Erro ao carregar EPIs do aluno:', error)
    episDoAluno.value = []
  } finally {
    loadingEPIsAluno.value = false
  }
}

const deletarAluno = async (id) => {
  if (!confirm('Deseja deletar este aluno?')) return
  try {
    await deleteAluno(id)
    alert('Aluno removido')
    await carregarAlunos()
  } catch (error) {
    console.error('Erro ao deletar aluno:', error)
    alert('Erro ao deletar aluno: ' + (error.message || error))
  }
  activeMenu.value = null
}

onMounted(carregarAlunos)
</script>

<style scoped>
/* Reaproveita estilo semelhante a EPIs.vue */
.alunos-main { padding: 24px; }
.alunos-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px }
.alunos-title { font-size:1.6rem }
.sub { color:#b0b5be }
.filter-section { display:flex; gap:1rem; margin-bottom:1rem }
.search-input { padding:8px; border-radius:8px; background:#3d4555; border:1px solid #556274; color:#e0e7ff }
.table-section { background:#3d4555; border-radius:12px; padding:12px }
.alunos-table { width:100%; border-collapse:collapse }
.alunos-table thead { background:#293140 }
.alunos-table th, .alunos-table td { padding:12px; text-align:left }
.actions { position:relative }
.btn-action { background:transparent; border:none; color:#fff; cursor:pointer }
.action-menu { position:absolute; right:8px; top:28px; background:#ffffff; color:#000; border-radius:6px; box-shadow:0 6px 18px rgba(0,0,0,0.2); overflow:hidden }
.action-menu .menu-item { display:block; padding:8px 12px; border:none; background:transparent; width:100%; text-align:left }
.action-menu .menu-item.delete { color:#ef4444 }
.no-data { text-align:center; padding:20px }
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center }
.modal-content { background:#fff; width:720px; border-radius:8px; padding:16px; color:#000 }
.modal-header { display:flex; justify-content:space-between; align-items:center }
.modal-form .form-row { display:flex; gap:12px; margin:8px 0 }
.form-group { flex:1 }
.input, input { width:100%; padding:8px }
.modal-footer { display:flex; gap:8px; justify-content:flex-end; margin-top:12px }
.btn-submit { background:#f05432; color:#fff; padding:8px 12px; border-radius:6px; border:none }
.btn-cancel { background:#e5e7eb; padding:8px 12px; border-radius:6px; border:none }
</style>