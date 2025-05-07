import type { Event } from './event';

type PauseEvent = Event<'PAUSE'>;

type ResumeEvent = Event<'RESUME'>;

type SetSpeedEvent = Event<'SET_SPEED', { value: number }>;

type TimeEvent = PauseEvent | ResumeEvent | SetSpeedEvent;

export type {
  PauseEvent,
  ResumeEvent,
  SetSpeedEvent,
  TimeEvent,
};
