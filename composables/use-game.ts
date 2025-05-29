import type { Emitted, PlayEvent } from './types';

const INITIAL_POPULATION = 100;

const useGame = createSharedComposable(() => {
  const { emit, reset: resetEvent } = useEvent();
  const { reset: resetSociety } = useSociety();
  const { create } = useEntity();
  const { day } = useTime();
  const { getDeathEvents } = useDeath();
  const { getBirthEvents } = useBirth();
  const { getCouplingEvents, reset: resetCoupling } = useCoupling();

  function play() {
    resetEvent();
    resetSociety();
    resetCoupling();
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
