<template>
  <div class="Login">
   <div class="logo-container">
      <div class="logo-icon">
        <img 
          :src="imageIcon" 
          alt="Ilustração Icone da equipe" 
          class="icon-placeholder"
        />
      </div>
      <h2 class="logo-text">DashEPI</h2>
    </div>
  </div>
</template>

<script setup>
import imageIcon from '../assets/logo empresa.png'
</script>

<style scoped>

.logo-container {
  display: flex;
  align-items: center;
  gap:10rem;
  padding: 10rem 7rem;
}

.logo-icon {
  width: 2rem;
  height: 2rem;
  display: flex;
  justify-content: center;
  align-items: center; 
}

.logo-container h2 {
    font-size: 4rem;
    color: white;
}
</style>