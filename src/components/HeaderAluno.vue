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

    <div class="user-container">
      <router-link to="/perfil" class="user-icon">
        <span class="icon-placeholder">👤</span>
      </router-link>
    </div>
  </header>
</template>

<script setup>
import imageIcon from '../assets/logo empresa.png'
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
  height: 80px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-icon {
  width: 45px;
  height: 45px;
  border-radius: 0;
  overflow: hidden;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.logo-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  color: #ffffff;
}

.text-link {
  text-decoration: none;
  color: inherit;
}

.user-container {
  display: flex;
  align-items: center;
}

.user-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  text-decoration: none;
  color: #ffffff;
  font-size: 1.2rem;
  transition: background-color 0.3s;
}

.user-icon:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style>