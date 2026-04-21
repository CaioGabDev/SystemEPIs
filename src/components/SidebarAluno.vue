<template>
  <aside class="sidebar">
    <nav class="sidebar-nav">
      <router-link to="/dashboard-aluno" class="nav-link" :class="{ active: $route.path === '/dashboard-aluno' }">
        <i class="fas fa-home"></i> Dashboard
      </router-link>
      <router-link to="/catalogo-epis" class="nav-link" :class="{ active: $route.path === '/catalogo-epis' }">
        <i class="fas fa-list"></i> Catálogo de EPIs
      </router-link>
      <router-link to="/minhas-solicitacoes" class="nav-link" :class="{ active: $route.path === '/minhas-solicitacoes' }">
        <i class="fas fa-history"></i> Minhas Solicitações
      </router-link>
      <router-link to="/perfil" class="nav-link" :class="{ active: $route.path === '/perfil' }">
        <i class="fas fa-user"></i> Perfil
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router';
const route = useRoute();
</script>

<style scoped>
.sidebar {
  width: 250px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.3s;
}

.nav-link:hover, .nav-link.active {
  background: rgba(255, 255, 255, 0.2);
}
</style>