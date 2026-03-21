<template>
  <div class="card-EPI">
    <div class="card-content">
      <img :src="image" :alt="title" class="card-image" />
      <h2 class="card-title">{{ title }}</h2>
    </div>
  </div>
</template>

<script setup>
defineProps({
  image: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  }
})
</script>

<style scoped>

.card-EPI {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #3d4555;
  flex-direction: column;
  width: 25rem;
  height: 7rem;
  border-radius: 7px;
  border: 1px solid #4a5568;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-EPI:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(255, 47, 0, 0.2);
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
  width: 60px;
  height: 60px;
  filter: brightness(0) saturate(100%) invert(47%) sepia(78%) saturate(1455%) hue-rotate(356deg) brightness(107%) contrast(101%);
}

.card-title {
  color: #ffffff;
  font-size: 1rem;
  text-align: center;
}

.card-description {
  color: #b0b5be;
  font-size: 0.9rem;
}
</style>