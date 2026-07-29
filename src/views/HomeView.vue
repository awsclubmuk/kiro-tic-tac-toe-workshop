<template>
  <MainMenu
    @new-game="router.push({ name: 'setup' })"
    @leaderboard="router.push({ name: 'leaderboard' })"
    @history="router.push({ name: 'history' })"
  />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import MainMenu from '@/components/MainMenu.vue'

const router = useRouter()
</script>
