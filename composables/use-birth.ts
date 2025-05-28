import type { BirthEvent, Collective } from './types';

const BIRTH_CHANCE = 1;
const MAX_BIRTH_AGE = 40;
const MAX_CHILDREN = 5;

function useBirth() {
  const { couples } = useCoupling();
  const { create } = useEntity();

  function getBirthEvents(day = 0) {
    if (day === 0) {
      return [];
    }
    return couples.value.reduce<Array<BirthEvent>>((result, couple) => {
      const roll = Math.random();
      if (roll < getDailyBirthChance(couple)) {
        result.push({
          type: 'BIRTH',
          payload: {
            individual: create({
              parents: couple,
            }),
          },
        });
      }
      return result;
    }, []);
  }

  function getDailyBirthChance(couple: Collective<2>) {
    const { age: age1, children } = useIndividual({ id: couple[0] });
    const { age: age2 } = useIndividual({ id: couple[1] });
    const age = Math.max(age1.value, age2.value);
    if (age <= MAX_BIRTH_AGE) {
      let totalChance = BIRTH_CHANCE;
      totalChance -= (children.value.length / MAX_CHILDREN) * totalChance;
      const times = ((MAX_BIRTH_AGE - MIN_COUPLING_AGE) * 365) / AGE_DAYS_MULTIPLIER;
      return getPartialChance(totalChance, times);
    }
    return 0;
  }

  return {
    getBirthEvents,
  };
}

export {
  BIRTH_CHANCE,
  MAX_BIRTH_AGE,
  MAX_CHILDREN,
  useBirth,
};
