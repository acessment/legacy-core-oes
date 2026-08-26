/**
 * Format date by object
 * @param date
 * @param format
 * @returns string
 *
 * This function formats the date by object
 *
 *
 * The formatDateByObject function takes two parameters, date and format.
 *
 *
 * The map object contains the keys mm, dd, yyyy, hh, and ss.
 *
 *
 * The map object values are the month, date, year, hour, and second of the date object.
 *
 *
 * The formatDateByObject function returns the formatted date string by replacing the matched string with the map object value.
 *
 *
 */

function formatDateByObject(date: Date, format: string): string {
    const map: any = {
        mm: (date.getMonth() + 1).toString().padStart(2, "0"),
        dd: date.getDate().toString().padStart(2, "0"),
        yyyy: date.getFullYear().toString(),
        hh: date.getHours().toString().padStart(2, "0"),
        ss: date.getSeconds().toString().padStart(2, "0"),
    };

    return format.replace(/mm|dd|yyyy|hh|ss/gi, (matched) => map[matched]);
}

export { formatDateByObject };

export function tidyDateRange(
    newValue: [Date | null, Date | null] | null,
    setDateValue: (value: [string | null, string | null]) => void
): void {
    // Handle null or empty values
    if (!newValue) {
        setDateValue([null, null]);
        return;
    }

    // Handle case where only start date is selected
    if (newValue[0] && !newValue[1]) {
        const startDate = new Date(newValue[0]);
        const startDateStr = startDate.toLocaleDateString("en-CA");
        const hkStartDate = new Date(`${startDateStr}T00:00:00+08:00`);
        setDateValue([hkStartDate.toISOString(), null]);
        return;
    }

    // Handle case where both dates are selected
    if (newValue[0] && newValue[1]) {
        const startDate = new Date(newValue[0]);
        const endDate = new Date(newValue[1]);
        const startDateStr = startDate.toLocaleDateString("en-CA");
        const endDateStr = endDate.toLocaleDateString("en-CA");

        const hkStartDate = new Date(`${startDateStr}T00:00:00+08:00`);
        const hkEndDate = new Date(`${endDateStr}T23:59:59.999+08:00`);

        const adjustedValue: [string, string] = [hkStartDate.toISOString(), hkEndDate.toISOString()];

        setDateValue(adjustedValue);
        console.log("HK dates converted to UTC:", adjustedValue[0], adjustedValue[1]);
    } else {
        // Handle other cases (e.g., clearing selection)
        setDateValue([null, null]);
    }
}

export function utcISOToHKDateString(isoString: string | null): string {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-GB", {
        timeZone: "Asia/Hong_Kong",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}