<template>
  <div class="dashboard-container">
    <HeaderGeral />
    <main class="dashboard-main">
      <div class="dashboard-header">
        <div>
          <h1 class="dashboard-title">Controle Total de EPIs</h1>
          <p class="dashboard-subtitle">Visão geral do estoque, entregas e validações</p>
        </div>
        <button class="btn-exportar" @click="exportarPDF">📊 Exportar</button>
      </div>

      <div class="stats-container">
        <div class="stat-card total">
          <div class="stat-icon">📦</div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.total }}</div>
            <div class="stat-label">TOTAL DE EPIs</div>
            <div class="stat-change">✓ 10 em até esta semana</div>
          </div>
        </div>

        <div class="stat-card available">
          <div class="stat-icon">✓</div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.disponivel }}</div>
            <div class="stat-label">DISPONÍVEL</div>
            <div class="stat-change">{{ stats.percentualDisponibilidade }}% do total</div>
          </div>
        </div>

        <div class="stat-card inuse">
          <div class="stat-icon">⚙️</div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.emUso }}</div>
            <div class="stat-label">TIPO DE USO</div>
            <div class="stat-change">{{ stats.emUso }} entregas ativas</div>
          </div>
        </div>

        <div class="stat-card alert">
          <div class="stat-icon">⚠️</div>
          <div class="stat-content">
            <div class="stat-number">{{ alertas.length }}</div>
            <div class="stat-label">VENCIDOS EM 30 DIAS</div>
            <div class="stat-change">⚠️ Ação necessária</div>
          </div>
        </div>
      </div>

      <div class="section-entregas">
        <h2 class="section-title">Entregas Recentes</h2>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>NOME</th>
                <th>EPI</th>
                <th>DATA</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entrega in entregasRecentes" :key="entrega.id_entrega_aluno">
                <td>{{ entrega.aluno.nome }} {{ entrega.aluno.sobrenome }}</td>
                <td>{{ entrega.epis.nome }}</td>
                <td>{{ formatDate(entrega.data_entrega) }}</td>
                <td><span class="status-badge">ATIVO</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid-3cols">
        <div class="card-section">
          <h2 class="section-title">Estoque por Tipo</h2>
          <div class="estoque-list">
            <div v-for="item in estoque" :key="item.tipo" class="estoque-item">
              <div class="estoque-label">{{ item.tipo || 'Sem tipo' }}</div>
              <div class="estoque-bar">
                <div class="estoque-fill" :style="{ width: getEstoquePercent(item.quantidade) + '%' }"></div>
              </div>
              <div class="estoque-valor">{{ item.quantidade }}</div>
            </div>
          </div>
        </div>

        <div class="card-section">
          <h2 class="section-title">Disponibilidade</h2>
          <div class="disponibilidade-circle">
            <svg class="circle-chart" width="200" height="200">
              <circle cx="100" cy="100" r="90" class="circle-bg"></circle>
              <circle cx="100" cy="100" r="90" class="circle-fill" :style="{ 'stroke-dasharray': `${stats.percentualDisponibilidade * 5.65} 565` }"></circle>
            </svg>
            <div class="circle-text">
              <div class="circle-percent">{{ stats.percentualDisponibilidade }}%</div>
              <div class="circle-label">Disponíveis</div>
            </div>
          </div>
          <p class="disponibilidade-obs">Estoque suficiente. Recomenda-se reavaliar em breve.</p>
        </div>

        <div class="card-section">
          <h2 class="section-title">Atividade</h2>
          <div class="atividade-list">
            <div class="atividade-item">
              <span class="atividade-indicator active"></span>
              <div>Entrega realizada</div>
              <span class="atividade-time">Há 2 horas</span>
            </div>
            <div class="atividade-item">
              <span class="atividade-indicator warning"></span>
              <div>Devolução pendente</div>
              <span class="atividade-time">4 dias</span>
            </div>
            <div class="atividade-item">
              <span class="atividade-indicator pending"></span>
              <div>Inventário atualizado</div>
              <span class="atividade-time">Há 8 horas</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section-funcionarios">
        <h2 class="section-title">Devoluções Pendentes</h2>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>NOME</th>
                <th>EMAIL</th>
                <th>EPI</th>
                <th>PATRIMÔNIO</th>
                <th>DATA ENTREGA</th>
                <th>TIPO</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="func in funcionariosEPIs" :key="`func-${func.id_entrega_func}`">
                <td>{{ func.funcionario.nome }} {{ func.funcionario.sobrenome }}</td>
                <td>{{ func.funcionario.email }}</td>
                <td>{{ func.epis.nome }}</td>
                <td>{{ func.epis.codigo_patrimonio || '---' }}</td>
                <td>{{ formatDate(func.data_entrega) }}</td>
                <td><span class="badge-tipo">👨‍💼 Funcionário</span></td>
                <td><span class="status-urgente">⚠️ URGENTE</span></td>
              </tr>
              <tr v-for="aluno in alunosEPIs" :key="`aluno-${aluno.id_entrega_aluno}`">
                <td>{{ aluno.aluno.nome }} {{ aluno.aluno.sobrenome }}</td>
                <td>{{ aluno.aluno.email }}</td>
                <td>{{ aluno.epis.nome }}</td>
                <td>{{ aluno.epis.codigo_patrimonio || '---' }}</td>
                <td>{{ formatDate(aluno.data_entrega) }}</td>
                <td><span class="badge-tipo">👨‍🎓 Aluno</span></td>
                <td><span class="status-urgente">⚠️ URGENTE</span></td>
              </tr>
              <tr v-if="funcionariosEPIs.length === 0 && alunosEPIs.length === 0">
                <td colspan="7" class="no-data">Nenhum EPI pendente de devolução</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import HeaderGeral from '../components/HeaderGeral.vue'
