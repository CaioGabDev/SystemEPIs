<template>
  <div class="app-wrapper">
    <Header />
    <main class="home-container">
      <aside>
      <div class="content-left">
        <h1 class="title">Controle Total</h1>
        <p class="subtitle">
          Gerencie EPIs da sua empresa de forma inteligente e eficiente!!
        </p>
        
        <div class="button-group">
          <router-link to="/login"><button class="btn btn-login">Login</button></router-link>
          <router-link to="/cadastro"><button class="btn btn-cadastro">Cadastro</button></router-link>
        </div>
      </div>

      <div class="content-right">
        <img 
          :src="imageSrc" 
          alt="Ilustração de gestão de EPIs" 
          class="illustration"
        />
      </div>
    </aside>
      <div class="card-container">
      <Card 
        v-for="card in cards" 
        :key="card.id"
        :image="card.image"
        :title="card.title"
        :description="card.description"
      />
      </div>
      <div class ="titleEPIs">
        <h1 class="title">EPIs</h1>
        <h1 class="title-laranja">Monitorados</h1>
      </div>
        <div class="card-containerEPI">
          <CardEPI 
            v-for="epi in cardsEPI.linha1" 
            :key="epi.id"
            :image="epi.image"
            :title="epi.title"
          />
        </div>
        <div class="card-containerEPI">
          <CardEPI 
            v-for="epi in cardsEPI.linha2" 
            :key="epi.id"
            :image="epi.image"
            :title="epi.title"
          />
        </div>
        <div class="card-containerEPI">
          <CardEPI 
            v-for="epi in cardsEPI.linha3" 
            :key="epi.id"
            :image="epi.image"
            :title="epi.title"
          />
        </div>
        <section class="contact-section">
          <div class="contact-content">
            <div class="contact-info">
              <h2 class="contact-title">Entre em Contato</h2>
              <p class="contact-description">
                Fale conosco para conhecer melhor nossas soluções de gestão de EPIs
              </p>
            </div>
            <form class="contact-form" @submit.prevent="handleSubmit">
              <div class="form-row">
                <div class="form-group">
                  <input 
                    v-model="formData.name"
                    type="text" 
                    placeholder="Nome completo" 
                    class="form-input"
                    required
                  />
                </div>
                <div class="form-group">
                  <input 
                    v-model="formData.email"
                    type="email" 
                    placeholder="E-mail" 
                    class="form-input"
                    required
                  />
                </div>
                <div class="form-group">
                  <input 
                    v-model="formData.phone"
                    type="tel" 
                    placeholder="Telefone" 
                    class="form-input"
                    required
                  />
                </div>
              </div>
              <div class="form-group-full">
                <textarea 
                  v-model="formData.message"
                  placeholder="Mensagem" 
                  class="form-textarea"
                  rows="5"
                  required
                ></textarea>
              </div>
              <div class="form-checkbox">
                <input 
                  v-model="formData.terms"
                  type="checkbox" 
                  id="terms"
                  required
                />
                <label for="terms">
                  Concordo com a política de privacidade e termos de utilização
                </label>
              </div>
              <button type="submit" class="btn-submit">Enviar</button>
            </form>
          </div>
        </section>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import imageSrc from '../assets/a-Photoroom.png'
import Card from '../components/Card.vue'
import CardEPI from '../components/Card-EPI.vue'
import imagecontrole from '../assets/painel-de-controle.png'
import imagedash from '../assets/painel.png'
import imagedoc from '../assets/documentacao.png'
import capacete from '../assets/safety.png'
import colete from '../assets/high-visibility-vest.png'
import protetorauditivo from '../assets/headphone.png'
import glasses from '../assets/glasses.png'
import boot from '../assets/boot.png'
import gloves from '../assets/gloves.png'
import overall from '../assets/overall.png'
import mask from '../assets/mask.png'
import touca from '../assets/cap.png'

const cards = ref([
  {
    id: 1,
    image: imagedash,
    title: 'Monitoramento em tempo real',
    description: 'Monitore entradas, saídas e saldos de EPIs em tempo real.'
  },
  {
    id: 2,
    image: imagecontrole,
    title: 'Dashboard',
    description: 'Gerencie EPIs da sua empresa de forma inteligente e eficiente!!'
  },
  {
    id: 3,
    image: imagedoc,
    title: 'Documentação',
    description: 'Documente a entrega dos EPIs aos colaboradores com assinatura e data.'
  }
])
const cardsEPI = ref({
  linha1: [
    { id: 1, image: capacete, title: 'Capacete' },
    { id: 2, image: colete, title: 'Colete' },
    { id: 3, image: protetorauditivo, title: 'Protetor Auditivo' }
  ],
  linha2: [
    { id: 4, image: glasses, title: 'Óculos' },
    { id: 5, image: boot, title: 'Botas' },
    { id: 6, image: gloves, title: 'Luvas' }
  ],  
  linha3: [
    { id: 7, image: overall, title: 'Macacão' },
    { id: 8, image: mask, title: 'Máscara' },
    { id: 9, image: touca, title: 'Touca' }
  ]
})

// armazena os dados do formulário de contato
const formData = ref({
  name: '',
  email: '',
  phone: '',
  message: '',
  terms: false
})

// função que trata o envio do formulário de contato
const handleSubmit = () => {
  // registra os dados no console (para debug)
  console.log('Formulário enviado:', formData.value)
  // mostra mensagem de sucesso ao usuário
  alert('Mensagem enviada com sucesso! Entraremos em contato em breve.')
  // limpa o formulário
  formData.value = {
    name: '',
    email: '',
    phone: '',
    message: '',
    terms: false
  }
}
</script>

<style scoped>
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

aside {
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
  background-color: #FF3A18; 
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
  background-color: #f05432;
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
  margin-top: 15rem;
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
  margin-top: 16rem;
}

.titleEPIs .title-laranja {
  font-size: 3rem;
  color:#FF3A18
}

.titleEPIs .title {
  font-size: 3rem;
}

.contact-section {
  width: 100vw;
  margin-top: 10rem;
}

.contact-content {
  max-width: 900px;
  margin: 0 auto;
  display: grid;
  gap: 60px;
  align-items: start;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.contact-title {
  font-size: 2.5rem;
  color: #ffffff;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.contact-description {
  font-size: 1.1rem;
  color: #b0b5be;
  line-height: 1.8;
  font-weight: 400;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

.form-group,
.form-group-full {
  display: flex;
  flex-direction: column;
}

.form-input,
.form-textarea {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 16px;
  color: #ffffff;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.3s ease;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #b0b5be;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  background-color: rgba(255, 255, 255, 0.15);
  border-color: #FF3A18;
  box-shadow: 0 0 0 3px rgba(240, 84, 50, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.form-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #FF3A18;
  cursor: pointer;
}

.form-checkbox label {
  color: #b0b5be;
  font-size: 0.9rem;
  cursor: pointer;
  user-select: none;
  line-height: 1.5;
}

.btn-submit {
  background-color: #FF3A18;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 14px 40px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.3px;
  margin-top: 12px;
}

.btn-submit:hover {
  background-color: #cf2802;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(240, 84, 50, 0.3);
}

.btn-submit:active {
  transform: translateY(0);
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

  .contact-content {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .contact-title {
    font-size: 2rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .contact-section {
    padding: 60px 5%;
    margin-left: 0;
    width: 100%;
  }

  .contact-title {
    font-size: 1.5rem;
  }

  .contact-description {
    font-size: 1rem;
  }
}
</style>
