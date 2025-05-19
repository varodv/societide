import type { DeathEvent, Individual, Initializable } from './types';

const useDeath = createSharedComposable<() => Initializable>(() => {
  const { day } = useTime();
  const { people } = useSociety();
  const { getAge } = useIndividual();
  const { emit } = useEvent();

  const initialized = ref(false);

  function initialize() {
    if (initialized.value) {
      throw new Error('useDeath is already initialized');
    }
    watch(day, (value = 0) => {
      if (!value) {
        return;
      }
      const deathEvents = people.value.reduce<Array<DeathEvent>>((result, individual) => {
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
      if (deathEvents.length > 0) {
        emit(...deathEvents);
      }
    });
    initialized.value = true;
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
    initialized,
    initialize,
  };
});

export {
  useDeath,
};
