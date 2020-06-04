
import { differenceInSeconds, differenceInMinutes, isYesterday, isToday, isThisYear, format } from 'date-fns'

export default {
    minsSecDuration,
    editedTimeDescription,
}

export function minsSecDuration(valueInSeconds) {
    if (!valueInSeconds) {
        return 'None';
    }

    const minutes = Math.floor(valueInSeconds / 60);
    let seconds = valueInSeconds - minutes * 60;

    if (seconds < 10) {
        seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`
}
export function editedTimeDescription(utcDate) {
    const now = new Date();
    const date = new Date(utcDate);

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

    if (isToday(date)) {
        return format(date, 'today, p');
    }

    if (isYesterday(date)) {
        return format(date, 'yesterday, p');
    }

    if (isThisYear(date)) {
        return format(date, 'd MMM, p');
    }

    return format(date, 'd MMM u, p');
}