import { ref, onMounted } from 'vue'
// importa as funções que puxam dados do supabase
import { useSupabase } from '../composables/useSupabase'
import { jsPDF } from 'jspdf'

// pega as funções para buscar dados do banco de dados
const { 
  getDashboardStats, 
  getEntregasRecentes, 
  getEstoquePerTipo, 
  alertasEPIs,
  getFuncionarioComEPIs,
  getAlunoComEPIsAtrasados,
  session 
} = useSupabase()

// armazena as estatísticas do dashboard (total, disponível, em uso, %)
const stats = ref({ total: 0, disponivel: 0, emUso: 0, percentualDisponibilidade: 0 })
// armazena as entregas recentes
const entregasRecentes = ref([])
// armazena o estoque por tipo de epi
const estoque = ref([])
// armazena os alertas de epis
const alertas = ref([])
// armazena os funcionários com epis
const funcionariosEPIs = ref([])
// armazena os alunos com epis atrasados
const alunosEPIs = ref([])

// converte string de data em formato legível
const formatDate = (date) => {
  if (!date) return '---'
  return new Date(date).toLocaleDateString('pt-BR')
}

// calcula o percentual de estoque de um epi em relação ao máximo
const getEstoquePercent = (quantidade) => {
  // se não houver estoque, retorna 0
  if (!estoque.value.length) return 0
  // acha a quantidade máxima entre os tipos
  const max = Math.max(...estoque.value.map(e => e.quantidade || 0))
  if (max === 0) return 0
  // calcula o percentual
  return (quantidade / max) * 100
}

