<template>
  <div class="funcionarios-container" @click="activeMenu = null">
    <HeaderGeral />
    
    <main class="funcionarios-main">
      <div class="funcionarios-header">
        <div>
          <h1 class="funcionarios-title">Gestão de Funcionários</h1>
          <p class="sub">Total de funcionário cadastrados: {{ stats.total }}</p>
        </div>
      </div>

      <div class="filter-section">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="🔍 Buscar por nome, email ou CPF..."
            class="search-input"
          />
        </div>
        <div class="filter-buttons">
          <button class="btn-filter" @click="openModal">➕ Cadastrar Funcionário</button>
        </div>
      </div>

      <div class="table-section">
        <div v-if="loadingFuncionarios" class="loading">
          ⏳ Carregando funcionários...
        </div>

        <table v-else class="funcionarios-table">
          <thead>
            <tr>
              <th>NOME</th>
              <th>FUNÇÃO</th>
              <th>EMAIL</th>
              <th>CPF</th>
              <th>TELEFONE</th>
              <th>STATUS</th>
              <th>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="func in filteredFuncionarios" :key="func.idfuncionario">
              <td>
                <div class="user-info">
                  <div class="avatar-mini">
                    <img v-if="func.foto" :src="func.foto" alt="Foto do funcionário" />
                    <span v-else class="avatar-placeholder">
                      {{ func.nome ? func.nome.charAt(0).toUpperCase() : '👤' }}
                    </span>
                  </div>
                  <strong>{{ func.nome }} {{ func.sobrenome }}</strong>
                </div>
              </td>
              <td>{{ func.funcao || 'Sem função' }}</td>
              <td>{{ func.email || 'Não informado' }}</td>
              <td>{{ func.cpf || 'Não informado' }}</td>
              <td>{{ func.telefone || 'Não informado' }}</td>
              <td>
                <span :class="['status-badge', func.status?.toLowerCase() === 'ativo' ? 'ativo' : 'inativo']">
                  {{ func.status || 'Desconhecido' }}
                </span>
              </td>
              <td class="actions">
                <button class="btn-action" @click="openMenu($event, func)" title="Opções">
                  ⋮
                </button>
                <div v-if="activeMenu === func.idfuncionario" class="action-menu" @click.stop>
                  <button @click="editarFuncionario(func)" class="menu-item">✏️ Editar</button>
                  <div class="divider"></div>
                  <button @click="deletarFuncionario(func.idfuncionario)" class="menu-item delete">🗑️ Excluir</button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredFuncionarios.length === 0 && !loadingFuncionarios">
              <td colspan="7" class="no-data">Nenhum funcionário encontrado na busca.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ isEditando ? 'Editar' : 'Cadastrar' }} Funcionário</h2>
          <button class="btn-close" @click="closeModal">&times;</button>
        </div>

        <form class="modal-form" @submit.prevent="handleCadastro">
          <div class="form-section">
            <div class="section-header">
              <span class="section-icon">👤</span>
              <h3>Dados pessoais</h3>
            </div>
            
            <div class="form-grid">
              <div class="form-group">
                <label>NOME *</label>
                <input 
                  type="text" 
                  v-model="nome" 
                  placeholder="Ex. João"
                  class="input-field"
                  required
                >
              </div>

              <div class="form-group">
                <label>SOBRENOME *</label>
                <input 
                  type="text" 
                  v-model="sobrenome" 
                  placeholder="Ex. Silva"
                  class="input-field"
                  required
                >
              </div>

              <div class="form-group">
                <label>CPF *</label>
                <input 
                  type="text" 
                  v-model="cpf" 
                  placeholder="000.000.000-00"
                  @input="formatCPF"
                  class="input-field"
                  required
                >
              </div>

              <div class="form-group">
                <label>FUNÇÃO *</label>
                <select v-model="funcao" class="input-field select-field" required>
                  <option value="">Selecione a função</option>
                  <option value="Gerente">Gerente</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Operador">Operador</option>
                  <option value="Almoxarife">Almoxarife</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div class="form-group">
                <label>TELEFONE</label>
                <input 
                  type="tel" 
                  v-model="telefone" 
                  placeholder="(00) 00000-0000"
                  @input="formatTelefone"
                  class="input-field"
                >
              </div>

              <div class="form-group">
                <label>EMAIL *</label>
                <input 
                  type="email" 
                  v-model="email" 
                  placeholder="nome@empresa.com.br"
                  class="input-field"
                  required
                >
              </div>
            </div>
          </div>

          <div v-if="!isEditando" class="form-section">
            <div class="section-header">
              <span class="section-icon">🔐</span>
              <h3>Dados de acesso</h3>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>SENHA *</label>
                <div class="input-with-icon">
                  <input 
                    :type="showPassword ? 'text' : 'password'" 
                    v-model="password"
                    placeholder="••••••••"
                    class="input-field"
                    required
                  >
                  <span class="eye-icon" @click="showPassword = !showPassword">👁️</span>
                </div>
              </div>

              <div class="form-group">
                <label>CONFIRMAR SENHA *</label>
                <div class="input-with-icon">
                  <input 
                    :type="showConfirmPassword ? 'text' : 'password'" 
                    v-model="confirmPassword"
                    placeholder="••••••••"
                    class="input-field"
                    required
                  >
                  <span class="eye-icon" @click="showConfirmPassword = !showConfirmPassword">👁️</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn-submit">{{ isEditando ? 'Atualizar' : 'Cadastrar' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSupabase } from '../composables/useSupabase'
