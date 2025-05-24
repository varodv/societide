import type { Emitted, PauseEvent, ResumeEvent, SetSpeedEvent, TimeEvent } from './types';

const MILLISECONDS_IN_A_DAY = 86400000;
const MILLISECONDS_IN_A_YEAR = 31557600000;

const SPEEDS = [1, 60, 3600, 86400];
const DEFAULT_SPEED = SPEEDS[3];

function useTime() {
  const { log, emit } = useEvent();
  const now = useNow();

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

  const paused = computed(() => isPausedAt(now.value));

  const speed = computed(() => getSpeedAt(now.value));

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
    time,
    day,
    paused,
    speed,
    pause,
    resume,
    setSpeed,
    getTimeSince,
  };
}

export {
  DEFAULT_SPEED,
  MILLISECONDS_IN_A_DAY,
  MILLISECONDS_IN_A_YEAR,
  SPEEDS,
  useTime,
};
