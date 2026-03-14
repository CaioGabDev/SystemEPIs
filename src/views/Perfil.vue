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
        </div>
        <div class="content-right">
                <CardDashboard />
                <CardDashboard />
                <CardDashboard />
                <CardDashboard />
                <CardDashboard />
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
    margin-left: 5rem;
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

.content-right {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 3rem;
}

</style>
