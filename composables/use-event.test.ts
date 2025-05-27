vi.mock('./use-entity', () => ({
  useEntity: vi.fn(),
}));

vi.mock(import('@vueuse/core'), async importOriginal => ({
  ...(await importOriginal()),
  useLocalStorage: vi.fn(),
  useNow: vi.fn(),
}));

describe('useEvent', () => {
  let createMock: ReturnType<typeof vi.fn>;
  let storageMock: { value: any };
  let nowMock: { value: Date };

  beforeEach(() => {
    createMock = vi.fn(event => ({ ...event, id: 'unique-id' }));
    (useEntity as any).mockReturnValue({ create: createMock });

    storageMock = { value: [] };
    (useLocalStorage as any).mockReturnValue(storageMock);

    nowMock = { value: new Date() };
    (useNow as any).mockReturnValue(nowMock);

    useEvent().reset();
  });

  it('should initialize log with an empty array', () => {
    const { log } = useEvent();
    expect(log.value).toEqual([]);
  });

  it('should emit events and add them to the log', () => {
    const { emit, log } = useEvent();
    const event1 = { type: 'event1', payload: { key: 'value1' } };
    const event2 = { type: 'event2', payload: { key: 'value2' } };

    const emittedEvents = emit(event1, event2);

    expect(emittedEvents).toHaveLength(2);
    expect(emittedEvents[0]).toMatchObject({
      ...event1,
      id: 'unique-id',
    });
    expect(emittedEvents[1]).toMatchObject({
      ...event2,
      id: 'unique-id',
    });
    expect(log.value).toEqual(emittedEvents);
  });

  it('should serialize and deserialize log correctly', () => {
    const serializedData = JSON.stringify([
      {
        type: 'event1',
        payload: { key: 'value1' },
        timestamp: '2023-01-01T00:00:00.000Z',
      },
    ]);

    const deserializedData = [
      {
        type: 'event1',
        payload: { key: 'value1' },
        timestamp: new Date('2023-01-01T00:00:00.000Z'),
      },
    ];

    const serializer = (useLocalStorage as any).mock.calls[0][2].serializer;

    expect(serializer.read(serializedData)).toEqual(deserializedData);
    expect(serializer.write(deserializedData)).toEqual(serializedData);
  });

  it('should allow subscribing and receiving filtered events', () => {
    const { subscribe, emit, unsubscribe } = useEvent();
    const callback = vi.fn();
    const filter = (event: any) => event.type === 'event1';

    const id = subscribe(filter, callback);

    emit({ type: 'event1', payload: { foo: 1 } });
    emit({ type: 'event2', payload: { foo: 2 } });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'event1', payload: { foo: 1 } }),
    );

    unsubscribe(id);
  });

  it('should call callback immediately if immediate option is set', () => {
    const { emit, subscribe, unsubscribe } = useEvent();
    const callback = vi.fn();
    const filter = (event: any) => event.type === 'event1';

    emit({ type: 'event1', payload: { foo: 1 } });

    const id = subscribe(filter, callback, { immediate: true });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'event1', payload: { foo: 1 } }),
    );

    unsubscribe(id);
  });

  it('should unsubscribe a subscriber by id', () => {
    const { subscribe, emit, unsubscribe } = useEvent();
    const callback = vi.fn();
    const filter = () => true;

    const id = subscribe(filter, callback);
    emit({ type: 'event1', payload: {} });
    expect(callback).toHaveBeenCalledTimes(1);

    unsubscribe(id);
    emit({ type: 'event2', payload: {} });
    expect(callback).toHaveBeenCalledTimes(1); // No further calls after unsubscribe
  });

  it('should throw if unsubscribing a non-existent subscriber', () => {
    const { unsubscribe } = useEvent();
    expect(() => unsubscribe('non-existent-id')).toThrow('The given subscriber does not exist');
  });

  it('should reset the log to an empty array', () => {
    const { emit, log, reset } = useEvent();
    const event1 = { type: 'event1', payload: { key: 'value1' } };
    const event2 = { type: 'event2', payload: { key: 'value2' } };

    emit(event1, event2);

    expect(log.value).toHaveLength(2);

    reset();
    expect(log.value).toEqual([]);
  });
});
