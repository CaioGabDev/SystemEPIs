<template>
  <div class="app-wrapper">
    <Header />
    <main class="home-container">
      <div class="asside">
      <div class="content-left">
        <h1 class="title">Controle Total</h1>
        <p class="subtitle">
          Gerencie EPIs da sua empresa de forma inteligente e eficiente!!
        </p>
        
        <div class="button-group">
          <button class="btn btn-login">Login</button>
          <button class="btn btn-cadastro">Cadastro</button>
        </div>
      </div>

      <div class="content-right">
        <img 
          :src="imageSrc" 
          alt="Ilustração de gestão de EPIs" 
          class="illustration"
        />
      </div>
    </div>
      <div class="card-container">
      <Card />
      <Card />
      <Card />
      </div>
      <div class ="titleEPIs">
        <h1 class="title">EPIs</h1>
        <h1 class="title-laranja">Monitorados</h1>
      </div>
        <div class="card-containerEPI">
          <CardEPI />
          <CardEPI />
          <CardEPI />
        </div>
        <div class="card-containerEPI">
          <CardEPI />
          <CardEPI />
          <CardEPI />
        </div>
        <div class="card-containerEPI">
          <CardEPI />
          <CardEPI />
          <CardEPI />
        </div>
    </main>
  </div>
</template>

<script setup>
import Header from '../components/Header.vue'
import imageSrc from '../assets/a-Photoroom.png'
import Card from '../components/Card.vue'
import CardEPI from '../components/Card-EPI.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #293140;
}

.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.home-container {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  align-items: center;
  padding: 10px 10%;
} 

.asside {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.content-left {
  max-width: 500px;
}

.title {
  color: #ffffff;
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  letter-spacing: 1px;
}

.subtitle {
  color: #b0b5be;
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 40px;
}

.button-group {
  display: flex;
  gap: 15px;
}

.btn {
  background-color: #f05432; 
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 12px 35px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn:hover {
  background-color: #d14426;
}

.content-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.illustration {
  max-width: 80%;
  height: auto;
}

.card-container {
  display: flex;
  gap: 6rem;
  margin-top: 20rem;
}

.card-containerEPI {
  display: flex;
  gap: 6rem;
  margin-bottom: 2rem;
}

.titleEPIs {
  display: flex;
  flex-direction: row;
  gap:2rem;
  margin-top: 20rem;
}

.titleEPIs .title-laranja {
  font-size: 3rem;
  color:#d14426
}

.titleEPIs .title {
  font-size: 3rem;
}


@media (max-width: 900px) {
  .home-container {
    flex-direction: column;
    text-align: center;
    padding: 40px 5%;
  }
  
  .button-group {
    justify-content: center;
    margin-bottom: 40px;
  }
  
  .content-right {
    justify-content: center;
  }
}
</style>
