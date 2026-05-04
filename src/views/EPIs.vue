<template>
  <div class="epis-container">
    <HeaderGeral />
    <main class="epis-main">
      <div class="epis-header">
        <h1 class="epis-title">Gestão de EPIs</h1>
      </div>

      <div class="stats-container">
        <div class="stat-card total">
          <div class="stat-label">TOTAL CADASTRADO</div>
          <div class="stat-number">{{ stats.total }}</div>
          <div class="stat-icon">📦</div>
        </div>

        <div class="stat-card available">
          <div class="stat-label">EM ESTOQUE</div>
          <div class="stat-number">{{ stats.emEstoque }}</div>
          <div class="stat-icon">✓</div>
        </div>

        <div class="stat-card inuse">
          <div class="stat-label">EM USO</div>
          <div class="stat-number">{{ stats.emUso }}</div>
          <div class="stat-icon">⚙️</div>
        </div>

        <div class="stat-card alert">
          <div class="stat-label">VENCIDOS/ALERTA</div>
          <div class="stat-number">{{ stats.vencidos }}</div>
          <div class="stat-icon">⚠️</div>
        </div>
      </div>
      <div class="filter-section">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="🔍 Filtre por nome ou patrimônio..."
            class="search-input"
          />
        </div>
        <div class="filter-buttons">
          <button class="btn-filter" @click="openCadastroModal">
            ➕ Cadastrar
          </button>
          <button class="btn-filter" @click="showFiltroModal = true">
            🔽 Filtrar
          </button>
          <button v-if="filtroTipo || filtroDisponibilidade" class="btn-filter btn-limpar" @click="limparFiltros">
            ✕ Limpar Filtros
          </button>
          <button class="btn-filter" @click="exportarTablePDF">
            📥 Exportar
          </button>
        </div>
      </div>

      <div class="table-section">
        <table class="epis-table">
          <thead>
            <tr>
              <th>NOME</th>
              <th>CPF/CÓDIGO</th>
              <th>TIPO</th>
              <th>VALOR ESTOQUE</th>
              <th>STATUS</th>
              <th>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="epi in filteredEPIs" :key="epi.idepis">
              <td class="epi-name">
                <div class="epi-info">
                  <div class="epi-icon">📦</div>
                  <div>
                    <div class="epi-title">{{ epi.nome }}</div>
                    <div class="epi-subtitle">{{ epi.tipo || 'Sem tipo' }}</div>
                  </div>
                </div>
              </td>
              <td>{{ epi.codigo_patrimonio || '---' }}</td>
              <td>{{ epi.tipo || '---' }}</td>
              <td class="valor-estoque">{{ epi.quantidade || 0 }} un</td>
              <td>
                <span :class="['status-badge', getStatusClass(epi)]">
                  {{ getStatusText(epi) }}
                </span>
              </td>
              <td class="actions">
                <button class="btn-action" @click="openMenu($event, epi)" title="Ações">
                  ⋮
                </button>
                <div v-if="activeMenu === epi.idepis" class="action-menu">
                  <button @click="editarEPI(epi)" class="menu-item">Editar</button>
                  <button @click="visualizarDetalhes(epi)" class="menu-item">Detalhes</button>
                  <button @click="deletarEPI(epi.idepis)" class="menu-item delete">Deletar</button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredEPIs.length === 0">
              <td colspan="7" class="no-data">Nenhum EPI encontrado</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <div v-if="showCadastroModal" class="modal-overlay" @click="showCadastroModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Cadastrar Novo EPI</h2>
          <button class="btn-close" @click="showCadastroModal = false">&times;</button>
        </div>
        <form class="modal-form" @submit.prevent="salvarEPI">
          <div class="form-group">
            <label>Nome do EPI *</label>
            <input v-model="novoEPI.nome" type="text" required placeholder="Ex: Capacete de Segurança">
          </div>
          <div class="form-group">
            <label>Tipo *</label>
            <input v-model="novoEPI.tipo" type="text" required placeholder="Ex: Proteção Cabeça">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Quantidade *</label>
              <input v-model.number="novoEPI.quantidade" type="number" required min="0" placeholder="0">
            </div>
            <div class="form-group">
              <label>Código Patrimônio</label>
              <input v-model="novoEPI.codigo_patrimonio" type="text" placeholder="Ex: PAT-001">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Data de Validade</label>
              <input v-model="novoEPI.data_validade" type="date">
            </div>
            <div class="form-group">
              <label>Disponível</label>
              <select v-model="novoEPI.disponivel">
                <option :value="true">Sim</option>
                <option :value="false">Não</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="submit" class="btn-submit">Salvar EPI</button>
            <button type="button" class="btn-cancel" @click="showCadastroModal = false">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showFiltroModal" class="modal-overlay" @click="showFiltroModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Filtrar EPIs</h2>
          <button class="btn-close" @click="showFiltroModal = false">&times;</button>
        </div>
        <div class="modal-form">
          <div class="form-group">
            <label>Tipo de EPI</label>
            <select v-model="filtroTipo" class="form-select">
              <option value="">-- Todos os tipos --</option>
              <option v-for="tipo in tiposUnicos" :key="tipo" :value="tipo">
                {{ tipo }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Disponibilidade</label>
            <select v-model="filtroDisponibilidade" class="form-select">
              <option value="">-- Todos --</option>
              <option value="sim">Disponível</option>
              <option value="nao">Indisponível</option>
            </select>
          </div>
          <div class="modal-footer">
            <button @click="showFiltroModal = false" class="btn-submit">Aplicar Filtros</button>
            <button @click="limparFiltrosEFechar" class="btn-cancel">Limpar Tudo</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import HeaderGeral from '../components/HeaderGeral.vue'
import { ref, computed, onMounted } from 'vue'
// importa as funções que interagem com o banco de dados
import { useSupabase } from '../composables/useSupabase'
import { jsPDF } from 'jspdf'

// pega as funções para trabalhar com epis
const { getEPIs, addEPI, deleteEPI, supabase } = useSupabase()

// armazena todos os epis
const epis = ref([])
// armazena o texto da busca
const searchQuery = ref('')
// controla se a modal de cadastro aparece
const showCadastroModal = ref(false)
// controla se a modal de filtro aparece
const showFiltroModal = ref(false)
// armazena qual menu de ações está aberto
const activeMenu = ref(null)
// armazena qual tipo está selecionado no filtro
const filtroTipo = ref('')
// armazena qual disponibilidade está selecionada no filtro
const filtroDisponibilidade = ref('')

// armazena as estatísticas dos epis
const stats = ref({
  total: 0,
  emEstoque: 0,
  emUso: 0,
  vencidos: 0
})

// armazena os dados do novo epi que será cadastrado
const novoEPI = ref({
  nome: '',
  tipo: '',
  quantidade: 0,
  codigo_patrimonio: '',
  data_validade: null,
  disponivel: true
})

// extrai todos os tipos únicos de epis e ordena alfabeticamente
const tiposUnicos = computed(() => {
  const tipos = [...new Set(epis.value.map(epi => epi.tipo).filter(Boolean))]
  return tipos.sort()
})

// filtra os epis de acordo com busca, tipo e disponibilidade
const filteredEPIs = computed(() => {
  let resultado = epis.value

  // filtra pela busca de texto
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    resultado = resultado.filter(epi => 
      epi.nome.toLowerCase().includes(query) ||
      (epi.codigo_patrimonio && epi.codigo_patrimonio.toLowerCase().includes(query)) ||
      (epi.tipo && epi.tipo.toLowerCase().includes(query))
    )
  }

  // filtra pelo tipo selecionado
  if (filtroTipo.value) {
    resultado = resultado.filter(epi => epi.tipo === filtroTipo.value)
  }

  // filtra pela disponibilidade
  if (filtroDisponibilidade.value !== '') {
    const disponivel = filtroDisponibilidade.value === 'sim'
    resultado = resultado.filter(epi => epi.disponivel === disponivel)
  }

  return resultado
})

