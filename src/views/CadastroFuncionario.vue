<template>
  <div class="cadastro-container">
    <HeaderGeral />
    
    <div class="page-header">
      <div>
        <h1>Cadastrar Funcionário</h1>
        <p>Insira as informações básicas e credenciais de acesso para registrar um novo colaborador no sistema de segurança core.</p>
      </div>
      <div class="header-buttons">
        <router-link to="/dashboard" class="btn-limpar">Limpar</router-link>
        <button @click="handleCadastro" class="btn-cadastrar">Cadastrar funcionário →</button>
      </div>
    </div>

    <div class="cadastro-content">
      <div class="painel-preview">
        <div class="preview-avatar">
          <span class="avatar-icon">👤</span>
          <span class="badge-novo">+</span>
        </div>

        <div class="preview-header">
          <h2>Novo Perfil</h2>
          <p>AGUARDANDO DADOS...</p>
        </div>

        <div class="preview-info">
          <div class="info-item">
            <label>Funcionário ativo</label>
            <div class="toggle-switch">
              <input type="checkbox" v-model="ativo" id="toggle-ativo">
              <label for="toggle-ativo" class="toggle-label"></label>
            </div>
          </div>

          <div class="info-item">
            <label class="label-title">STATUS DE CADASTRO</label>
            <span class="status-badge" :class="{ completo: statusCadastro === 'Completo' }">
              ● {{ statusCadastro }}
            </span>
          </div>

          <div class="info-item">
            <label class="label-title">NÍVEL DE ACESSO</label>
            <span class="nivel-acesso">Padrão do Sistema</span>
          </div>
        </div>
      </div>

      <div class="painel-formulario">
        <div class="form-section">
          <div class="section-header">
            <span class="section-icon">👤</span>
            <h3>Dados pessoais</h3>
          </div>
          
          <div class="form-grid">
            <div class="form-group">
              <label>NOME</label>
              <input 
                type="text" 
                v-model="nome" 
                placeholder="Ex. João"
                class="input-field"
              >
            </div>

            <div class="form-group">
              <label>SOBRENOME</label>
              <input 
                type="text" 
                v-model="sobrenome" 
                placeholder="Ex. Silva"
                class="input-field"
              >
            </div>

            <div class="form-group">
              <label>CPF</label>
              <input 
                type="text" 
                v-model="cpf" 
                placeholder="000.000.000-00"
                @input="formatCPF"
                class="input-field"
              >
            </div>

            <div class="form-group">
              <label>DATA DE NASCIMENTO</label>
              <input 
                type="date" 
                v-model="dataNascimento"
                class="input-field"
              >
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
              <label>FUNÇÃO</label>
              <select v-model="funcao" class="input-field select-field">
                <option value="">Selecione a função</option>
                <option value="Gerente">Gerente</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Operador">Operador</option>
                <option value="Almoxarife">Almoxarife</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <span class="section-icon">🔐</span>
            <h3>Dados de acesso</h3>
          </div>

          <div class="form-grid">
            <div class="form-group full-width">
              <label>E-MAIL</label>
              <input 
                type="email" 
                v-model="email" 
                placeholder="nome.sobrenome@empresa.com.br"
                class="input-field"
              >
            </div>

            <div class="form-group">
              <label>SENHA</label>
              <div class="input-with-icon">
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  v-model="password"
                  placeholder="••••••••"
                  class="input-field"
                >
                <span class="eye-icon" @click="showPassword = !showPassword">👁️</span>
              </div>
            </div>

            <div class="form-group">
              <label>CONFIRMAR SENHA</label>
              <div class="input-with-icon">
                <input 
                  :type="showConfirmPassword ? 'text' : 'password'" 
                  v-model="confirmPassword"
                  placeholder="••••••••"
                  class="input-field"
                >
                <span class="eye-icon" @click="showConfirmPassword = !showConfirmPassword">👁️</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
// importa a função de signup do supabase
import { useSupabase } from '../composables/useSupabase'
import HeaderGeral from '../components/HeaderGeral.vue'

// pega a função de cadastro do supabase
const { signUp } = useSupabase()

