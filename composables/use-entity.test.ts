import { useEntity } from './use-entity';

describe('useEntity', () => {
  const { create } = useEntity();

  it('should create an entity with a unique id', () => {
    const payload = { name: 'Test Entity' };
    const entity = create(payload);

    expect(entity).toHaveProperty('id');
    expect(typeof entity.id).toBe('string');
    expect(entity.name).toBe('Test Entity');
  });

  it('should throw an error if the payload already contains an id', () => {
    const payload = { id: '123', name: 'Test Entity' };

    expect(() => create(payload)).toThrowError(
      'The given payload already has a property \'id\'',
    );
  });
});
