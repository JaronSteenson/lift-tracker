
export default {
    minsSecDuration(valueInSeconds) {
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
}
