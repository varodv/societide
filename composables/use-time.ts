import type { AnyEvent, Emitted, PauseEvent, ResumeEvent, SetSpeedEvent, TimeEvent } from './types';

const MILLISECONDS_IN_A_SECOND = 1000;
const MILLISECONDS_IN_A_MINUTE = MILLISECONDS_IN_A_SECOND * 60;
const MILLISECONDS_IN_AN_HOUR = MILLISECONDS_IN_A_MINUTE * 60;
const MILLISECONDS_IN_A_DAY = MILLISECONDS_IN_AN_HOUR * 24;
const MILLISECONDS_IN_A_YEAR = MILLISECONDS_IN_A_DAY * 365;

const SPEEDS = [
  MILLISECONDS_IN_A_SECOND / 1000,
  MILLISECONDS_IN_A_MINUTE / 1000,
  MILLISECONDS_IN_AN_HOUR / 1000,
  MILLISECONDS_IN_A_DAY / 1000,
];
const DEFAULT_SPEED = SPEEDS[3];

const useTime = createSharedComposable(() => {
  const { emit, subscribe } = useEvent();
  const now = useNow();

  const paused = ref(false);

  const speed = ref(DEFAULT_SPEED);

  const log = ref<Array<Emitted<AnyEvent>>>([]);
  subscribe(
    event =>
      event.type === 'PLAY'
      || event.type === 'PAUSE'
      || event.type === 'RESUME'
      || event.type === 'SET_SPEED',
    (...events: Array<Emitted<AnyEvent>>) => {
      log.value.push(...events);
      if (events.length) {
        const lastTimeEvent = events[events.length - 1];
        paused.value = lastTimeEvent.type === 'PAUSE';
        const lastSetSpeedEvent = events.findLast(event => event.type === 'SET_SPEED') as
          | Emitted<SetSpeedEvent>
          | undefined;
        if (lastSetSpeedEvent) {
          speed.value = lastSetSpeedEvent.payload.value;
        }
      }
    },
    {
      immediate: true,
    },
  );

  const time = computed(() => {
    const playEvent = log.value.find(event => event.type === 'PLAY');
    if (!playEvent) {
      return undefined;
    }
    return getTimeSince(playEvent.timestamp);
  });

  const day = computed(() => {
    if (time.value === undefined) {
      return undefined;
    }
    return Math.floor(time.value / MILLISECONDS_IN_A_DAY);
  });

  function pause() {
    if (!log.value.find(event => event.type === 'PLAY')) {
      throw new Error('The game is not started yet');
    }
    if (paused.value) {
      throw new Error('The game is already paused');
    }
    return emit({ type: 'PAUSE' })[0] as Emitted<PauseEvent>;
  }

  function resume() {
    if (!log.value.find(event => event.type === 'PLAY')) {
      throw new Error('The game is not started yet');
    }
    if (!paused.value) {
      throw new Error('The game is not paused');
    }
    return emit({ type: 'RESUME' })[0] as Emitted<ResumeEvent>;
  }

  function setSpeed(value: number) {
    if (!log.value.find(event => event.type === 'PLAY')) {
      throw new Error('The game is not started yet');
    }
    return emit({
      type: 'SET_SPEED',
      payload: { value },
    })[0] as Emitted<SetSpeedEvent>;
  }

  function getTimeSince(timestamp: Date, limit = now.value) {
    let partialResult = 0;
    let partialTimestamp = timestamp;
    let partialPaused = isPausedAt(timestamp);
    let partialSpeed = getSpeedAt(timestamp);
    log.value
      .filter(
        event =>
          (event.type === 'PAUSE' || event.type === 'RESUME' || event.type === 'SET_SPEED')
          && event.timestamp >= timestamp
          && event.timestamp < limit,
      )
      .forEach((event) => {
        if (!partialPaused) {
          partialResult += (event.timestamp.getTime() - partialTimestamp.getTime()) * partialSpeed;
        }
        partialTimestamp = event.timestamp;
        partialPaused = event.type === 'PAUSE';
        if (event.type === 'SET_SPEED') {
          partialSpeed = (event as Emitted<SetSpeedEvent>).payload.value;
        }
      });
    if (!partialPaused) {
      partialResult += (limit.getTime() - partialTimestamp.getTime()) * partialSpeed;
    }
    return partialResult;
  }

  function reset() {
    log.value = [];
    paused.value = false;
    speed.value = DEFAULT_SPEED;
  }

  function isPausedAt(timestamp: Date) {
    const lastTimeEvent = log.value.findLast(
      event =>
        (event.type === 'PAUSE' || event.type === 'RESUME' || event.type === 'SET_SPEED')
        && event.timestamp <= timestamp,
    ) as Emitted<TimeEvent>;
    return lastTimeEvent?.type === 'PAUSE';
  }

  function getSpeedAt(timestamp: Date) {
    const lastSetSpeedEvent = log.value.findLast(
      event => event.type === 'SET_SPEED' && event.timestamp <= timestamp,
    ) as Emitted<SetSpeedEvent>;
    return lastSetSpeedEvent?.payload.value ?? DEFAULT_SPEED;
  }

  return {
    paused,
    speed,
    time,
    day,
    pause,
    resume,
    setSpeed,
    getTimeSince,
    reset,
  };
});

export {
  DEFAULT_SPEED,
  MILLISECONDS_IN_A_DAY,
  MILLISECONDS_IN_A_MINUTE,
  MILLISECONDS_IN_A_SECOND,
  MILLISECONDS_IN_A_YEAR,
  MILLISECONDS_IN_AN_HOUR,
  SPEEDS,
  useTime,
};
