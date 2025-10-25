import { test, describe } from 'vitest';
import { renderApp } from '../../test/vueHelpers';

describe('Home page', () => {
    test('The logged in home page loads', async () => {
        const screen = await renderApp();

        await screen.findAllByText('Test workout session');
        await screen.findAllByText('4 Dec 2020');
    });
});
