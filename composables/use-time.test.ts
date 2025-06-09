import type { Subscription } from './types';
import { MILLISECONDS_IN_A_DAY, useTime } from './use-time';

vi.mock('./use-event', () => ({
  useEvent: vi.fn(),
}));

vi.mock(import('@vueuse/core'), async importOriginal => ({
  ...(await importOriginal()),
  useNow: vi.fn(),
}));

describe('useTime', () => {
  const emitMock = vi.fn().mockImplementation(event => event);
  let callback: Subscription['callback'];
  const subscribeMock = vi
    .fn<(filter: Subscription['filter'], callback: Subscription['callback']) => void>()
    .mockImplementation((filter, cb) => {
      callback = (...events) => cb(...events.filter(filter));
    });
  (useEvent as any).mockReturnValue({
    emit: emitMock,
    subscribe: subscribeMock,
  });

  const nowMock = { value: new Date() };
  (useNow as any).mockReturnValue(nowMock);

  beforeEach(() => {
    useTime().reset();
  });

  it('should compute time as undefined if no PLAY event exists', () => {
    const { time } = useTime();
    expect(time.value).toBeUndefined();
  });

  it('should compute time since the PLAY event', () => {
    const playTimestamp = new Date(nowMock.value.getTime() - 1000);
    callback({ id: '123', type: 'PLAY', timestamp: playTimestamp });

    const { time } = useTime();
    expect(time.value).toBe(DEFAULT_SPEED * 1000);
  });

  it('should compute day as undefined if no PLAY event exists', () => {
    const { day } = useTime();
    expect(day.value).toBeUndefined();
  });

  it('should compute day since the PLAY event', () => {
    const playTimestamp = new Date(nowMock.value.getTime() - MILLISECONDS_IN_A_DAY);
    callback({ id: '123', type: 'PLAY', timestamp: playTimestamp });

    const { day } = useTime();
    expect(day.value).toBe(DEFAULT_SPEED);
  });

  it('should compute paused state correctly', () => {
    const pauseTimestamp = new Date(nowMock.value.getTime() - 1000);
    callback({ id: '123', type: 'PAUSE', timestamp: pauseTimestamp });

    const { paused } = useTime();
    expect(paused.value).toBe(true);
  });

  it('should compute speed correctly', () => {
    const setSpeedTimestamp = new Date(nowMock.value.getTime() - 1000);
    callback({
      id: '123',
      type: 'SET_SPEED',
      timestamp: setSpeedTimestamp,
      payload: { value: 2 },
    });

    const { speed } = useTime();
    expect(speed.value).toBe(2);
  });

  it('should throw an error when pausing without a PLAY event', () => {
    const { pause } = useTime();
    expect(() => pause()).toThrowError('The game is not started yet');
  });

  it('should throw an error when pausing while already paused', () => {
    callback(
      { id: '123', type: 'PLAY', timestamp: new Date() },
      { id: '123', type: 'PAUSE', timestamp: new Date() },
    );

    const { pause } = useTime();
    expect(() => pause()).toThrowError('The game is already paused');
  });

  it('should emit a PAUSE event', () => {
    callback({ id: '123', type: 'PLAY', timestamp: new Date() });

    const { pause } = useTime();
    pause();

    expect(emitMock).toHaveBeenCalledWith({ type: 'PAUSE' });
  });

  it('should throw an error when resuming without a PLAY event', () => {
    const { resume } = useTime();
    expect(() => resume()).toThrowError('The game is not started yet');
  });

  it('should throw an error when resuming while not paused', () => {
    callback({ id: '123', type: 'PLAY', timestamp: new Date() });

    const { resume } = useTime();
    expect(() => resume()).toThrowError('The game is not paused');
  });

  it('should emit a RESUME event', () => {
    callback(
      { id: '123', type: 'PLAY', timestamp: new Date() },
      { id: '123', type: 'PAUSE', timestamp: new Date() },
    );

    const { resume } = useTime();
    resume();

    expect(emitMock).toHaveBeenCalledWith({ type: 'RESUME' });
  });

  it('should throw an error when setting speed without a PLAY event', () => {
    const { setSpeed } = useTime();
    expect(() => setSpeed(2)).toThrowError('The game is not started yet');
  });

  it('should emit a SET_SPEED event', () => {
    callback({ id: '123', type: 'PLAY', timestamp: new Date() });

    const { setSpeed } = useTime();
    setSpeed(2);

    expect(emitMock).toHaveBeenCalledWith({
      type: 'SET_SPEED',
      payload: { value: 2 },
    });
  });

  it('should calculate time since a timestamp correctly', () => {
    callback(
      {
        id: '123',
        type: 'PLAY',
        timestamp: new Date(nowMock.value.getTime() - 5000),
      },
      {
        id: '123',
        type: 'SET_SPEED',
        timestamp: new Date(nowMock.value.getTime() - 5000),
        payload: { value: 1 },
      },
      {
        id: '123',
        type: 'PAUSE',
        timestamp: new Date(nowMock.value.getTime() - 4000),
      },
      {
        id: '123',
        type: 'RESUME',
        timestamp: new Date(nowMock.value.getTime() - 3000),
      },
      {
        id: '123',
        type: 'SET_SPEED',
        timestamp: new Date(nowMock.value.getTime() - 2000),
        payload: { value: 2 },
      },
      {
        id: '123',
        type: 'PAUSE',
        timestamp: new Date(nowMock.value.getTime() - 1000),
      },
    );

    const { getTimeSince } = useTime();
    const result = getTimeSince(new Date(nowMock.value.getTime() - 4000));

    expect(result).toEqual(3000);
  });
});
