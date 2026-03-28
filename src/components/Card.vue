<template>
  <div class="card">
    <div class="card-content">
      <img :src="image" :alt="title" class="card-image" />
      <h2 class="card-title">{{ title }}</h2>
      <p class="card-description">{{ description }}</p>
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
  },
  description: {
    type: String,
    required: true
  }
})
</script>

<style scoped>

.card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #3d4555;
  width: 20rem;
  height: 25rem;
  border-radius: 12px;
  color: white;
  gap: 5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(240, 84, 50, 0.15);
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  width: 100%;
  height: 100%;
  gap: 16px;
}

.card-content img {
  width: 40%;
  height: 30%;
  object-fit: contain;
  filter: brightness(0) saturate(100%) invert(43%) sepia(92%) saturate(570%) hue-rotate(351deg) brightness(104%) contrast(103%);
}

.card-title {
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
  letter-spacing: -0.3px;
  line-height: 1.3;
}

.card-description {
  color: #b0b5be;
  font-size: 0.95rem;
  text-align: center;
  line-height: 1.6;
  font-weight: 500;
}
</style>