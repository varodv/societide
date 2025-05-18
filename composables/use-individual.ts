import type { AnyIndividualEvent, Emitted, Individual } from './types';

function useIndividual() {
  const { log } = useEvent();
  const { getTimeSince } = useTime();

  function getLog(individual: Individual) {
    return log.value.filter(
      event =>
        (event as Emitted<AnyIndividualEvent>).payload?.individual?.id
        === individual.id,
    );
  }

  function getAge(individual: Individual) {
    const individualLog = getLog(individual);
    const birthEvent = individualLog.find(event => event.type === 'BIRTH');
    if (!birthEvent) {
      throw new Error('The given individual does not exist');
    }
    const deathEvent = individualLog.find(event => event.type === 'DEATH');
    return getTimeSince(birthEvent.timestamp, deathEvent?.timestamp);
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

  return {
    getLog,
    getAge,
    isAlive,
  };
}

export {
  useIndividual,
};
