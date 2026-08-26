import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek";

// Extend dayjs with plugins for better week handling
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

/**
 * Returns the exercise category for a given date based on a weekly alternating pattern
 * Starting from 2025/09/29 (Monday - Week 1):
 * Week 1: Mon/Wed/Fri = Grammar, Tue/Thu = Reading, Sat = Listening, Sun = null
 * Week 2: Mon/Wed/Fri = Reading, Tue/Thu = Grammar, Sat = Listening, Sun = null
 * Pattern repeats every 2 weeks
 */
export function getExerciseCategory(date: Date | string): "grammar" | "reading" | "listening" | null {
    const day = dayjs(date);
    const dayOfWeek = day.day(); // 0=Sun, 1=Mon, 2=Tue, ..., 6=Sat

    if (dayOfWeek === 0) return null;

    if (dayOfWeek === 6) return "listening";

    // Start date: 2025/09/29 (Monday - Week 1)
    const startDate = dayjs("2025-09-29");

    // Calculate weeks difference using ISO week (Monday as start of week)
    const currentWeekStart = day.startOf("isoWeek"); // Monday of current week
    const startWeekStart = startDate.startOf("isoWeek"); // Monday of start week

    const weeksDiff = currentWeekStart.diff(startWeekStart, "week");

    const isWeek1Pattern = weeksDiff % 2 === 0;

    if ([1, 3, 5].includes(dayOfWeek)) {
        // Mon, Wed, Fri
        return isWeek1Pattern ? "grammar" : "reading";
    } else {
        // Tue, Thu (dayOfWeek 2, 4)
        return isWeek1Pattern ? "reading" : "grammar";
    }
}


export function getWeekSchedule(date: Date | string): Record<string, string | null> {
    const startOfWeek = dayjs(date).startOf("isoWeek"); // Monday
    const schedule: Record<string, string | null> = {};

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    for (let i = 0; i < 7; i++) {
        const currentDay = startOfWeek.add(i, "day");
        schedule[dayNames[i]] = getExerciseCategory(currentDay.toDate());
    }

    return schedule;
}

export function getRelativeWeekNumber(date: Date | string): number {
    const day = dayjs(date);
    const startDate = dayjs("2025-09-29");

    const currentWeekStart = day.startOf("isoWeek");
    const startWeekStart = startDate.startOf("isoWeek");

    return currentWeekStart.diff(startWeekStart, "week") + 1;
}

export function getCurrentWeekSchedule(): Record<string, string | null> {
    return getWeekSchedule(new Date());
}
