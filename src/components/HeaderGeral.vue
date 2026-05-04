<template>
  <header class="header">
    <div class="logo-container">
      <div class="logo-icon">
        <router-link to="/" class="text-link">
          <img 
          :src="imageIcon" 
          alt="Ilustração Icone da equipe" 
          class="icon-placeholder"
        />
        </router-link>
      </div>
      <router-link to="/" class="text-link">
      <h2 class="logo-text">DashEPI</h2>
      </router-link>
    </div>

    <nav>
      <router-link to="/dashboard" class="nav-dashboard">
        <h1>Dashboard</h1>
      </router-link>
      <router-link to="/epis" class="nav-dashboard">
        <h1>EPIs</h1>
      </router-link>
      <router-link to="/gerenciar-solicitacoes" class="nav-dashboard">
        <h1>Solicitações</h1>
      </router-link>
      <router-link to="/cadastrar" class="nav-dashboard">
        <h1>Cadastrar</h1>
      </router-link>
      <router-link to="/alunos" class="nav-dashboard">
        <h1>Alunos</h1>
      </router-link>
    </nav>

    <div class="user-container">
      <router-link :to="perfilLink" class="user-icon">
        <span class="icon-placeholder">👤</span>
      </router-link>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useSupabase } from '../composables/useSupabase'
import imageIcon from '../assets/logo empresa.png'

const { getTipoUsuario } = useSupabase()

const perfilLink = computed(() => {
  const tipo = getTipoUsuario()
  return tipo === 'funcionario' ? '/perfil-adm' : '/perfil'
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #383e49;
  padding: 15px 50px;
  color: #ffffff;
  box-sizing: border-box;
  width: 100%;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-icon {
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
  display: flex;
  justify-content: center;
  align-items: center; 
  margin-left: 0.5rem; 
  margin-right: 1.7rem;
}

.text-link {
  text-decoration: none;
  text-decoration-line: none;
}

.logo-icon img {
  width: 250%;
  height: 250%;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  color:white;
}

.user-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-icon {
  background-color: #5c626d;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  cursor: pointer;
}

.tooltip {
  position: absolute;
  top: 55px;
  background-color: #f05432;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.9rem;
  white-space: nowrap;
}

.tooltip::after {
  content: "";
  position: absolute;
  bottom: 100%; 
  left: 50%;
  margin-left: -6px;
  border-width: 6px;
  border-style: solid;
  border-color: transparent transparent #f05432 transparent;
}

nav {
  display: flex;
  flex-direction: row;
  gap: 3rem;
  margin-right: 9rem;
}

.nav-dashboard {
  display: flex;
  align-items: center;
  text-decoration: none;
}

nav h1 {
  font-size: 1.5rem;
  color: #ffffff;
  text-decoration: none;
  margin: 0;
}
</style>