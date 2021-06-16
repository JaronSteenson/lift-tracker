/*
 * Non domain specific utility functions.
 * Replacing lodash because it doesn't seem to tree shake too well,
 * and babble covers a lot of it's offerings these days (2021).
 */

/**
 * @param original {function}
 * @param wait {int} In milliseconds
 * @return {function(any): any}
 */
export function debounce(original, wait) {
    let timeout

    return function(...args) {
        clearTimeout(timeout)
        timeout = setTimeout(() => original.apply(this, args), wait)
    }
}

/**
 * Per argument debouncing of a vuex action, only works with scalar action argument.
 * Is aimed for save debouncing so that we always save differing models/uuids,
 * but don't re-save the same model/uuid repeatedly in a short space of time.
 *
 * @param original {function}
 * @param wait {int} In milliseconds
 * @return {function(any): any}
 */
export function memoizeDebounceAction(original, wait) {
    let cache = {};

    return function (vuexContext, arg1) {
        if (typeof cache[arg1] !== 'function') {
            cache[arg1] = debounce(original.bind(this, vuexContext, arg1), wait);
        }

        return cache[arg1].call();
    }
}

/**
 * @param object {object}
 * @param fields {string[]}
 */
export function pick(object, fields) {
    const out = {};

    fields.forEach(field => {
        if (object.hasOwnProperty(field)) {
            out[field] = object[field];
        }
    });

    return out;
}
