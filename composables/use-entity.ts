import type { Entity } from './types';

function useEntity() {
  function create<Type extends Record<string, any>>(payload: Type): Entity<Type> {
    if ('id' in payload) {
      throw new Error('The given payload already has a property \'id\'');
    }
    return {
      ...payload,
      id: crypto.randomUUID(),
    };
  }

  return {
    create,
  };
}

export {
  useEntity,
};