// armazena os dados pessoais do funcionário
const nome = ref('')
const sobrenome = ref('')
const cpf = ref('')
const dataNascimento = ref('')
const telefone = ref('')
const funcao = ref('')

// armazena os dados de acesso
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
// controla se a senha é visível ou não
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// controla se o funcionário está ativo
const ativo = ref(true)
// calcula o status do cadastro dinamicamente
const statusCadastro = computed(() => {
  // se faltarem campos obrigatórios, mostra "em progresso"
  if (!nome.value || !cpf.value || !email.value || !password.value) {
    return 'Em progresso'
  }
  return 'Completo'
})

// formata o cpf automaticamente conforme o usuário digita
const formatCPF = () => {
  // remove qualquer caractere que não seja número
  let value = cpf.value.replace(/\D/g, '')
  // limita a 11 dígitos
  if (value.length > 11) value = value.slice(0, 11)
  // formata com pontos e traço (xxx.xxx.xxx-xx)
  if (value.length > 8) {
    value = value.slice(0, 3) + '.' + value.slice(3, 6) + '.' + value.slice(6, 9) + '-' + value.slice(9)
  } else if (value.length > 6) {
    value = value.slice(0, 3) + '.' + value.slice(3, 6) + '.' + value.slice(6)
  } else if (value.length > 3) {
    value = value.slice(0, 3) + '.' + value.slice(3)
  }
  cpf.value = value
}

// formata o telefone automaticamente conforme o usuário digita
const formatTelefone = () => {
  // remove qualquer caractere que não seja número
  let value = telefone.value.replace(/\D/g, '')
  // limita a 11 dígitos
  if (value.length > 11) value = value.slice(0, 11)
  // formata com parênteses e traço ((xx) xxxxx-xxxx)
  if (value.length > 7) {
    value = '(' + value.slice(0, 2) + ') ' + value.slice(2, 7) + '-' + value.slice(7)
  } else if (value.length > 2) {
    value = '(' + value.slice(0, 2) + ') ' + value.slice(2)
  }
  telefone.value = value
}

// valida todos os campos do formulário
const validarForm = () => {
  // verifica se o nome foi preenchido
  if (!nome.value.trim()) {
    alert('Nome é obrigatório')
    return false
  }
  // verifica se o cpf foi preenchido e tem o formato correto
  if (!cpf.value.trim() || cpf.value.length < 14) {
    alert('CPF inválido (XXX.XXX.XXX-XX)')
    return false
  }
  // verifica se o email foi preenchido e tem @
  if (!email.value.trim() || !email.value.includes('@')) {
    alert('E-mail inválido')
    return false
  }
  // verifica se a senha tem pelo menos 6 caracteres
  if (password.value.length < 6) {
    alert('Senha deve ter no mínimo 6 caracteres')
    return false
  }
  // verifica se as duas senhas são iguais
  if (password.value !== confirmPassword.value) {
    alert('As senhas não coincidem')
    return false
  }
  return true
}

// função que cadastra um novo funcionário
const handleCadastro = async () => {
  // valida todos os campos antes de fazer o cadastro
  if (!validarForm()) return

  try {
    const userData = {
      type: 'funcionario',
      nome: nome.value.trim(),
      sobrenome: sobrenome.value.trim(),
      cpf: cpf.value.trim(),
      funcao: funcao.value || 'Padrão'
    }

    await signUp(email.value.trim(), password.value, userData)
    alert('Funcionário cadastrado com sucesso!')
    
    nome.value = ''
    sobrenome.value = ''
    cpf.value = ''
    dataNascimento.value = ''
    telefone.value = ''
    funcao.value = ''
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
  } catch (error) {
    console.error('Erro no cadastro:', error)
    alert('Erro ao cadastrar: ' + error.message)
  }
}
</script>

<style scoped>
.cadastro-container {
  width: 100%;
  min-height: 100vh;
  background-color: #293140;
  color: #ffffff;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  gap: 2rem;
}

.page-header h1 {
  margin: 0;
  font-size: 2rem;
  color: #ffffff;
}