// calcula as estatísticas dos epis (total, estoque, em uso, vencidos)
const calcularStats = async () => {
  // conta o total de epis
  const total = epis.value.length
  // conta quantos epis tem quantidade maior que 0
  const emEstoque = epis.value.filter(e => e.quantidade && e.quantidade > 0).length
  
  // busca EPIs realmente em uso nas tabelas de entregas
  const { data: alunosComEpis } = await supabase
    .from('aluno_has_epis')
    .select('epis_id')
  
  const { data: funcionariosComEpis } = await supabase
    .from('funcionario_has_epis')
    .select('epis_id')
    .is('data_devolucao', null) // apenas os não devolvidos
  
  // cria set de ids únicos em uso
  const idsEmUso = new Set()
  if (alunosComEpis) {
    alunosComEpis.forEach(item => idsEmUso.add(item.epis_id))
  }
  if (funcionariosComEpis) {
    funcionariosComEpis.forEach(item => idsEmUso.add(item.epis_id))
  }
  const emUso = idsEmUso.size
  
  // pega a data de hoje
  const hoje = new Date().toISOString().split('T')[0]
  // conta quantos epis já venceram
  const vencidos = epis.value.filter(e => 
    e.data_validade && e.data_validade < hoje
  ).length

  // atualiza as estatísticas
  stats.value = {
    total,
    emEstoque,
    emUso,
    vencidos
  }
}

