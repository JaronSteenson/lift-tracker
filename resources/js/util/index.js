/**
 * Non domain specific utility functions.
 */

import { debounce } from 'lodash'

/**
 * Per argument debouncing of a vuex action, only works with scalar action argument.
 * Is aimed for save debouncing so that we always save differing models/uuids,
 * but don't re-save the same model/uuid repeatedly in a short space of time.
 *
 * @param original
 * @param wait
 * @param options
 * @return {function(*=, *=): *}
 */
export function memoizeDebounceAction(original, wait, options) {
    let cache = {};

    return function (context, arg1) {
        if (typeof cache[arg1] !== 'function') {
            cache[arg1] = debounce(original.bind(this, context, arg1), wait, options);
        }

        return cache[arg1].call();
    }
}
