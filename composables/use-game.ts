import type { Emitted, PlayEvent } from './types';

const useGame = createSharedComposable(() => {
  const { emit, reset } = useEvent();
  const { create } = useEntity();
  const { day } = useTime();
  const { getDeathEvents } = useDeath();

  function play() {
    reset();
    return emit(
      { type: 'PLAY' },
      ...Array.from({ length: 100 }, () => ({
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
  });

  return {
    play,
  };
});

export {
  useGame,
};
