import type {
  AnyCollectiveEvent,
  AnyIndividualEvent,
  BirthEvent,
  Emitted,
  Individual,
} from './types';

const AGE_DAYS_MULTIPLIER = 365;

function useIndividual() {
  const { log } = useEvent();
  const { getTimeSince } = useTime();

  function getLog(individual: Individual) {
    return log.value.filter(
      event =>
        (event as Emitted<AnyIndividualEvent>).payload?.individual?.id === individual.id
        || (event as Emitted<BirthEvent>).payload?.individual?.parents?.some(
          parent => parent === individual.id,
        )
        || (event as Emitted<AnyCollectiveEvent>).payload?.collective?.some(
          currentIndividual => currentIndividual.id === individual.id,
        ),
    );
  }

  function getAge(individual: Individual) {
    const individualLog = getLog(individual);
    const birthEvent = individualLog.find(event => event.type === 'BIRTH');
    if (!birthEvent) {
      throw new Error('The given individual does not exist');
    }
    const deathEvent = individualLog.find(event => event.type === 'DEATH');
    return getTimeSince(birthEvent.timestamp, deathEvent?.timestamp) * AGE_DAYS_MULTIPLIER;
  }

  function isAlive(individual: Individual) {
    const individualLog = getLog(individual);
    const birthEvent = individualLog.find(event => event.type === 'BIRTH');
    if (!birthEvent) {
      throw new Error('The given individual does not exist');
    }
    const deathEvent = individualLog.find(event => event.type === 'DEATH');
    return !deathEvent;
  }

  function getChildren(individual: Individual) {
    const individualLog = getLog(individual);
    return individualLog.reduce<Array<Individual>>((result, event) => {
      if (event.type === 'BIRTH') {
        const { individual: child } = (event as Emitted<BirthEvent>).payload;
        if (child.parents.includes(individual.id)) {
          result.push(child);
        }
      }
      return result;
    }, []);
  }

  return {
    getLog,
    getAge,
    isAlive,
    getChildren,
  };
}

export {
  AGE_DAYS_MULTIPLIER,
  useIndividual,
};
