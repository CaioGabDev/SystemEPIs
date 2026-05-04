<template>
  <div class="cadastro-container">
    <HeaderGeral />
    
    <div class="page-header">
      <div>
        <h1>Funcionários</h1>
        <p>Gerencie todos os colaboradores do sistema</p>
      </div>
      <div class="header-buttons">
        <button @click="openModal" class="btn-cadastrar">➕ Cadastrar Funcionário</button>
      </div>
    </div>

    <div class="funcionarios-content">
      <div class="search-section">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="🔍 Buscar por nome, email ou CPF..."
          class="search-input"
        />
      </div>

      <div v-if="loadingFuncionarios" class="loading">
        ⏳ Carregando funcionários...
      </div>

      <div v-else-if="filteredFuncionarios.length === 0" class="empty-state">
        <p>Nenhum funcionário encontrado</p>
      </div>

      <div v-else class="funcionarios-grid">
        <div v-for="func in filteredFuncionarios" :key="func.idfuncionario" class="funcionario-card">
          <div class="card-header">
            <div class="func-name">
              <h3>{{ func.nome }} {{ func.sobrenome }}</h3>
              <p class="func-role">{{ func.funcao || 'Sem função' }}</p>
            </div>
            <span :class="['status-badge', func.status?.toLowerCase() === 'ativo' ? 'ativo' : 'inativo']">
              {{ func.status || 'Desconhecido' }}
            </span>
          </div>

          <div class="card-body">
            <div class="info-row">
              <label>CPF:</label>
              <span>{{ func.cpf || '---' }}</span>
            </div>
            <div class="info-row">
              <label>Email:</label>
              <span>{{ func.email || '---' }}</span>
            </div>
            <div class="info-row">
              <label>Telefone:</label>
              <span>{{ func.telefone || '---' }}</span>
            </div>
          </div>

          <div class="card-footer">
            <button @click="editarFuncionario(func)" class="btn-edit">Editar</button>
            <button @click="deletarFuncionario(func.idfuncionario)" class="btn-delete">Deletar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Cadastro/Edição -->
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
            <button type="submit" class="btn-submit">{{ isEditando ? 'Atualizar' : 'Cadastrar' }} Funcionário</button>
            <button type="button" class="btn-cancel" @click="closeModal">Cancelar</button>
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
    func.nome.toLowerCase().includes(query) ||
    func.sobrenome.toLowerCase().includes(query) ||
    func.email.toLowerCase().includes(query) ||
    func.cpf.includes(query)
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

      await signUp(email.value.trim(), password.value, userData)
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
}

const deletarFuncionario = async (id) => {
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
.cadastro-container {
  width: 100%;
  min-height: 100vh;
  background-color: #293140;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 3rem;
  border-bottom: 1px solid #556274;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-header h1 {
  font-size: 2rem;
  color: #ffffff;
  margin: 0;
  font-weight: 700;
}

.page-header p {
  color: #b0b5be;
  margin: 0.5rem 0 0 0;
}

.header-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn-cadastrar {
  background-color: #f05432;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-cadastrar:hover {
  background-color: #e54320;
  box-shadow: 0 4px 12px rgba(240, 84, 50, 0.4);
}

.funcionarios-content {
  padding: 2rem 3rem;
  max-width: 1600px;
  margin: 0 auto;
}

.search-section {
  margin-bottom: 2rem;
}

.search-input {
  width: 100%;
  background-color: #3d4555;
  border: 1px solid #556274;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: #e0e7ff;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.search-input::placeholder {
  color: #b0b5be;
}

.search-input:focus {
  outline: none;
  border-color: #f05432;
  background-color: #45505f;
}

.loading, .empty-state {
  text-align: center;
  padding: 3rem;
  color: #b0b5be;
  font-size: 1.1rem;
}

.funcionarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.funcionario-card {
  background-color: #3d4555;
  border-radius: 12px;
  border: 1px solid #556274;
  overflow: hidden;
  transition: all 0.3s ease;
}

.funcionario-card:hover {
  border-color: #f05432;
  box-shadow: 0 8px 16px rgba(240, 84, 50, 0.2);
}

.card-header {
  background-color: #2d3748;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #556274;
}

.func-name h3 {
  color: #ffffff;
  margin: 0;
  font-size: 1.1rem;
}

.func-role {
  color: #b0b5be;
  font-size: 0.85rem;
  margin: 0.25rem 0 0 0;
}

.status-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.ativo {
  background-color: #4ade80;
  color: #1a1a1a;
}

.status-badge.inativo {
  background-color: #ef4444;
  color: white;
}

.card-body {
  padding: 1.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  color: #e0e7ff;
  font-size: 0.9rem;
}

.info-row label {
  font-weight: 600;
  color: #b0b5be;
}

.card-footer {
  padding: 1rem 1.5rem;
  background-color: #2d3748;
  border-top: 1px solid #556274;
  display: flex;
  gap: 0.75rem;
}

.btn-edit, .btn-delete {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-edit {
  background-color: #556274;
  color: #e0e7ff;
}

.btn-edit:hover {
  background-color: #6b7280;
}

.btn-delete {
  background-color: #ef4444;
  color: white;
}

.btn-delete:hover {
  background-color: #dc2626;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #3d4555;
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  color: #ffffff;
  margin: 0;
  font-size: 1.5rem;
}

.btn-close {
  background: none;
  border: none;
  color: #b0b5be;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.btn-close:hover {
  color: #f05432;
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
  color: #e0e7ff;
  font-weight: 500;
  font-size: 0.9rem;
}

.input-field {
  background-color: #293140;
  border: 1px solid #556274;
  border-radius: 6px;
  padding: 0.75rem;
  color: #e0e7ff;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: #f05432;
  background-color: #3d4555;
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
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-submit {
  flex: 1;
  background-color: #f05432;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-submit:hover {
  background-color: #e54320;
}

.btn-cancel {
  flex: 1;
  background-color: #556274;
  color: #e0e7ff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background-color: #6b7280;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.5rem;
  }

  .funcionarios-content {
    padding: 1.5rem;
  }

  .funcionarios-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    padding: 1.5rem;
  }
}
</style>