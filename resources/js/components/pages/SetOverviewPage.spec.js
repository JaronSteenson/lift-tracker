import { test, describe } from 'vitest';
import { renderApp } from '../../test/vueHelpers';
import { fireEvent } from '@testing-library/vue';

describe('Set overview page', () => {
    test('Navigate through a session', async () => {
        const screen = await renderApp();

        await screen.findAllByText('Test workout session');
        await fireEvent.click(
            screen.getAllByTestId('startNewSessionButton')[0],
        );
        await screen.findByText('Start new session');
        screen.getByText('Test routine');

        await fireEvent.click(screen.getByText('Start now'));
        await screen.findByText('Edit check-in');
        await fireEvent.click(screen.getByText('Save'));

        await screen.findByText('Test exercise - set 1');
        await fireEvent.click(screen.getByTestId('startTimerButton'));
        await screen.findByTestId('activeTimer');
        await fireEvent.click(screen.getByTestId('stopTimerButton'));
        await fireEvent.click(await screen.findByTestId('finishWorkoutButton'));

        await screen.findByText('Session overview');
        screen.getByText('Test routine');
        screen.getByText('Test exercise');
    }, 10000);
});
