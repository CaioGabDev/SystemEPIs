<template>
  <div class="card">
    <div class="card-content">
      <img src="../assets/card-image.png" alt="Icone" class="card-image" />
      <h2 class="card-title">Card Title</h2>
      <p class="card-description">blaa.</p>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>

.card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  width: 15rem;
  height: 20rem;
  border-radius: 8px;
  color: white;
  gap:5rem;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  width: 100%;
  height: 100%;
}

.card-content img {
  width: 10%;
  height: 10%;
}
.card-title {
  color: #f05432;
}

.card-description {
  color: #b0b5be;
  font-size: 0.9rem;
}
</style>