// retorna a classe css de acordo com o status do epi
const getStatusClass = (epi) => {
  // verifica se está indisponível
  if (!epi.disponivel) return 'indisponivel'
  // verifica se tem estoque zerado
  if (epi.quantidade === 0) return 'sem-estoque'
  // verifica se já venceu
  if (epi.data_validade && epi.data_validade < new Date().toISOString().split('T')[0]) return 'vencido'
  return 'disponivel'
}

// converte o status do epi em um texto legivel
const getStatusText = (epi) => {
  if (!epi.disponivel) return 'Indisponível'
  if (epi.quantidade === 0) return 'Sem estoque'
  if (epi.data_validade && epi.data_validade < new Date().toISOString().split('T')[0]) return 'Vencido'
  return 'Disponível'
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0)
}

// abre a modal para cadastrar novo epi
const openCadastroModal = () => {
  // reseta os dados do formulario
  novoEPI.value = {
    nome: '',
    tipo: '',
    quantidade: 0,
    codigo_patrimonio: '',
    data_validade: null,
    disponivel: true
  }
  // mostra a modal
  showCadastroModal.value = true
}

const salvarEPI = async () => {
  try {
    if (!novoEPI.value.nome.trim()) {
      alert('Nome do EPI é obrigatório')
      return
    }

    const quantidade = novoEPI.value.quantidade || 1
    
    // Cria múltiplos EPIs, um para cada unidade
    const episCriar = []
    for (let i = 0; i < quantidade; i++) {
      episCriar.push({
        nome: novoEPI.value.nome,
        tipo: novoEPI.value.tipo,
        quantidade: 1, // Sempre 1 por registro
        codigo_patrimonio: novoEPI.value.codigo_patrimonio 
          ? `${novoEPI.value.codigo_patrimonio}-${i + 1}`
          : null,
        data_validade: novoEPI.value.data_validade,
        disponivel: novoEPI.value.disponivel
      })
    }

    // Insere todos os EPIs
    const { error } = await supabase
      .from('epis')
      .insert(episCriar)

    if (error) {
      console.error('Erro ao salvar EPI:', error)
      
      // Mensagem mais específica para erro RLS
      if (error.message.includes('row-level security')) {
        alert('Erro de permissão ao salvar EPI. Verifique se sua conta tem permissão para adicionar EPIs. Contate um administrador.')
      } else {
        alert('Erro ao salvar EPI: ' + error.message)
      }
      return
    }

    alert(`${quantidade} EPI(s) cadastrado(s) com sucesso!`)
    showCadastroModal.value = false
    await carregarEPIs()
  } catch (error) {
    console.error('Erro ao salvar EPI:', error)
    alert('Erro ao salvar EPI: ' + error.message)
  }
}

const carregarEPIs = async () => {
  try {
    epis.value = await getEPIs()
    calcularStats()
  } catch (error) {
    console.error('Erro ao carregar EPIs:', error)
  }
}

const openMenu = (event, epi) => {
  event.stopPropagation()
  activeMenu.value = activeMenu.value === epi.idepis ? null : epi.idepis
}

