import type { Emitted, PlayEvent } from './types';

const INITIAL_POPULATION = 100;

const useGame = createSharedComposable(() => {
  const { emit, reset: resetEvent } = useEvent();
  const { day, reset: resetTime } = useTime();
  const { reset: resetSociety } = useSociety();
  const { getCouplingEvents, reset: resetCoupling } = useCoupling();
  const { create } = useEntity();
  const { getDeathEvents } = useDeath();
  const { getBirthEvents } = useBirth();

  function play() {
    reset();
    return emit(
      { type: 'PLAY' },
      ...Array.from({ length: INITIAL_POPULATION }, () => ({
        type: 'BIRTH',
        payload: {
          individual: create({
            parents: [],
          }),
        },
      })),
    )[0] as Emitted<PlayEvent>;
  }

  function reset() {
    resetEvent();
    resetTime();
    resetSociety();
    resetCoupling();
  }

  watch(day, (value) => {
    const deathEvents = getDeathEvents(value);
    if (deathEvents.length > 0) {
      emit(...deathEvents);
    }
    const birthEvents = getBirthEvents(value);
    if (birthEvents.length > 0) {
      emit(...birthEvents);
    }
    const couplingEvents = getCouplingEvents(value);
    if (couplingEvents.length > 0) {
      emit(...couplingEvents);
    }
  });

  return {
    play,
  };
});

export {
  INITIAL_POPULATION,
  useGame,
};
