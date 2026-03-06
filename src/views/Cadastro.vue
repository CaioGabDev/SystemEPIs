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
    <div class="container">
    <div class ="image-container">
     <img 
          :src="imageLogin" 
          alt="Ilustração Icone da equipe" 
          class="icon-placeholder"
        />
    </div>
    <asside>
      <h1>Gestão de EPI </h1>
      <h2>Bem-Vindo(a)! Insira seus dados.</h2>
      <div class="inputs">
        <input v-model="message" placeholder="Nome">
        <input v-model="message" placeholder="E-mail">
        <input v-model="message" placeholder="Senha">
        <input v-model="message" placeholder="Repita sua senha">
      </div>
      <div class="buttons">
        <router-link to="/login"><button>Cadastrar</button></router-link>
        <router-link to="/login"><button>Já tenho uma conta!</button></router-link>
      </div>
    </asside>
    </div>
  </div>
</template>

<script setup>
import imageIcon from '../assets/logo empresa.png'
import imageLogin from '../assets/PaginaLogin.png'
</script>

<style scoped>

.container {
  display: flex;
  flex-direction: row;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo-icon img{
  width: 15rem;
  height: 15rem;
  display: flex;
  justify-content: center;
  align-items: center; 
}

.logo-container h2 {
    font-size: 4rem;
    color: white;
}

.image-container {
  width: 50%; 
  height: 50%;
}

.image-container img {
  width: 74vh;
  height: 74vh;
}

.inputs {
  display: flex;
  flex-direction: column;
}

.buttons {
  display: flex;
  flex-direction: row;
  gap: 3rem;
}

.buttons button {
  width: 7rem;
  height: 3rem;
  border-radius: 10%;
}
</style>