.page-header p {
  margin: 0.5rem 0 0 0;
  font-size: 0.95rem;
  color: #b0b5be;
  max-width: 500px;
  line-height: 1.6;
}

.header-buttons {
  display: flex;
  gap: 1rem;
}

.btn-limpar {
  padding: 0.75rem 1.5rem;
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.btn-limpar:hover {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.4);
}

.btn-cadastrar {
  padding: 0.75rem 1.5rem;
  background-color: #FF3A18;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-cadastrar:hover {
  background-color: #f05432;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(240, 84, 50, 0.3);
}

.btn-cadastrar:active {
  transform: translateY(0);
}

.cadastro-content {
  display: flex;
  gap: 2rem;
  padding: 0 2rem 2rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.painel-preview {
  flex: 0 0 350px;
  background-color: #2a3139;
  border-radius: 12px;
  padding: 2rem;
  height: fit-content;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-avatar {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.badge-novo {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 30px;
  height: 30px;
  background-color: #FF3A18;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  border: 3px solid #2a3139;
}

.preview-header {
  text-align: center;
  margin-bottom: 2rem;
}

.preview-header h2 {
  margin: 0;
  font-size: 1.3rem;
  color: #ffffff;
}

.preview-header p {
  margin: 0.25rem 0 0 0;
  font-size: 0.75rem;
  color: #b0b5be;
}

.preview-info {
  margin: 2rem 0;
  padding: 2rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-item {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item label {
  font-size: 0.9rem;
  color: #b0b5be;
}

.label-title {
  font-size: 0.65rem;
  font-weight: bold;
  text-transform: uppercase;
  color: #7a7f88;
  display: block;
  margin-bottom: 0.5rem;
}

.status-badge {
  font-size: 0.85rem;
  color: #7a7f88;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.status-badge.completo {
  color: #4caf50;
}

.nivel-acesso {
  font-size: 0.85rem;
  color: #b0b5be;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
}

.toggle-switch input {
  display: none;
}

.toggle-label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #5c626d;
  border-radius: 26px;
  transition: 0.3s;
}

.toggle-switch input:checked + .toggle-label {
  background-color: #FF3A18;
}

.toggle-label::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: 0.3s;
}

.toggle-switch input:checked + .toggle-label::after {
  left: 27px;
}

.painel-formulario {
  flex: 1;
  background-color: #2a3139;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}

.form-section {
  margin-bottom: 2.5rem;
  padding-bottom: 2.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.section-icon {
  font-size: 1.5rem;
}

.section-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #ffffff;
  font-weight: 600;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
  color: #7a7f88;
  margin-bottom: 0.5rem;
  letter-spacing: 0.5px;
}

.input-field {
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 0.75rem;
  color: #ffffff;
  font-size: 0.9rem;
  font-family: inherit;
  transition: all 0.3s ease;
}

.input-field::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.input-field:focus {
  outline: none;
  background-color: rgba(0, 0, 0, 0.5);
  border-color: #FF3A18;
  box-shadow: 0 0 0 3px rgba(240, 84, 50, 0.1);
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
  display: flex;
  align-items: center;
}

.input-with-icon .input-field {
  padding-right: 2.5rem;
  width: 100%;
}

.eye-icon {
  position: absolute;
  right: 0.75rem;
  cursor: pointer;
  font-size: 1.1rem;
  opacity: 0.6;
  transition: opacity 0.2s;
  pointer-events: all;
}

.eye-icon:hover {
  opacity: 1;
}

.painel-formulario::-webkit-scrollbar {
  width: 6px;
}

.painel-formulario::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.painel-formulario::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

.painel-formulario::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

@media (max-width: 1024px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-buttons {
    justify-content: flex-end;
  }

  .cadastro-content {
    flex-direction: column;
  }

  .painel-preview {
    flex: none;
    width: 100%;
  }

  .painel-formulario {
    flex: none;
    width: 100%;
    max-height: none;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-group.full-width {
    grid-column: 1;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .page-header p {
    font-size: 0.85rem;
  }

  .cadastro-content {
    padding: 0 1rem 1rem 1rem;
  }
}
</style>
