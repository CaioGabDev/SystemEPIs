<template>
  <footer class="footer">
    <div class="footer-content">
  <h2 class="logo-text">DashEPI</h2>
      <div class="footer-section middle-section">
        <div class="phone">
          <span class="phone-icon">☎</span>
          <span class="phone-number">19 9999 - 9999</span>
        </div>
      </div>

      <div class="footer-section social-section">
        <div class="social-icons">
          <a href="#" class="social-icon" title="Facebook">f</a>
          <a href="#" class="social-icon" title="LinkedIn">in</a>
        </div>
      </div>
    </div>

    <div class="footer-info">
      <p class="info-text">Site desenvolvido para clientes educacionais, focado na aprendizagem</p>
    </div>

    <div class="footer-links">
      <a href="#" class="footer-link">Termos de uso</a>
      <span class="link-separator">|</span>
      <a href="#" class="footer-link">By CaioGabDev</a>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, #FF3A18 0%, #E63510 100%);
  padding: 50px 0 30px;
  margin-top: 60px;
  width: 100%;
  border-top: 4px solid rgba(255, 255, 255, 0.1);
  box-sizing: border-box;
  overflow-x: hidden;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 8%;
  margin-bottom: 35px;
  gap: 60px;
  flex-wrap: wrap;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-shrink: 0;
}

.logo-icon {
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}


.logo-text {
  font-size: 1.8rem;
  font-weight: 900;
  margin: 0;
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: 1px;
}

.phone {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 12px 20px;
  border-radius: 25px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.phone:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.phone-icon {
  font-size: 1.3rem;
}

.social-section {
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.social-icons {
  display: flex;
  gap: 12px;
}

.social-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  text-decoration: none;
  font-weight: bold;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.social-icon:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-4px) scale(1.1);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.footer-info {
  text-align: center;
  margin-bottom: 25px;
  padding: 20px 10%;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-text {
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  margin: 0;
  text-transform: uppercase;
  line-height: 1.6;
}

.footer-links {
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
  flex-wrap: wrap;
}

.footer-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  padding: 8px 12px;
  border-radius: 6px;
  position: relative;
}

.footer-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.8);
  transition: width 0.3s ease;
}

.footer-link:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.1);
}

.footer-link:hover::after {
  width: 100%;
}

.link-separator {
  color: rgba(255, 255, 255, 0.3);
  font-weight: 500;
  font-size: 1.2rem;
}

@media (max-width: 1024px) {
  .footer-content {
    gap: 40px;
    padding: 0 5%;
  }

  .logo-container {
    gap: 10px;
  }

  .logo-text {
    font-size: 1.5rem;
  }
}

@media (max-width: 768px) {
  .footer {
    padding: 40px 0 25px;
  }

  .footer-content {
    flex-direction: column;
    gap: 25px;
    text-align: center;
    padding: 0 5%;
    margin-bottom: 25px;
  }

  .social-section {
    width: 100%;
    justify-content: center;
  }

  .phone {
    width: 100%;
    justify-content: center;
  }

  .logo-text {
    font-size: 1.4rem;
  }

  .footer-info {
    padding: 15px 5%;
    margin-bottom: 20px;
  }

  .info-text {
    font-size: 0.8rem;
  }

  .footer-links {
    flex-direction: column;
    gap: 10px;
  }

  .link-separator {
    display: none;
  }

  .footer-link {
    font-size: 0.8rem;
    padding: 6px 10px;
  }
}

@media (max-width: 480px) {
  .footer {
    padding: 30px 0 20px;
    margin-top: 40px;
  }

  .logo-container {
    flex-direction: column;
    gap: 10px;
  }

  .logo-text {
    font-size: 1.2rem;
  }

  .phone {
    font-size: 0.9rem;
  }

  .social-icons {
    gap: 10px;
  }

  .social-icon {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }
}
</style>
