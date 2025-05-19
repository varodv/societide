import type { Emitted, PlayEvent } from './types';

const useGame = createSharedComposable(() => {
  const { emit, reset } = useEvent();
  const { create } = useEntity();

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

  useDeath().initialize();

  return {
    play,
  };
});

export {
  useGame,
};
