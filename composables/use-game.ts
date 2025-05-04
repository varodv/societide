import type { Emitted, PlayEvent } from './types';

function useGame() {
  const { emit, reset } = useEvent();

  function play() {
    reset();
    return emit({ type: 'PLAY' })[0] as Emitted<PlayEvent>;
  }

  return {
    play,
  };
}

export {
  useGame,
};