const editarEPI = (epi) => {
  novoEPI.value = { ...epi }
  showCadastroModal.value = true
  activeMenu.value = null
}

const visualizarDetalhes = (epi) => {
  alert(`EPI: ${epi.nome}\nTipo: ${epi.tipo}\nEstoque: ${epi.quantidade}\nCódigo: ${epi.codigo_patrimonio}`)
  activeMenu.value = null
}

const limparFiltros = () => {
  filtroTipo.value = ''
  filtroDisponibilidade.value = ''
}

const limparFiltrosEFechar = () => {
  limparFiltros()
  showFiltroModal.value = false
}

const deletarEPI = async (id) => {
  if (confirm('Deseja deletar este EPI? Esta ação não pode ser desfeita.')) {
    try {
      const { data, error } = await supabase
        .from('epis')
        .delete()
        .eq('idepis', id)

      if (error) {
        console.error('Erro ao deletar EPI:', error)
        
        // Mensagem mais específica para erro RLS
        if (error.message.includes('row-level security')) {
          alert('Erro de permissão ao deletar EPI. Verifique se sua conta tem permissão.')
        } else {
          alert('Erro ao deletar EPI: ' + error.message)
        }
        return
      }

      alert('EPI deletado com sucesso!')
      await carregarEPIs()
    } catch (error) {
      console.error('Erro ao deletar EPI:', error)
      alert('Erro ao deletar EPI: ' + error.message)
    }
  }
  activeMenu.value = null
}

const exportarTablePDF = () => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPosition = 20

  const colorPrimary = [240, 84, 50]

  // Cabeçalho
  doc.setFillColor(...colorPrimary)
  doc.rect(0, 0, pageWidth, 30, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont(undefined, 'bold')
  doc.text('Relatório de EPIs', 14, 20)

  yPosition = 45

  // Estatísticas
  doc.setTextColor(41, 49, 64)
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('Resumo', 14, yPosition)
  yPosition += 8

  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`Total de EPIs: ${stats.value.total}`, 14, yPosition)
  yPosition += 5
  doc.text(`Em Estoque: ${stats.value.emEstoque}`, 14, yPosition)
  yPosition += 5
  doc.text(`Em Uso: ${stats.value.emUso}`, 14, yPosition)
  yPosition += 5
  doc.text(`Vencidos/Alerta: ${stats.value.vencidos}`, 14, yPosition)
  yPosition += 12

  // Tabela
  doc.setFontSize(10)
  doc.setFont(undefined, 'bold')
  doc.text('EPIs Cadastrados', 14, yPosition)
  yPosition += 8

  doc.setFontSize(9)
  doc.setFont(undefined, 'normal')

  epis.value.slice(0, 20).forEach((epi) => {
    doc.text(`• ${epi.nome}`, 14, yPosition)
    yPosition += 4
    doc.setFontSize(8)
    doc.text(`   Tipo: ${epi.tipo || '---'} | Estoque: ${epi.quantidade} | Status: ${getStatusText(epi)}`, 14, yPosition)
    yPosition += 5
    doc.setFontSize(9)

    if (yPosition > pageHeight - 30) {
      doc.addPage()
      yPosition = 20
    }
  })

  doc.save(`EPIs_${new Date().toISOString().split('T')[0]}.pdf`)
}

onMounted(() => {
  carregarEPIs()
})
</script>

<style scoped>
.epis-container {
  width: 100%;
  min-height: 100vh;
  background-color: #293140;
}

.epis-main {
  padding: 2rem 3rem;
  max-width: 1600px;
  margin: 0 auto;
}

.epis-header {
  margin-bottom: 2rem;
}

.epis-title {
  font-size: 2rem;
  color: #ffffff;
  margin: 0;
  font-weight: 700;
}

/* Stats Container */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background-color: #3d4555;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-left: 4px solid #f05432;
  position: relative;
  overflow: hidden;
}

.stat-card.available {
  border-left-color: #4ade80;
}

.stat-card.inuse {
  border-left-color: #fbbf24;
}

.stat-card.alert {
  border-left-color: #ef4444;
}

.stat-label {
  font-size: 0.75rem;
  color: #b0b5be;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0.5rem 0;
}

