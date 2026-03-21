<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="logo-container">
        <h2 class="logo-text">DashEPI</h2>

      <div class="footer-section middle-section">
        <div class="phone">
          <span class="phone-icon">☎</span>
          <span class="phone-number">19 1111 - 1111</span>
        </div>
      </div>

      <div class="footer-section social-section">
        <div class="social-icons">
          <a href="#" class="social-icon">f</a>
          <a href="#" class="social-icon">in</a>
        </div>
      </div>
    </div>
    </div>

    <div class="footer-info">
      <p class="info-text">SITE DESENVOLVIDO PARA CLIENTES EDUCACIONAIS, FOCADO NA APRENDIZAGEM</p>
    </div>

    <div class="footer-links">
      <a href="#" class="footer-link">Termos de uso</a>
      <span class="link-separator">|</span>
      <a href="#" class="footer-link">By CaioGabDev</a>
    </div>
  </footer>
</template>

<script setup>
import imageIcon from '../assets/logo empresa.png'
</script>

<style scoped>
.footer {
  background-color: #FF3A18;
  padding: 40px 0;
  margin-top: 60px;
  width: 100%;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10%;
  margin-bottom: 25px;
  gap: 80px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 35rem;
}

.logo-icon {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center; 
}

.logo-icon img {
  width: 250%;
  height: 250%;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.phone {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #2d2d2d;
}

.phone-icon {
  font-size: 1.2rem;
}

.social-section {
  flex: 1;
  justify-content: flex-end;
}

.social-icons {
  display: flex;
  gap: 15px;
}

.social-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2d2d2d;
  text-decoration: none;
  font-weight: bold;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.social-icon:hover {
  background-color: rgba(255, 255, 255, 0.35);
}

.footer-info {
  text-align: center;
  margin-bottom: 20px;
}

.info-text {
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.footer-links {
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.footer-link {
  color: #2d2d2d;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  transition: opacity 0.3s ease;
}

.footer-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.link-separator {
  color: #2d2d2d;
  font-weight: 500;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .logo-section,
  .middle-section,
  .social-section {
    justify-content: center;
  }

  .footer-links {
    flex-wrap: wrap;
  }
}
</style>
