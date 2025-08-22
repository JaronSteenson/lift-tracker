import { createVuetify as _createVuetify } from 'vuetify';
import 'vuetify/styles';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import svgIcons from './svgIcons';
import { getInitialVuetifyOptions } from './themes';

export function createVuetify() {
    return _createVuetify({
        components,
        directives,
        icons: {
            defaultSet: 'mdi',
            aliases: {
                ...aliases,
                ...svgIcons,
            },
            sets: {
                mdi,
            },
        },
        theme: {
            options: {
                customProperties: true,
            },
            ...getInitialVuetifyOptions(),
        },
    });
}

// Make svg icons available globally for components that need them
export { svgIcons };
