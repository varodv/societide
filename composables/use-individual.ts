import type {
  AnyCollectiveEvent,
  AnyEvent,
  AnyIndividualEvent,
  BirthEvent,
  CouplingEvent,
  DeathEvent,
  Emitted,
  Individual,
  IndividualComposable,
} from './types';

const AGE_DAYS_MULTIPLIER = 365;

const instances: Record<Individual['id'], IndividualComposable> = {};

function useIndividual({ id }: { id: Individual['id'] }) {
  if (!(id in instances)) {
    instances[id] = createComposable({ id });
  }
  return instances[id];
}

function createComposable({ id }: { id: Individual['id'] }): IndividualComposable {
  const { subscribe, unsubscribe } = useEvent();
  const { getTimeSince } = useTime();

  const log = ref<Array<Emitted<AnyEvent>>>([]);
  const subscriptionId = subscribe(
    event =>
      (event as Emitted<AnyIndividualEvent>).payload?.individual?.id === id
      || (event as Emitted<AnyCollectiveEvent>).payload?.collective?.some(
        currentId => currentId === id,
      )
      || (event as Emitted<BirthEvent>).payload?.individual?.parents?.some(
        parent => parent === id,
      ),
    (...events: Array<Emitted<AnyEvent>>) => {
      log.value.push(...events);
      if (events.some(event => event.type === 'DEATH')) {
        unsubscribe(subscriptionId);
      }
    },
    {
      immediate: true,
    },
  );

  const birthEvent = log.value.find(
    event => event.type === 'BIRTH',
  ) as Emitted<BirthEvent> | undefined;
  if (!birthEvent) {
    throw new Error('The given individual does not exist');
  }

  const parents = birthEvent.payload.individual.parents.map(
    parent => useIndividual({ id: parent }),
  ) as IndividualComposable['parents'];

  const deathEvent = computed(() =>
    log.value.find(event => event.type === 'DEATH') as Emitted<DeathEvent> | undefined,
  );

  const alive = computed(() => !deathEvent.value);

  const age = computed(() => {
    return Math.round(
      getTimeSince(birthEvent.timestamp, deathEvent.value?.timestamp)
      * AGE_DAYS_MULTIPLIER
      / MILLISECONDS_IN_A_YEAR,
    );
  });

  const couple = computed(() => {
    const couplingEvent = log.value.find(event => event.type === 'COUPLING');
    if (!couplingEvent) {
      return;
    }
    const { collective: couple } = (couplingEvent as Emitted<CouplingEvent>).payload;
    return useIndividual({ id: couple.find(currentId => currentId !== id)! });
  });

  const children = computed(() =>
    log.value.reduce<Array<IndividualComposable>>((result, event) => {
      if (event.type === 'BIRTH') {
        const { individual: child } = (event as Emitted<BirthEvent>).payload;
        if (child.id !== id) {
          result.push(useIndividual({ id: child.id }));
        }
      }
      return result;
    }, []),
  );

  return {
    id,
    parents,
    log,
    alive,
    age,
    couple,
    children,
  };
}

export {
  AGE_DAYS_MULTIPLIER,
  useIndividual,
};