// gera um relatório em pdf com os dados do dashboard
const exportarPDF = () => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPosition = 20

  // define as cores usadas no pdf
  const colorPrimary = [240, 84, 50]
  const colorText = [41, 49, 64]
  const colorGray = [176, 181, 190]

  // desenha o cabeçalho com cor de fundo
  doc.setFillColor(...colorPrimary)
  doc.rect(0, 0, pageWidth, 30, 'F')

  // adiciona o título do relatório
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont(undefined, 'bold')
  doc.text('Controle Total de EPIs', 14, 20)

  // adiciona a data e hora de geração
  doc.setTextColor(...colorGray)
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 28)

  yPosition = 45

  doc.setTextColor(...colorText)
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text('Estatísticas Principais', 14, yPosition)
  yPosition += 10

  const statBox = [
    { label: 'Total de EPIs', value: stats.value.total },
    { label: 'Disponível', value: stats.value.disponivel },
    { label: 'Em Uso', value: stats.value.emUso },
    { label: 'Disponibilidade', value: `${stats.value.percentualDisponibilidade}%` }
  ]

  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  statBox.forEach((stat, index) => {
    const xPos = 14 + (index % 2) * 90
    const yPos = yPosition + Math.floor(index / 2) * 15

    doc.setDrawColor(...colorPrimary)
    doc.rect(xPos, yPos - 7, 80, 12)
    
    doc.setTextColor(...colorText)
    doc.setFont(undefined, 'bold')
    doc.text(String(stat.value), xPos + 5, yPos + 2)
    
    doc.setFont(undefined, 'normal')
    doc.setTextColor(...colorGray)
    doc.setFontSize(8)
    doc.text(stat.label, xPos + 5, yPos + 6)
  })

  yPosition += 35

  if (estoque.value.length > 0) {
    doc.setTextColor(...colorText)
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Estoque por Tipo', 14, yPosition)
    yPosition += 8

    doc.setFontSize(9)
    doc.setFont(undefined, 'normal')
    
    estoque.value.forEach((item) => {
      doc.setTextColor(...colorText)
      doc.text(`${item.tipo || 'Sem tipo'}: ${item.quantidade} unidades`, 14, yPosition)
      yPosition += 6

      if (yPosition > pageHeight - 40) {
        doc.addPage()
        yPosition = 20
      }
    })

    yPosition += 5
  }

  if (entregasRecentes.value.length > 0 && yPosition < pageHeight - 80) {
    doc.setTextColor(...colorText)
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Entregas Recentes', 14, yPosition)
    yPosition += 8

    doc.setFontSize(8)
    doc.setFont(undefined, 'normal')

    entregasRecentes.value.slice(0, 5).forEach((entrega) => {
      const nome = `${entrega.aluno.nome} ${entrega.aluno.sobrenome}`
      const epi = entrega.epis.nome
      const data = formatDate(entrega.data_entrega)

      doc.setTextColor(...colorText)
      doc.text(`• ${nome} - ${epi} (${data})`, 14, yPosition)
      yPosition += 5

      if (yPosition > pageHeight - 30) {
        doc.addPage()
        yPosition = 20
      }
    })

    yPosition += 5
  }
  if (funcionariosEPIs.value.length > 0) {
    if (yPosition > pageHeight - 80) {
      doc.addPage()
      yPosition = 20
    }

    doc.setTextColor(...colorText)
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Devoluções Pendentes', 14, yPosition)
    yPosition += 8

    doc.setFontSize(8)
    doc.setFont(undefined, 'normal')

    funcionariosEPIs.value.slice(0, 10).forEach((func) => {
      const funcionario = `${func.funcionario.nome} ${func.funcionario.sobrenome}`
      const epi = func.epis.nome
      const data = formatDate(func.data_entrega)

      doc.setTextColor(...colorText)
      doc.text(`• [FUNC] ${funcionario} - ${epi} (${data})`, 14, yPosition)
      yPosition += 5

      if (yPosition > pageHeight - 30) {
        doc.addPage()
        yPosition = 20
      }
    })

    alunosEPIs.value.slice(0, 10).forEach((aluno) => {
      const alunoNome = `${aluno.aluno.nome} ${aluno.aluno.sobrenome}`
      const epi = aluno.epis.nome
      const data = formatDate(aluno.data_entrega)

      doc.setTextColor(...colorText)
      doc.text(`• [ALUNO] ${alunoNome} - ${epi} (${data})`, 14, yPosition)
      yPosition += 5

      if (yPosition > pageHeight - 30) {
        doc.addPage()
        yPosition = 20
      }
    })
  }

  const totalPages = doc.internal.pages.length - 1
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setTextColor(...colorGray)
    doc.setFontSize(8)
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
  }

  // Download
  doc.save(`DashEPI_${new Date().toISOString().split('T')[0]}.pdf`)
}

onMounted(async () => {
  try {
    stats.value = await getDashboardStats()
    entregasRecentes.value = await getEntregasRecentes(5)
    estoque.value = await getEstoquePerTipo()
    alertas.value = await alertasEPIs()
    funcionariosEPIs.value = await getFuncionarioComEPIs()
    alunosEPIs.value = await getAlunoComEPIsAtrasados()
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error)
  }
})
</script>

