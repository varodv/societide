import type { DeathEvent, Individual } from './types';

function useDeath() {
  const { people } = useSociety();
  const { getAge } = useIndividual();

  function getDeathEvents(day = 0) {
    if (day === 0) {
      return [];
    }
    return people.value.reduce<Array<DeathEvent>>((result, individual) => {
      const roll = Math.random();
      if (roll < getDailyDeathChance(individual)) {
        result.push({
          type: 'DEATH',
          payload: {
            individual,
          },
        });
      }
      return result;
    }, []);
  }

  function getDailyDeathChance(individual: Individual) {
    const age = getAge(individual) / MILLISECONDS_IN_A_YEAR;
    if (age < 18) {
      return 0;
    }
    const getTimesInRange = (start: number, end: number) => {
      return ((end - start) * 365) / AGE_DAYS_MULTIPLIER;
    };
    let totalChance = 0.01;
    if (age < 40) {
      return getPartialChance(totalChance, getTimesInRange(18, 40));
    }
    totalChance += 0.1;
    if (age < 64) {
      return getPartialChance(totalChance, getTimesInRange(40, 64));
    }
    totalChance += 0.35;
    if (age < 80) {
      return getPartialChance(totalChance, getTimesInRange(64, 80));
    }
    totalChance += 0.5;
    if (age < 100) {
      return getPartialChance(totalChance, getTimesInRange(80, 100));
    }
    return 1;
  }

  return {
    getDeathEvents,
  };
}

export {
  useDeath,
};
