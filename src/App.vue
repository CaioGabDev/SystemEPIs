<template>
  <div id="scroll-container" @scroll="handleScroll">
    <router-view />
    <button v-show="isVisible" class="back-to-top" @click="goToTop">↑</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isVisible = ref(false)

const handleScroll = (e) => {
  isVisible.value = e.target.scrollTop > 300
}

const goToTop = () => {
  document.getElementById('scroll-container').scrollTop = 0
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#scroll-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: clip;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #293140;
}

.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #ff8c42;
  color: white;
  border: none;
  font-size: 28px;
  cursor: pointer;
  z-index: 9999;
}
</style>