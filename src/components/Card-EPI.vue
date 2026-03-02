<template>
  <div class="card-EPI">
    <div class="card-content">
      <img src="../assets/card-image.png" alt="Icone" class="card-image" />
      <h2 class="card-title">Card Title</h2>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>

.card-EPI {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  flex-direction: column;
  width: 15rem;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.card-content img {
  width: 10%;
  height: 30%;
}
.card-title {
  color: #f05432;
}

.card-description {
  color: #b0b5be;
  font-size: 0.9rem;
}
</style>