.stat-icon {
  font-size: 2rem;
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.3;
}

/* Filter Section */
.filter-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 300px;
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
}

.search-input::placeholder {
  color: #b0b5be;
}

.search-input:focus {
  outline: none;
  border-color: #f05432;
  background-color: #45505f;
}

.filter-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-filter {
  background-color: #3d4555;
  color: #e0e7ff;
  border: 1px solid #556274;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-filter:hover {
  background-color: #45505f;
  border-color: #f05432;
  color: #f05432;
}

.btn-limpar {
  background-color: #ef4444;
  border-color: #dc2626;
  color: white;
}

.btn-limpar:hover {
  background-color: #dc2626;
  border-color: #b91c1c;
}

/* Table Section */
.table-section {
  background-color: #3d4555;
  border-radius: 12px;
  overflow: visible;
  margin-bottom: 2rem;
  position: relative;
}

.epis-table {
  width: 100%;
  border-collapse: collapse;
}

.epis-table thead {
  background-color: #293140;
}

.epis-table tbody {
  overflow: visible;
}

.epis-table th {
  padding: 1rem;
  text-align: left;
  color: #b0b5be;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #556274;
}

.epis-table td {
  padding: 1rem;
  color: #e0e7ff;
  border-bottom: 1px solid #556274;
  font-size: 0.95rem;
  overflow: visible;
}

.epis-table tbody tr {
  overflow: visible;
}

.epis-table tbody tr:hover {
  background-color: #45505f;
}

.epi-name {
  min-width: 250px;
}

.epi-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.epi-icon {
  font-size: 1.5rem;
  min-width: 30px;
}

.epi-title {
  color: #ffffff;
  font-weight: 600;
}

.epi-subtitle {
  color: #b0b5be;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.valor-estoque {
  text-align: center;
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.disponivel {
  background-color: #4ade80;
  color: #1a1a1a;
}

.status-badge.sem-estoque {
  background-color: #fbbf24;
  color: #1a1a1a;
}

.status-badge.vencido {
  background-color: #ef4444;
  color: white;
}

.status-badge.indisponivel {
  background-color: #6b7280;
  color: white;
}

/* Actions */
.actions {
  position: relative;
  text-align: center;
  z-index: 50;
}

.btn-action {
  background: none;
  border: none;
  color: #b0b5be;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  transition: color 0.3s ease;
}

.btn-action:hover {
  color: #f05432;
}

.action-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: #45505f;
  border: 1px solid #556274;
  border-radius: 6px;
  z-index: 100;
  min-width: 150px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
  margin-top: 0.5rem;
  pointer-events: auto;
}

.menu-item {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: #e0e7ff;
  cursor: pointer;
  text-align: left;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background-color: #556274;
  color: #f05432;
}

.menu-item.delete:hover {
  background-color: #ef4444;
  color: white;
}

.no-data {
  text-align: center;
  color: #b0b5be;
  padding: 2rem !important;
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
}

.btn-close:hover {
  color: #f05432;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.form-group input,
.form-group select {
  background-color: #293140;
  border: 1px solid #556274;
  border-radius: 6px;
  padding: 0.75rem;
  color: #e0e7ff;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #f05432;
  background-color: #3d4555;
}

.form-select {
  width: 100%;
  background-color: #293140;
  border: 1px solid #556274;
  border-radius: 6px;
  padding: 0.75rem;
  color: #e0e7ff;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.form-select:focus {
  outline: none;
  border-color: #f05432;
  background-color: #3d4555;
}

.form-select option {
  background-color: #3d4555;
  color: #e0e7ff;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn-submit {
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

@media (max-width: 1024px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-section {
    flex-direction: column;
  }

  .search-box {
    width: 100%;
  }

  .filter-buttons {
    width: 100%;
    justify-content: space-between;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .epis-main {
    padding: 1rem;
  }

  .stats-container {
    grid-template-columns: 1fr;
  }

  .epis-table {
    font-size: 0.85rem;
  }

  .epis-table th,
  .epis-table td {
    padding: 0.75rem 0.5rem;
  }

  .modal-content {
    width: 95%;
    padding: 1.5rem;
  }
}
</style>
