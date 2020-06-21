
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

export function minsSecDuration(valueInSeconds, noZeroTreatment) {
    if (typeof noZeroTreatment === 'undefined' && !valueInSeconds) {
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
    if (end === null) {
        return `${hoursMinutesFromStartEnd(start, new Date(utcNow()))} (unfinished)`;
    }

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

export function dateTimeDescription(utcDate, noRecent) {
    const resent = resentDescription(utcDate);

    if (!noRecent) {
        if (resent) {
            return resent;
        }
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

export function dateDescription(utcDate, noRecent) {
    const date = new Date(utcDate);
    const resent = resentDescription(date);

    if (!noRecent) {
        if (resent) {
            return resent;
        }
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