import HeaderGeral from '../components/HeaderGeral.vue'

const { signUp, supabase } = useSupabase()

// State
const showModal = ref(false)
const isEditando = ref(false)
const loadingFuncionarios = ref(true)
const funcionarios = ref([])
const searchQuery = ref('')
const activeMenu = ref(null)
const stats = ref({ total: 0 })

// Form data
const nome = ref('')
const sobrenome = ref('')
const cpf = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const funcao = ref('')
const telefone = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const editandoId = ref(null)

// Filtered list
const filteredFuncionarios = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return funcionarios.value.filter(func => 
    (func.nome || '').toLowerCase().includes(query) ||
    (func.sobrenome || '').toLowerCase().includes(query) ||
    (func.email || '').toLowerCase().includes(query) ||
    (func.cpf || '').includes(query)
  )
})

const loadFuncionarios = async () => {
  try {
    const { data, error } = await supabase
      .from('funcionario')
      .select('*')
      .order('nome', { ascending: true })

    if (error) throw error
    funcionarios.value = data || []
    stats.value.total = funcionarios.value.length
  } catch (error) {
    console.error('Erro ao carregar funcionários:', error)
    alert('Erro ao carregar funcionários')
  } finally {
    loadingFuncionarios.value = false
  }
}

const openModal = () => {
  isEditando.value = false
  resetForm()
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const openMenu = (event, func) => {
  event.stopPropagation()
  activeMenu.value = activeMenu.value === func.idfuncionario ? null : func.idfuncionario
}

const resetForm = () => {
  nome.value = ''
  sobrenome.value = ''
  cpf.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  funcao.value = ''
  telefone.value = ''
  showPassword.value = false
  showConfirmPassword.value = false
  isEditando.value = false
  editandoId.value = null
  activeMenu.value = null
}

const formatCPF = () => {
  let value = cpf.value.replace(/\D/g, '')
  if (value.length > 11) value = value.slice(0, 11)
  if (value.length > 8) {
    value = value.slice(0, 3) + '.' + value.slice(3, 6) + '.' + value.slice(6, 9) + '-' + value.slice(9)
  } else if (value.length > 6) {
    value = value.slice(0, 3) + '.' + value.slice(3, 6) + '.' + value.slice(6)
  } else if (value.length > 3) {
    value = value.slice(0, 3) + '.' + value.slice(3)
  }
  cpf.value = value
}

const formatTelefone = () => {
  let value = telefone.value.replace(/\D/g, '')
  if (value.length > 11) value = value.slice(0, 11)
  if (value.length > 7) {
    value = '(' + value.slice(0, 2) + ') ' + value.slice(2, 7) + '-' + value.slice(7)
  } else if (value.length > 2) {
    value = '(' + value.slice(0, 2) + ') ' + value.slice(2)
  }
  telefone.value = value
}

const validarForm = () => {
  if (!nome.value.trim()) {
    alert('Nome é obrigatório')
    return false
  }
  if (!cpf.value.trim() || cpf.value.length < 14) {
    alert('CPF inválido (XXX.XXX.XXX-XX)')
    return false
  }
  if (!email.value.trim() || !email.value.includes('@')) {
    alert('E-mail inválido')
    return false
  }
  if (!isEditando.value) {
    if (password.value.length < 6) {
      alert('Senha deve ter no mínimo 6 caracteres')
      return false
    }
    if (password.value !== confirmPassword.value) {
      alert('As senhas não coincidem')
      return false
    }
  }
  return true
}

const handleCadastro = async () => {
  if (!validarForm()) return

  try {
    if (isEditando.value) {
      const { error } = await supabase
        .from('funcionario')
        .update({
          nome: nome.value.trim(),
          sobrenome: sobrenome.value.trim(),
          cpf: cpf.value.trim(),
          email: email.value.trim(),
          funcao: funcao.value || 'Padrão',
          telefone: telefone.value.trim()
        })
        .eq('idfuncionario', editandoId.value)

      if (error) throw error
      alert('Funcionário atualizado com sucesso!')
    } else {
      const userData = {
        tipo: 'funcionario',
        nome: nome.value.trim(),
        sobrenome: sobrenome.value.trim(),
        cpf: cpf.value.trim(),
        funcao: funcao.value || 'Padrão'
      }

      const { error: signUpError } = await supabase.auth.signUp({
      email: email.value.trim(),
      password: password.value,
      options: {
      data: userData
  }
})

if (signUpError) throw signUpError
      alert('Funcionário cadastrado com sucesso!')
    }

    closeModal()
    await loadFuncionarios()
  } catch (error) {
    console.error('Erro:', error)
    alert('Erro: ' + error.message)
  }
}

const editarFuncionario = (func) => {
  isEditando.value = true
  editandoId.value = func.idfuncionario
  nome.value = func.nome
  sobrenome.value = func.sobrenome
  cpf.value = func.cpf
  email.value = func.email
  funcao.value = func.funcao
  telefone.value = func.telefone || ''
  showModal.value = true
  activeMenu.value = null
}

const deletarFuncionario = async (id) => {
  activeMenu.value = null
  if (!confirm('Deseja deletar este funcionário?')) return

  try {
    const { error } = await supabase
      .from('funcionario')
      .delete()
      .eq('idfuncionario', id)

    if (error) throw error
    alert('Funcionário deletado com sucesso!')
    await loadFuncionarios()
  } catch (error) {
    console.error('Erro ao deletar:', error)
    alert('Erro: ' + error.message)
  }
}

onMounted(() => {
  loadFuncionarios()
})
</script>

<style scoped>
.funcionarios-container {
  min-height: 100vh;
  background: #293140;
  color: #edf2f7;
}

.funcionarios-main {
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.funcionarios-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.funcionarios-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  margin: 0 0 4px 0;
}

.sub {
  color: #a0aec0;
  margin: 0;
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

/* Tabela */
.table-section {
  background: #1a202c;
  border-radius: 12px;
  padding: 1px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  overflow: visible;
}

.funcionarios-table {
  width: 100%;
  border-collapse: collapse;
}

.funcionarios-table thead {
  background: #2d3748;
}

.funcionarios-table th {
  padding: 16px;
  text-align: left;
  font-size: 0.85rem;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.funcionarios-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #2d3748;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Avatar Placeholder/Img */
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

/* Status Badge */
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.status-badge.ativo {
  background-color: rgba(74, 222, 128, 0.15);
  color: #4ade80;
  border: 1px solid rgba(74, 222, 128, 0.3);
}

.status-badge.inativo {
  background-color: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.no-data {
  text-align: center;
  padding: 32px;
  color: #a0aec0;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #b0b5be;
  font-size: 1.1rem;
}

/* Menu de Ações (Três Pontos) */
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

/* Modal */
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
  max-width: 700px;
  border-radius: 12px;
  padding: 24px;
  color: #edf2f7;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.5);
  border: 1px solid #2d3748;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #2d3748;
  padding-bottom: 16px;
  margin-bottom: 20px;
}

.modal-header h2 {
  color: #ffffff;
  margin: 0;
  font-size: 1.5rem;
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

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-header {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.5rem;
}

.section-icon {
  font-size: 1.5rem;
}

.section-header h3 {
  color: #e0e7ff;
  margin: 0;
  font-size: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #a0aec0;
  font-weight: bold;
  font-size: 0.85rem;
}

.input-field {
  background-color: #2d3748;
  border: 1px solid #4a5568;
  border-radius: 6px;
  padding: 0.75rem;
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: #f05432;
}

.select-field {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.5rem;
  cursor: pointer;
}

.input-with-icon {
  position: relative;
}

.eye-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  user-select: none;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 16px;
  border-top: 1px solid #2d3748;
}

.btn-submit {
  background-color: #f05432;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s ease;
}

.btn-submit:hover {
  background-color: #d94a2b;
}

.btn-cancel {
  background-color: transparent;
  color: #a0aec0;
  border: 1px solid #4a5568;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background-color: #2d3748;
  color: #fff;
}

@media (max-width: 768px) {
  .funcionarios-header, .filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: 100%;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>