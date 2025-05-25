<script setup lang="ts">
import {
  MILLISECONDS_IN_A_DAY,
  MILLISECONDS_IN_A_MINUTE,
  MILLISECONDS_IN_A_SECOND,
  MILLISECONDS_IN_AN_HOUR,
} from '@/composables/use-time';

const { time, day, paused, speed, pause, resume, setSpeed } = useTime();

const calendar = computed(() => String(day.value ?? 0).padStart(4, '0'));

const hour = computed(() =>
  Math.floor(((time.value ?? 0) % MILLISECONDS_IN_A_DAY) / MILLISECONDS_IN_AN_HOUR),
);

const minute = computed(() =>
  Math.floor(((time.value ?? 0) % MILLISECONDS_IN_AN_HOUR) / MILLISECONDS_IN_A_MINUTE),
);

const second = computed(() =>
  Math.floor(((time.value ?? 0) % MILLISECONDS_IN_A_MINUTE) / MILLISECONDS_IN_A_SECOND),
);

const millisecond = computed(() => Math.floor((time.value ?? 0) % MILLISECONDS_IN_A_SECOND));

const clock = computed(() => {
  const h = String(hour.value).padStart(2, '0');
  const m = String(minute.value).padStart(2, '0');
  const s = String(second.value).padStart(2, '0');
  const ms = String(millisecond.value).padStart(3, '0');
  return `${h}:${m}:${s}.${ms}`;
});
</script>

<template>
  <Button v-if="!paused" :disabled="!time" @click="pause()">
    pause
  </Button>
  <Button v-else :disabled="!time" @click="resume()">
    resume
  </Button>
  <Button
    v-for="value in SPEEDS"
    :key="value"
    variant="secondary"
    :disabled="!time || (value === speed && !paused)"
    @click="setSpeed(value)"
  >
    x{{ value }}
  </Button>
  <span class="w-full text-center font-mono text-sm"> {{ calendar }} - {{ clock }} </span>
</template>
