import { useTime } from './use-time';

vi.mock('./use-event', () => ({
  useEvent: vi.fn(),
}));

vi.mock('@vueuse/core', () => ({
  useNow: vi.fn(),
}));

describe('useTime', () => {
  let logMock: { value: any[] };
  let emitMock: ReturnType<typeof vi.fn>;
  let nowMock: { value: Date };

  beforeEach(() => {
    logMock = { value: [] };
    emitMock = vi.fn().mockImplementation(event => event);
    nowMock = { value: new Date() };

    (useEvent as any).mockReturnValue({
      log: logMock,
      emit: emitMock,
    });

    (useNow as any).mockReturnValue(nowMock);
  });

  it('should compute time as 0 if no PLAY event exists', () => {
    const { time } = useTime();
    expect(time.value).toBe(0);
  });

  it('should compute time since the PLAY event', () => {
    const playTimestamp = new Date(nowMock.value.getTime() - 1000);
    logMock.value.push({ type: 'PLAY', timestamp: playTimestamp });

    const { time } = useTime();
    expect(time.value).toBeGreaterThan(0);
  });

  it('should compute paused state correctly', () => {
    const pauseTimestamp = new Date(nowMock.value.getTime() - 1000);
    logMock.value.push({ type: 'PAUSE', timestamp: pauseTimestamp });

    const { paused } = useTime();
    expect(paused.value).toBe(true);
  });

  it('should compute speed correctly', () => {
    const setSpeedTimestamp = new Date(nowMock.value.getTime() - 1000);
    logMock.value.push({
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
    logMock.value.push({ type: 'PLAY', timestamp: new Date() });
    logMock.value.push({ type: 'PAUSE', timestamp: new Date() });

    const { pause } = useTime();
    expect(() => pause()).toThrowError('The game is already paused');
  });

  it('should emit a PAUSE event', () => {
    logMock.value.push({ type: 'PLAY', timestamp: new Date() });

    const { pause } = useTime();
    pause();

    expect(emitMock).toHaveBeenCalledWith({ type: 'PAUSE' });
  });

  it('should throw an error when resuming without a PLAY event', () => {
    const { resume } = useTime();
    expect(() => resume()).toThrowError('The game is not started yet');
  });

  it('should throw an error when resuming while not paused', () => {
    logMock.value.push({ type: 'PLAY', timestamp: new Date() });

    const { resume } = useTime();
    expect(() => resume()).toThrowError('The game is not paused');
  });

  it('should emit a RESUME event', () => {
    logMock.value.push({ type: 'PLAY', timestamp: new Date() });
    logMock.value.push({ type: 'PAUSE', timestamp: new Date() });

    const { resume } = useTime();
    resume();

    expect(emitMock).toHaveBeenCalledWith({ type: 'RESUME' });
  });

  it('should throw an error when setting speed without a PLAY event', () => {
    const { setSpeed } = useTime();
    expect(() => setSpeed(2)).toThrowError('The game is not started yet');
  });

  it('should emit a SET_SPEED event', () => {
    logMock.value.push({ type: 'PLAY', timestamp: new Date() });

    const { setSpeed } = useTime();
    setSpeed(2);

    expect(emitMock).toHaveBeenCalledWith({
      type: 'SET_SPEED',
      payload: { value: 2 },
    });
  });

  it('should calculate time since a timestamp correctly', () => {
    logMock.value.push(
      {
        type: 'PLAY',
        timestamp: new Date(nowMock.value.getTime() - 5000),
      },
      {
        type: 'PAUSE',
        timestamp: new Date(nowMock.value.getTime() - 4000),
      },
      {
        type: 'RESUME',
        timestamp: new Date(nowMock.value.getTime() - 3000),
      },
      {
        type: 'SET_SPEED',
        timestamp: new Date(nowMock.value.getTime() - 2000),
        payload: { value: 2 },
      },
      {
        type: 'PAUSE',
        timestamp: new Date(nowMock.value.getTime() - 1000),
      },
    );

    const { getTimeSince } = useTime();
    const result = getTimeSince(new Date(nowMock.value.getTime() - 4000));

    expect(result).toEqual(3000);
  });
});
