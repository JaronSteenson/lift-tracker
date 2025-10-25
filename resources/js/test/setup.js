import { beforeAll, vi } from 'vitest';
import 'web-streams-polyfill/polyfill';
import axios from 'axios';

beforeAll(() => {
    axios.defaults.headers.common.Authorization = 'Bearer fake-token';
    stubWindowProperties();
});

function stubWindowProperties() {
    global.ResizeObserver = class ResizeObserver {
        observe() {
            // do nothing
        }
        unobserve() {
            // do nothing
        }
        disconnect() {
            // do nothing
        }
    };

    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query) => ({
            matches: false, // change to true if you want it to match
            media: query,
            onchange: null,
            addListener: vi.fn(), // deprecated
            removeListener: vi.fn(), // deprecated
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }),
    });

    window.scrollTo = vi.fn();
}
