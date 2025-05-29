import type { AnyEvent, Collective, CouplingEvent, DeathEvent, Emitted, Individual } from './types';

const COUPLING_CHANCE = 0.8;
const MIN_COUPLING_AGE = 18;
const MAX_COUPLING_AGE_DIFF = 5;

const useCoupling = createSharedComposable(() => {
  const { subscribe } = useEvent();
  const { people } = useSociety();

  const couples = ref<Array<Collective<2>>>([]);
  subscribe(
    event => event.type === 'COUPLING',
    (...events: Array<Emitted<AnyEvent>>) => {
      events.forEach((event) => {
        const { collective } = (event as Emitted<CouplingEvent>).payload;
        couples.value.push(collective);
      });
    },
    {
      immediate: true,
    },
  );
  subscribe(
    event => event.type === 'DEATH',
    (...events: Array<Emitted<AnyEvent>>) => {
      events.forEach((event) => {
        const { individual } = (event as Emitted<DeathEvent>).payload;
        const index = couples.value.findIndex(couple => couple.includes(individual.id));
        if (index >= 0) {
          couples.value.splice(index, 1);
        }
      });
    },
    {
      immediate: true,
    },
  );

  const singles = computed(() =>
    people.value.filter((individual) => {
      const { age, couple } = useIndividual({ id: individual.id });
      return age.value >= MIN_COUPLING_AGE && !couple.value;
    }),
  );

  function getCouplingEvents(day = 0) {
    if (day === 0) {
      return [];
    }
    return singles.value.reduce<Array<CouplingEvent>>((result, individual, index, array) => {
      const candidates = array
        .slice(index + 1)
        .filter(
          candidate => !candidate.parents.some(parent => individual.parents.includes(parent)),
        );
      const bestMatch = findBestMatch(individual, candidates);
      if (bestMatch) {
        const roll = Math.random();
        if (roll < getDailyCouplingChance(individual)) {
          result.push({
            type: 'COUPLING',
            payload: {
              collective: [individual.id, bestMatch.id],
            },
          });
        }
      }
      return result;
    }, []);
  }

  function reset() {
    couples.value = [];
  }

  function findBestMatch(individual: Individual, candidates: Array<Individual>) {
    let bestMatch: Individual | undefined;
    const { age: individualAge } = useIndividual({ id: individual.id });
    let minAgeDiff = Infinity;
    for (const candidate of candidates) {
      const { age: candidateAge } = useIndividual({ id: candidate.id });
      const ageDiff = Math.abs(individualAge.value - candidateAge.value);
      if (ageDiff < minAgeDiff) {
        minAgeDiff = ageDiff;
        if (ageDiff <= MAX_COUPLING_AGE_DIFF) {
          bestMatch = candidate;
        }
      }
    }
    return bestMatch;
  }

  function getDailyCouplingChance(_individual: Individual) {
    const times = ((MAX_AGE - MIN_COUPLING_AGE) * 365) / AGE_DAYS_MULTIPLIER;
    return getPartialChance(COUPLING_CHANCE, times);
  }

  return {
    couples,
    getCouplingEvents,
    reset,
  };
});

export {
  COUPLING_CHANCE,
  MAX_COUPLING_AGE_DIFF,
  MIN_COUPLING_AGE,
  useCoupling,
};
