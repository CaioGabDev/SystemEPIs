<template>
  <div class="app-wrapper">
    <Header />
    <main class="notfound-container">
      <div class="error-content">
        <div class="error-code">404</div>
        <h1 class="error-title">Página Não Encontrada</h1>
        <p class="error-description">
          Desculpe, a página que você está procurando não existe ou foi removida.
        </p>
        
        <div class="error-animation">
          <div class="animation-box"></div>
        </div>

        <div class="button-group">
          <router-link to="/"><button class="btn btn-home">Voltar à Home</button></router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
</script>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.notfound-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background:#293140;
}

.error-content {
  text-align: center;
  max-width: 600px;
  animation: slideInUp 0.8s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-code {
  font-size: 120px;
  font-weight: 900;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 20px;
  text-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.error-title {
  font-size: 36px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 15px;
}

.error-description {
  font-size: 18px;
  color: #555;
  margin-bottom: 40px;
  line-height: 1.6;
}

.error-animation {
  margin: 40px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
}

.animation-box {
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #ff6b6b, #ee5a6f);
  border-radius: 10px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(10deg);
  }
}

.button-group {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
  margin: 40px 0;
}

.btn {
  padding: 12px 30px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-home {
  background-color: #4CAF50;
  color: white;
}

.btn-home:hover {
  background-color: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-login {
  background-color: #008CBA;
  color: white;
}

.btn-login:hover {
  background-color: #007399;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-cadastro {
  background-color: #FF9800;
  color: white;
}

.btn-cadastro:hover {
  background-color: #e68900;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.suggestions {
  margin-top: 60px;
  padding-top: 40px;
  border-top: 2px solid rgba(0, 0, 0, 0.1);
}

.suggestions h3 {
  color: #2c3e50;
  font-size: 18px;
  margin-bottom: 20px;
}

.suggestions ul {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.suggestions li {
  margin: 0;
}

.suggestions a {
  color: #008CBA;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-block;
  padding: 8px 16px;
  border-radius: 6px;
}

.suggestions a:hover {
  color: white;
  background-color: #008CBA;
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .error-code {
    font-size: 80px;
  }

  .error-title {
    font-size: 28px;
  }

  .error-description {
    font-size: 16px;
  }

  .button-group {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
