<template>
  <div class="dashboard-container">
    <HeaderGeral />
    <main class="home-container">
        <div class="card-container">
            <div class="Button-icon">
                <button class="icon"></button>
                <button class="icon"></button>
                <div class="button2">
                <button class="icon"></button>
                <button class="icon"></button>
                </div>
            </div>
            <div class="content-left">
            <h1 class="title">Bem vindo ao Dashboard!!</h1>
            </div>
        </div>
        <div class="content-right">
                <CardDashboard 
                  v-for="(item, index) in dashboardItems" 
                  :key="index"
                  :title="item.title"
                  :description="item.description"
                  :imageSrc="item.imageSrc"
                />
            </div>
    </main>
  </div>
</template>

<script setup>
import HeaderGeral from '../components/HeaderGeral.vue'
import CardDashboard from '../components/CardDashboard.vue'
import { ref, onMounted } from 'vue'
import { useSupabase } from '../composables/useSupabase'

const { getEPIs, session } = useSupabase()

const epis = ref([])

onMounted(async () => {
  if (session.value) {
    epis.value = await getEPIs()
  }
})

const dashboardItems = [
  {
    title: 'Total EPIs',
    description: `Há ${epis.value.length} EPIs cadastrados.`,
    imageSrc: '../assets/painel-de-controle.png'
  },
  {
    title: 'Card 2',
    description: 'Descrição do card 2.',
    imageSrc: '../assets/painel-de-controle.png'
  },
  {
    title: 'Card 3',
    description: 'Descrição do card 3.',
    imageSrc: '../assets/painel-de-controle.png'
  },
  {
    title: 'Card 4',
    description: 'Descrição do card 4.',
    imageSrc: '../assets/painel-de-controle.png'
  },
  {
    title: 'Card 5',
    description: 'Descrição do card 5.',
    imageSrc: '../assets/painel-de-controle.png'
  }
]
</script>

<style scoped>
.home-container {
    display: flex;
    flex-direction: column;
}
.card-container {
    display: flex;
    flex-direction: row;
    gap: 3rem;
    margin-top: 3rem;
}

.Button-icon {
    margin-left: 5rem;
    color: rgb(80, 13, 13);
}

.icon {
    gap:3px;
    width: 1rem;
    height: 1rem;
    margin-left: 0.3rem;
}

.title {
    font-size: 2rem;
    color: white;
}

.content-right {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 3rem;
}

</style>
