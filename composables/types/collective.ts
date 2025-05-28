import type { Event } from './event';
import type { Individual } from './individual';
import type { FixedArray } from './shared';

type Collective<Length extends number = number> = FixedArray<Individual['id'], Length>;

type CollectiveEvent<
  Type extends string,
  Length extends number = number,
  PayloadType extends { collective: Collective } = { collective: Collective<Length> },
> = Event<Type, PayloadType>;

type AnyCollectiveEvent = CollectiveEvent<string>;

export type {
  AnyCollectiveEvent,
  Collective,
  CollectiveEvent,
};
