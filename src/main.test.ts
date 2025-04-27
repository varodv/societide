import { name } from './main';

describe('main', () => {
  it('name is exported', () => {
    expect(name).toEqual('template-ts');
  });
});
