vi.mock('./use-entity', () => ({
  useEntity: vi.fn(),
}));

vi.mock(import('@vueuse/core'), async importOriginal => ({
  ...await importOriginal(),
  useLocalStorage: vi.fn(),
}));

describe('useEvent', () => {
  let createMock: ReturnType<typeof vi.fn>;
  let storageMock: { value: any };

  beforeEach(() => {
    createMock = vi.fn(event => ({ ...event, id: 'unique-id' }));
    (useEntity as any).mockReturnValue({ create: createMock });

    storageMock = { value: [] };
    (useLocalStorage as any).mockReturnValue(storageMock);
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
      { type: 'event1', payload: { key: 'value1' }, timestamp: '2023-01-01T00:00:00.000Z' },
    ]);

    const deserializedData = [
      { type: 'event1', payload: { key: 'value1' }, timestamp: new Date('2023-01-01T00:00:00.000Z') },
    ];

    const serializer = (useLocalStorage as any).mock.calls[0][2].serializer;

    expect(serializer.read(serializedData)).toEqual(deserializedData);
    expect(serializer.write(deserializedData)).toEqual(serializedData);
  });
});
