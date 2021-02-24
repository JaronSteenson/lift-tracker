
import {
    differenceInSeconds,
    differenceInHours,
    differenceInDays,
    differenceInMinutes,
    isSameDay,
    isSameYear,
    isSameWeek,
    subDays,
    subWeeks,
    format,
} from 'date-fns'

const isSameWeekOptions = { weekStartsOn: 1 }; // Monday.

export default {
    minsSecDuration,
    timeDescription: dateTimeDescription,
}

export function utcNow() {
    const date = new Date();

    let paddedMonth = date.getUTCMonth() + 1;
    if (paddedMonth < 10) {
        paddedMonth = `0${paddedMonth}`;
    }

    let paddedDay = date.getUTCDate();
    if (paddedDay < 10) {
        paddedDay = `0${paddedDay}`;
    }

    let paddedHour = date.getUTCHours();
    if (paddedHour < 10) {
        paddedHour = `0${paddedHour}`;
    }

    let paddedMinutes = date.getUTCMinutes();
    if (paddedMinutes < 10) {
        paddedMinutes = `0${paddedMinutes}`;
    }

    let paddedSeconds = date.getUTCSeconds();
    if (paddedSeconds < 10) {
        paddedSeconds = `0${paddedSeconds}`;
    }

    const utcDate = `${date.getUTCFullYear()}-${paddedMonth}-${paddedDay}`;
    const utcTime = `${paddedHour}:${paddedMinutes}:${paddedSeconds}`;


    return `${utcDate}T${utcTime}+00:00`;
}

export function minsSecDuration(valueInSeconds, noZeroTreatment, roundOffSeconds) {
    if (typeof noZeroTreatment === 'undefined' && !valueInSeconds) {
        return 'None';
    }

    const minutes = Math.floor(valueInSeconds / 60);
    const seconds = Math.round(valueInSeconds - minutes * 60);

    if (minutes === 0) {
        return `${seconds}s`;
    }

    if (roundOffSeconds) {
        return `${minutes}m`;
    }

    return `${minutes}m ${seconds}s`;
}

export function hoursMinutesSecondsFromStartEnd(start, end) {
    if (end === null) {
        end = new Date(utcNow());
    }

    const seconds = differenceInSeconds(new Date(end), new Date(start));

    return hoursMinutesSecondsDuration(seconds);
}

export function hoursMinutesSecondsDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds / 60) % 60);
    const seconds = Math.floor((totalSeconds % 60));

    if (hours === 0 && minutes === 0) {
        return `${seconds}s`;
    }

    if (hours === 0) {
        return `${minutes}m ${seconds}s`;
    }

    return `${hours}h ${minutes}m ${seconds}s`;
}

export function dateTimeDescription(utcDate, noRecent) {
    const recent = noRecent ? null : recentDescription(utcDate);

    if (recent) {
        return recent;
    }

    return `${dateDescription(utcDate)}, ${timeDescription(utcDate)}`;
}

export function timeDescription(utcDate, noRecent) {
    if (utcDate === null) {
        return 'unfinished';
    }

    const recent = noRecent ? null : recentDescription(utcDate);
    if (recent) {
        return recent;
    }

    const date = new Date(utcDate);
    return format(date, 'p');
}

export function updatedAtMicro(utcDate, now) {
    if (utcDate === null) {
        return '0s';
    }

    const date = new Date(utcDate);
    now = now ? new Date(now) : new Date();

    const hoursAgo = differenceInHours(now, date);
    const daysAgo = differenceInDays(now, date);

    if (hoursAgo >= 24) {
        return `${daysAgo}d`
    }

    if (hoursAgo >= 1) {
        return `${hoursAgo}h`
    }

    return minsSecDuration(differenceInSeconds(now, date), true, true)
}

/**
 * Get a date description ready for the ui.
 * Does not support future dates with the noRecent flag set to true.
 *
 * @param {string} utcDate
 * @param {boolean} [noRecent=false] Don't return phrases like "A moment ago"
 * @param {string|Date} [now]
 * @return {string} Formatted date amd or description
 */
export function dateDescription(utcDate, noRecent, now) {
    now = now ? new Date(now) : new Date();
    const recent = noRecent ? null : recentDescription(utcDate, now);

    if (recent) {
        return recent;
    }

    const date = new Date(utcDate);

    if (isSameDay(date, now)) {
        return 'Today';
    }

    const yesterday = subDays(now, 1);
    if (isSameDay(date, yesterday)) {
        return 'Yesterday';
    }

    if (isSameYear(date, now)) {
        return addWeekDescription(date, now);
    }

    return format(date, 'd MMM u');
}

/**
 *
 * @param {Date} date
 * @param {Date} now
 * @return {string}
 */
function addWeekDescription(date, now) {
    const dateWithoutYear = format(date, 'd MMM');
    const dayOfWeek = format(date, 'eeee');

    if (isSameWeek(now, date, isSameWeekOptions)) {
        return `${dateWithoutYear} (this ${dayOfWeek})`;
    }

    const lastWeek = subWeeks(now, 1);
    if (isSameWeek(lastWeek, date,  isSameWeekOptions)) {
        return `${dateWithoutYear} (last ${dayOfWeek})`;
    }

    return dateWithoutYear;
}

/**
 *
 * @param {string} utcDate
 * @param {Date} [now]
 * @return {string|null}
 */
function recentDescription(utcDate, now) {
    const date = new Date(utcDate);
    now = now ? new Date(now) : new Date();

    const secondsAgo = differenceInSeconds(now, date);
    if (secondsAgo <= 10) {
        return 'A moment ago';
    }

    if (secondsAgo < 60) {
        return `${secondsAgo} seconds ago`;
    }

    const minutesAgo = differenceInMinutes(now, date);

    if (minutesAgo === 1) {
        return `1 minute ago`;
    }

    if (minutesAgo < 60) {
        return `${minutesAgo} minutes ago`;
    }

    return null;
}
