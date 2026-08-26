/**
 * Timezone utilities for HKT (Hong Kong Time) handling
 *
 * HKT is UTC+8 (no DST)
 */

/**
 * Convert any date to HKT start of day (00:00:00.000)
 * This ensures scheduler running at 00:00 HKT will match the exercise
 *
 * @param date - The input date (can be any timezone)
 * @returns Date object set to 00:00:00.000 HKT of the same calendar day
 */
export function convertToHKTStartOfDay(date: Date): Date {
    // Create a new date to avoid mutating the input
    const hktDate = new Date(date);

    // Get the date components in HKT timezone
    const hktString = hktDate.toLocaleString("en-US", {
        timeZone: "Asia/Hong_Kong",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });

    // Parse the HKT string to get the date components
    const [datePart] = hktString.split(", ");
    const [month, day, year] = datePart.split("/");

    // Create a date string for 00:00:00.000 in HKT
    const startOfDayHKT = new Date(`${year}-${month}-${day}T00:00:00.000+08:00`);

    return startOfDayHKT;
}

/**
 * Convert any date to HKT end of day (23:59:59.999)
 * This ensures scheduler running at 23:59 HKT will match the exercise
 *
 * @param date - The input date (can be any timezone)
 * @returns Date object set to 23:59:59.999 HKT of the same calendar day
 */
export function convertToHKTEndOfDay(date: Date): Date {
    // Create a new date to avoid mutating the input
    const hktDate = new Date(date);

    // Get the date components in HKT timezone
    const hktString = hktDate.toLocaleString("en-US", {
        timeZone: "Asia/Hong_Kong",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });

    // Parse the HKT string to get the date components
    const [datePart] = hktString.split(", ");
    const [month, day, year] = datePart.split("/");

    // Create a date string for 23:59:59.999 in HKT
    const endOfDayHKT = new Date(`${year}-${month}-${day}T23:59:59.999+08:00`);

    return endOfDayHKT;
}

/**
 * Get the start (00:00:00.000) and end (23:59:59.999) of today in HKT
 *
 * @returns Object with startOfDay and endOfDay as Date objects in HKT
 */
export function getHKTStartAndEndOfDay(): { startOfDay: Date; endOfDay: Date } {
    const now = new Date();

    // Get current date in HKT
    const hktString = now.toLocaleString("en-US", {
        timeZone: "Asia/Hong_Kong",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour12: false,
    });

    // Parse to get date components
    const [datePart] = hktString.split(", ");
    const [month, day, year] = datePart.split("/");

    // Create start and end of day in HKT
    const startOfDay = new Date(`${year}-${month}-${day}T00:00:00.000+08:00`);
    const endOfDay = new Date(`${year}-${month}-${day}T23:59:59.999+08:00`);

    return { startOfDay, endOfDay };
}

/**
 * Get the end of Sunday (23:59:59.999 HKT) for the current week
 * If today is Sunday, returns end of today; otherwise returns end of upcoming Sunday
 *
 * @param referenceDate - The reference date to calculate from (defaults to today)
 * @returns Date object set to 23:59:59.999 HKT on Sunday of the current week
 */
export function getSundayEndOfWeek(referenceDate?: Date): Date {
    const date = referenceDate || new Date();
    
    // Get the day of week in HKT timezone (not UTC)
    const hktString = date.toLocaleString("en-US", {
        timeZone: "Asia/Hong_Kong",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
    
    // Parse to get date components in HKT
    const [datePart, timePart] = hktString.split(", ");
    const [month, day, year] = datePart.split("/");
    
    // Create a date object for this day in HKT to get correct day of week
    const hktDate = new Date(`${year}-${month}-${day}T12:00:00.000+08:00`);
    const dayOfWeek = hktDate.getUTCDay(); // Now this will be correct since we normalized to HKT
    
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    
    // Calculate Sunday's date in HKT
    const sundayDate = new Date(hktDate.getTime() + daysUntilSunday * 24 * 60 * 60 * 1000);
    
    // Get Sunday's date components
    const sundayString = sundayDate.toLocaleString("en-US", {
        timeZone: "Asia/Hong_Kong",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour12: false,
    });
    const [sundayDatePart] = sundayString.split(", ");
    const [sundayMonth, sundayDay, sundayYear] = sundayDatePart.split("/");
    
    // Create end of Sunday in HKT (23:59:59.999), then convert to UTC
    // HKT 23:59:59.999 = UTC 15:59:59.999 (HKT is UTC+8)
    const sundayEndOfDay = new Date(`${sundayYear}-${sundayMonth}-${sundayDay}T15:59:59.999Z`);
    
    return sundayEndOfDay;
}

/**
 * Get the current date/time in HKT
 *
 * @returns Date object representing current time in HKT
 */
export function getCurrentHKT(): Date {
    return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Hong_Kong" }));
}

/**
 * Format a date to HKT string for logging
 *
 * @param date - The date to format
 * @returns Formatted string in HKT
 */
export function formatHKT(date: Date): string {
    return date.toLocaleString("en-US", {
        timeZone: "Asia/Hong_Kong",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
}
