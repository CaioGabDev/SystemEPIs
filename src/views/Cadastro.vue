<template>
  <div class="Login">
    <div class="logo-container">
      <router-link to="/" class="text-link">
      <div class="logo-icon">
        <img 
          :src="imageIcon" 
          alt="Ilustração Icone da equipe" 
          class="icon-placeholder"
        />
      </div>
      </router-link>
      <router-link to="/" class="text-link">
      <h2 class="logo-text">DashEPI</h2>
      </router-link>
    </div>
    <div class="container">
      <div class="image-container">
        <img 
          :src="imageLogin" 
          alt="Ilustração Icone da equipe" 
          class="icon-placeholder"
        />
      </div>
      <aside>
        <h1 class="title">Gestão de EPI</h1>
        <h2 class="subtitle">Bem-Vindo(a)! Insira seus dados.</h2>
        <form class="inputs">
          <input placeholder="Nome" class="input-field">
          <input placeholder="E-mail" v-model="email" class="input-field">
          <input placeholder="Senha" type="password" class="input-field">
          <input placeholder="Repita sua senha" type="password" class="input-field">
        </form>
        <div class="buttons">
          <button class="btn btn-cadastro">Cadastrar</button>
          <router-link to="/login"><button class="btn btn-login">Já tenho conta</button></router-link>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import imageIcon from '../assets/logo empresa.png'
import imageLogin from '../assets/PaginaLogin.png'
</script>

<style scoped>
.Login {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.logo-container {
  display: flex;
  align-items: center;
  padding: 3rem 5rem;
  gap: 15px;
}

.logo-icon {
  width: 5rem;
  height: 5rem;
}

.logo-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo-text {
  font-size: 3rem;
  color: white; 
  font-weight: bold;
  margin: 0;
  text-decoration: none;
  text-decoration-line: none;
}

.text-link {
  text-decoration: none;
  text-decoration-line: none;
}

.container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5rem;
}

.image-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 60%;
}

.image-container img {
  width: 100%;
  height: auto;
  max-height: 700px;
  object-fit: contain;
}

aside {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 400px;
}

.title {
  color: #ffffff;
  font-size: 3.5rem;
  font-weight: bold;
  margin: 0;
  letter-spacing: 1px;
}

.subtitle {
  color: #b0b5be;
  font-size: 1.5rem;
  line-height: 1.6;
  margin: 0;
  margin-bottom: 20px;
}

.inputs {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-field {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 16px 16px;
  color: #ffffff;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.3s ease;
}

.input-field::placeholder {
  color: #b0b5be;
}

.input-field:focus {
  outline: none;
  background-color: rgba(255, 255, 255, 0.15);
  border-color: #FF3A18;
  box-shadow: 0 0 0 3px rgba(240, 84, 50, 0.1);
}

.buttons {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 1rem;
}

.btn {
  background-color: #FF3A18;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 12px 35px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:hover {
  background-color: #f05432;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(240, 84, 50, 0.3);
}

.btn:active {
  transform: translateY(0);
}

.btn-login {
  background-color: #FF3A18;
}

.btn-cadastro {
  background-color: #FF3A18;
}

@media (max-width: 1024px) {
  .container {
    flex-direction: column;
    padding: 30px;
    gap: 40px;
  }

  .image-container {
    max-width: 100%;
  }

  aside {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .logo-container {
    padding: 15px 20px;
  }

  .logo-text {
    font-size: 1.5rem;
  }

  .container {
    padding: 20px;
  }

  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 0.9rem;
  }

  .buttons {
    flex-direction: column;
  }

  .btn {
    padding: 10px 25px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 15px;
    gap: 20px;
  }

  .image-container img {
    max-height: 300px;
  }

  .title {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.85rem;
  }
}
</style>