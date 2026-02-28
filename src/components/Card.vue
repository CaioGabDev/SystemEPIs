<template>
  <div class="card">
    <div class="card-content">
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
  box-shadow: 1px 10px 8px rgba(255, 255, 255, 0.3);
  gap:5rem;
}

.card-title {
  color: #f05432;
  margin-bottom: 5px;
}

.card-description {
  color: #b0b5be;
  font-size: 0.9rem;
}
</style>