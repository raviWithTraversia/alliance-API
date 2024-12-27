/**
 * Converts a time period string into a formatted string representing the total hours and minutes.
 *
 * @param timePeriod - A string representing a time period, which can include days (d), hours (h), and minutes (m).
 *                     For example, "1d2h30m" represents 1 day, 2 hours, and 30 minutes.
 * @returns A string formatted as "HH:MM", where HH is the total number of hours and MM is the number of minutes.
 *
 * @example
 * ```typescript
 * const formattedTime = convertTimePeriod("1d2h30m");
 * console.log(formattedTime); // "26:30"
 * ```
 */
export function convertTimePeriod(timePeriod: string): string {
    try {
        const daysMatch = timePeriod.match(/(\d+)d/);
        const hoursMatch = timePeriod.match(/(\d+)h/);
        const minutesMatch = timePeriod.match(/(\d+)m/);

        const days = daysMatch ? parseInt(daysMatch[1], 10) : 0;
        const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
        const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

        const totalHours = (days * 24) + hours;
        const formattedMinutes = minutes.toString().padStart(2, '0');

        return `${totalHours}:${formattedMinutes}`;
    } catch (error: any) {
        console.log({ errorConvertingTime: error });
    }
    return "";
}