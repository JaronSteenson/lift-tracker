
import {
    differenceInSeconds,
    differenceInMinutes,
    isYesterday,
    isToday,
    isThisYear,
    format,
} from 'date-fns'

export default {
    minsSecDuration,
    timeDescription: dateTimeDescription,
}

export function minsSecDuration(valueInSeconds) {
    if (!valueInSeconds) {
        return 'None';
    }

    const minutes = Math.floor(valueInSeconds / 60);
    let seconds = Math.round(valueInSeconds - minutes * 60);

    if (minutes === 0) {
        return `${seconds}s`;
    }

    return `${minutes}m ${seconds}s`;
}

export function hoursMinutesFromStartEnd(start, end) {
    const seconds = differenceInSeconds(new Date(end), new Date(start));

    return hoursMinutesDuration(seconds);
}

export function hoursMinutesDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds / 60) - (hours * 60));

    if (hours === 0) {
        return `${minutes}m`;
    }

    return `${hours}h ${minutes}m`;
}

export function dateTimeDescription(utcDate) {
    const resent = resentDescription(utcDate);

    if (resent) {
        return resent;
    }

    return `${dateDescription(utcDate)}, ${timeDescription(utcDate)}`;
}

export function timeDescription(utcDate, noRecent) {
    const date = new Date(utcDate);

    if (!noRecent) {
        const resent = resentDescription(date);

        if (resent) {
            return resent;
        }
    }

    return format(date, 'p');
}

export function dateDescription(utcDate) {
    const date = new Date(utcDate);
    const resent = resentDescription(date);

    if (resent) {
        return resent;
    }

    if (isToday(date)) {
        return 'Today';
    }

    if (isYesterday(date)) {
        return 'Yesterday';
    }

    if (isThisYear(date)) {
        return format(date, 'd MMM');
    }

    return format(date, 'd MMM u');
}

function resentDescription(utcDate) {
    const date = new Date(utcDate);
    const now = new Date();

    const secondsAgo = differenceInSeconds(now, date);
    if (secondsAgo < 10) {
        return 'A few seconds ago'
    }

    if (secondsAgo < 60) {
        return `${secondsAgo} seconds ago`;
    }

    const minutesAgo = differenceInMinutes(now, date);
    if (minutesAgo < 60) {
        return `${minutesAgo} minutes ago`;
    }

    return null;
}
