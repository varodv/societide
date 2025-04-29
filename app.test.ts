import { mountSuspended } from '@nuxt/test-utils/runtime';
import App from './app.vue';

describe('App', () => {
  it('can be mounted', async () => {
    const component = await mountSuspended(App);
    expect(component.html()).toMatchInlineSnapshot(`
      "<div>
        <h1>varodv/societide</h1>
      </div>"
    `);
  });
});