<style scoped>
.dashboard-container {
  width: 100%;
  min-height: 100vh;
  background-color: #293140;
}

.dashboard-main {
  padding: 2rem 3rem;
  max-width: 1600px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.dashboard-title {
  font-size: 2rem;
  color: #ffffff;
  margin: 0;
  font-weight: 700;
}

.dashboard-subtitle {
  color: #b0b5be;
  margin: 0.5rem 0 0 0;
  font-size: 0.95rem;
}

.btn-exportar {
  background-color: #f05432;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-exportar:hover {
  background-color: #e54320;
  transform: translateY(-2px);
}

/* Stats Container */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background-color: #1a202c;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  border-left: 4px solid #f05432;
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

.stat-icon {
  font-size: 2rem;
  min-width: 50px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
}

.stat-label {
  font-size: 0.85rem;
  color: #b0b5be;
  margin-top: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-change {
  font-size: 0.8rem;
  color: #81a85c;
  margin-top: 0.5rem;
}

.section-entregas {
  background-color: #1a202c;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.1rem;
  color: #ffffff;
  margin: 0 0 1rem 0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background-color: #293140;
}

.data-table th {
  padding: 1rem;
  text-align: left;
  color: #b0b5be;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #556274;
}

.data-table td {
  padding: 1rem;
  color: #e0e7ff;
  border-bottom: 1px solid #556274;
  font-size: 0.95rem;
}

.data-table tbody tr:hover {
  background-color: #45505f;
}

.status-badge {
  display: inline-block;
  background-color: #4ade80;
  color: #1a1a1a;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-urgente {
  display: inline-block;
  background-color: #ef4444;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-tipo {
  display: inline-block;
  background-color: #556274;
  color: #e0e7ff;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.no-data {
  text-align: center;
  color: #b0b5be;
  padding: 2rem !important;
}

.grid-3cols {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card-section {
  background-color: #1a202c;
  border-radius: 12px;
  padding: 1.5rem;
}

.estoque-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.estoque-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.estoque-label {
  color: #e0e7ff;
  min-width: 100px;
  font-size: 0.9rem;
  font-weight: 500;
}

.estoque-bar {
  flex: 1;
  height: 12px;
  background-color: #556274;
  border-radius: 6px;
  overflow: hidden;
}

.estoque-fill {
  height: 100%;
  background: linear-gradient(90deg, #f05432, #fbbf24);
  transition: width 0.3s ease;
}

.estoque-valor {
  color: #b0b5be;
  min-width: 40px;
  text-align: right;
  font-weight: 600;
}

/* Disponibilidade */
.disponibilidade-circle {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 1rem;
}

.circle-chart {
  transform: rotateZ(-90deg);
}

.circle-bg {
  fill: none;
  stroke: #556274;
  stroke-width: 8;
}

.circle-fill {
  fill: none;
  stroke: #4ade80;
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dasharray 0.5s ease;
}

.circle-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.circle-percent {
  font-size: 1.8rem;
  font-weight: 700;
  color: #4ade80;
}

.circle-label {
  font-size: 0.85rem;
  color: #b0b5be;
  margin-top: 0.25rem;
}

.disponibilidade-obs {
  color: #b0b5be;
  font-size: 0.85rem;
  text-align: center;
  margin: 0;
}

/* Atividade */
.atividade-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.atividade-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #293140;
  border-radius: 8px;
}

.atividade-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.atividade-indicator.active {
  background-color: #4ade80;
}

.atividade-indicator.warning {
  background-color: #ef4444;
}

.atividade-indicator.pending {
  background-color: #fbbf24;
}

.atividade-time {
  margin-left: auto;
  color: #b0b5be;
  font-size: 0.85rem;
}

/* Seção Funcionários */
.section-funcionarios {
  background-color: #1a202c;
  border-radius: 12px;
  padding: 1.5rem;
}

@media (max-width: 1024px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .grid-3cols {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-main {
    padding: 1rem;
  }

  .stats-container {
    grid-template-columns: 1fr;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
