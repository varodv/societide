import type { Entity } from './entity';
import type { AnyEvent, Emitted, Event } from './event';
import type { FixedArray } from './shared';

type Individual = Entity<{
  parents: Parents<Individual['id']>;
}>;

type Parents<Type> = FixedArray<Type, 0 | 1 | 2>;

type IndividualEvent<
  Type extends string,
  PayloadType extends { individual: Individual } = { individual: Individual },
> = Event<Type, PayloadType>;

type AnyIndividualEvent = IndividualEvent<string>;

interface IndividualComposable {
  id: Individual['id'];
  parents: Parents<IndividualComposable>;
  log: Ref<Array<Emitted<AnyEvent>>>;
  alive: ComputedRef<boolean>;
  age: ComputedRef<number>;
  couple: ComputedRef<IndividualComposable | undefined>;
  children: ComputedRef<Array<IndividualComposable>>;
}

export type {
  AnyIndividualEvent,
  Individual,
  IndividualComposable,
  IndividualEvent,
};
