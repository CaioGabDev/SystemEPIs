<template>
  <div class="catalogo-epis">
    <HeaderAluno />
    <main class="catalogo-main">
      <SidebarAluno />
      <section class="content">
        <div class="content-header">
          <h1>Catálogo de EPIs</h1>
          <p>Explore e solicite EPIs disponíveis</p>
        </div>

        <div class="filters">
          <input v-model="searchQuery" type="text" placeholder="Buscar EPIs..." class="search-input">
          <select v-model="tipoFilter" class="filter-select">
            <option value="">Todos os tipos</option>
            <option value="Capacete">Capacete</option>
            <option value="Luvas">Luvas</option>
            <option value="Óculos">Óculos</option>
            <option value="Máscara">Máscara</option>
            <!-- Adicionar mais tipos conforme necessário -->
          </select>
          <select v-model="disponibilidadeFilter" class="filter-select">
            <option value="">Todas as disponibilidades</option>
            <option value="true">Disponível</option>
            <option value="false">Indisponível</option>
          </select>
        </div>

        <div class="epis-grid">
          <div v-for="epi in filteredEpis" :key="epi.idepis" class="epi-card">
            <div class="epi-image">
              <img :src="epi.imagem || '/placeholder-epi.jpg'" :alt="epi.nome">
            </div>
            <div class="epi-info">
              <h3>{{ epi.nome }}</h3>
              <p class="epi-type">{{ epi.tipo }}</p>
              <p class="epi-description">{{ epi.descricao }}</p>
              <div class="epi-status" :class="epi.disponivel ? 'disponivel' : 'indisponivel'">
                {{ epi.disponivel ? 'Disponível' : 'Indisponível' }}
              </div>
            </div>
            <div class="epi-actions">
              <button @click="solicitarEPI(epi)" :disabled="!epi.disponivel" class="btn-solicitar">
                Solicitar Empréstimo
              </button>
            </div>
          </div>
        </div>

        <div v-if="filteredEpis.length === 0" class="empty-state">
          Nenhum EPI encontrado com os filtros aplicados.
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import HeaderAluno from '../components/HeaderAluno.vue'
import SidebarAluno from '../components/SidebarAluno.vue'
import { useSupabase } from '../composables/useSupabase'

const { supabase, session } = useSupabase()

const epis = ref([])
const searchQuery = ref('')
const tipoFilter = ref('')
const disponibilidadeFilter = ref('')

const filteredEpis = computed(() => {
  return epis.value.filter(epi => {
    const matchesSearch = epi.nome.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         epi.descricao.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesTipo = !tipoFilter.value || epi.tipo === tipoFilter.value
    const matchesDisponibilidade = !disponibilidadeFilter.value ||
                                   epi.disponivel.toString() === disponibilidadeFilter.value
    return matchesSearch && matchesTipo && matchesDisponibilidade
  })
})

const loadEpis = async () => {
  try {
    const { data, error } = await supabase
      .from('epis')
      .select('*')
      .eq('ativo', true)

    if (error) throw error
    epis.value = data || []
  } catch (error) {
    console.error('Erro ao carregar EPIs:', error)
    alert('Erro ao carregar EPIs')
  }
}

const solicitarEPI = async (epi) => {
  if (!epi.disponivel) return

  try {
    // Buscar o ID do aluno
    const userEmail = session.value.user.email;
    const { data: alunoData } = await supabase
      .from('aluno')
      .select('idaluno')
      .eq('email', userEmail)
      .single();

    if (!alunoData) {
      alert('Perfil do aluno não encontrado');
      return;
    }

    const { data, error } = await supabase
      .from('solicitacoes')
      .insert({
        aluno_id: alunoData.idaluno,
        epis_id: epi.idepis,
        status: 'pendente',
        data_solicitacao: new Date().toISOString().split('T')[0]
      })

    if (error) throw error

    alert('Solicitação enviada com sucesso!')
    // Recarregar EPIs ou atualizar status
    loadEpis()
  } catch (error) {
    console.error('Erro ao solicitar EPI:', error)
    alert('Erro ao enviar solicitação: ' + error.message)
  }
}

onMounted(() => {
  loadEpis()
})
</script>

<style scoped>
/* Estilos similares ao padrão do site */
.catalogo-epis {
  min-height: 100vh;
  background-color: #293140;
}

.catalogo-main {
  display: flex;
  min-height: calc(100vh - 80px); /* Ajustar conforme header */
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

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-input, .filter-select {
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
}

.epis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.epi-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
}

.epi-image img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 15px;
}

.epi-info h3 {
  color: white;
  margin-bottom: 5px;
}

.epi-type, .epi-description {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.epi-status {
  margin-top: 10px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  text-align: center;
}

.epi-status.disponivel {
  background: #4CAF50;
  color: white;
}

.epi-status.indisponivel {
  background: #f44336;
  color: white;
}

.btn-solicitar {
  margin-top: 15px;
  padding: 10px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-solicitar:hover:not(:disabled) {
  background: #45a049;
}

.btn-solicitar:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
  margin-top: 50px;
}
</style>