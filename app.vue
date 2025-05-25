<script setup lang="ts">
const { play } = useGame();
const { time } = useTime();
</script>

<template>
  <div class="flex flex-col gap-4 h-screen p-4">
    <h1 class="self-center text-4xl font-extrabold tracking-tight">
      varodv/societide
    </h1>
    <div class="flex items-center justify-center gap-2 flex-wrap [&>button]:min-w-24">
      <Button :variant="!time ? 'default' : 'destructive'" @click="play()">
        play
      </Button>
      <Time />
    </div>
  </div>
</template>
