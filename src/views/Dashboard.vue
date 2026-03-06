<template>
  <div class="dashboard-container">
    <HeaderGeral />
    <main class="home-container">
        <div class="card-container">
            <div class="Button-icon">
                <button class="icon"></button>
                <button class="icon"></button>
                <div class="button2">
                <button class="icon"></button>
                <button class="icon"></button>
                </div>
            </div>
            <div class="content-left">
            <h1 class="title">Bem vindo ao Dashboard!!</h1>
            </div>
        </div>
    </main>
  </div>
</template>

<script setup>
import HeaderGeral from '../components/HeaderGeral.vue'
</script>

<style scoped>
.home-container {
    display: flex;
    flex-direction: column;
}
.card-container {
    display: flex;
    flex-direction: row;
    gap: 3rem;
    margin-top: 3rem;
}

.Button-icon {
    color: rgb(80, 13, 13);
}

.icon {
    gap:3px;
    width: 1rem;
    height: 1rem;
    margin-left: 0.3rem;
}

.title {
    font-size: 2rem;
    color: white;
}

</style>
