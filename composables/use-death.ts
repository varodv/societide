import type { DeathEvent, Individual } from './types';

const MAX_AGE = 100;
const DEATH_CHANCES = [
  [18, 0],
  [40, 0.01],
  [64, 0.1],
  [80, 0.35],
  [MAX_AGE, 0.5],
];

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
    let totalChance = 0;
    let previousAgeLimit = 0;
    for (const [ageLimit, chance] of DEATH_CHANCES) {
      totalChance += chance;
      if (age < ageLimit) {
        const times = ((ageLimit - previousAgeLimit) * 365) / AGE_DAYS_MULTIPLIER;
        return getPartialChance(totalChance, times);
      }
      previousAgeLimit = ageLimit;
    }
    return 1;
  }

  return {
    getDeathEvents,
  };
}

export {
  DEATH_CHANCES,
  MAX_AGE,
  useDeath,
};
