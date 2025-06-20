import type { Entity } from './entity';

type Event<
  Type extends string,
  PayloadType extends undefined | Record<string, any> = undefined,
> = PayloadType extends undefined ? { type: Type } : { type: Type; payload: PayloadType };

type AnyEvent = Event<string, undefined | Record<string, any>>;

type Emitted<EventType extends AnyEvent> = Entity<EventType & { timestamp: Date }>;

type Subscription = Entity<{
  filter: (event: Emitted<AnyEvent>) => boolean;
  callback: (...events: Array<Emitted<AnyEvent>>) => void;
  options?: {
    immediate?: boolean;
  };
}>;

export type {
  AnyEvent,
  Emitted,
  Event,
  Subscription,
};
