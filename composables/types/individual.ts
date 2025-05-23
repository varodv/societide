import type { Entity } from './entity';
import type { Event } from './event';

type Individual = Entity<{
  parents: [Individual['id']?, Individual['id']?];
}>;

type IndividualEvent<
  Type extends string,
  PayloadType extends { individual: Individual } = { individual: Individual },
> = Event<Type, PayloadType>;

type AnyIndividualEvent = IndividualEvent<string>;

export type {
  AnyIndividualEvent,
  Individual,
  IndividualEvent,
};
