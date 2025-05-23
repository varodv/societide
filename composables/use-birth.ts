import type { BirthEvent, Collective } from './types';

function useBirth() {
  const { couples } = useCoupling();
  const { getAge, getChildren } = useIndividual();
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
              parents: [couple[0].id, couple[1].id],
            }),
          },
        });
      }
      return result;
    }, []);
  }

  function getDailyBirthChance(couple: Collective<2>) {
    const age = Math.max(
      getAge(couple[0]) / MILLISECONDS_IN_A_YEAR,
      getAge(couple[1]) / MILLISECONDS_IN_A_YEAR,
    );
    if (age < 40) {
      let totalChance = 1;
      totalChance -= (getChildren(couple[0]).length / 5) * totalChance;
      const times = ((40 - 18) * 365) / AGE_DAYS_MULTIPLIER;
      return getPartialChance(totalChance, times);
    }
    return 0;
  }

  return {
    getBirthEvents,
  };
}

export {
  useBirth,
};
