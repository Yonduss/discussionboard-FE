const DISPLAY_LOCALE = "en-US";

const postDateTimeFormatter = new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
});

const monthDayFormatter = new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    month: "short",
    day: "numeric",
    timeZone: "UTC"
});

const gameTimeFormatter = new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
});

const gameDateTimeFormatter = new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
});

function formatDateValue(value, formatter) {
    const normalizedValue = typeof value === "string"
        && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(value)
        ? `${value}Z`
        : value;
    const date = normalizedValue instanceof Date
        ? normalizedValue
        : new Date(normalizedValue);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return formatter.format(date);
}

export function formatPostDateTime(value) {
    return formatDateValue(value, postDateTimeFormatter);
}

export function formatShortMonthDay(value) {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return formatDateValue(`${value}T00:00:00Z`, monthDayFormatter);
    }

    return formatDateValue(value, monthDayFormatter);
}

export function formatGameTime(value) {
    return formatDateValue(value, gameTimeFormatter);
}

export function formatGameDateTime(value) {
    return formatDateValue(value, gameDateTimeFormatter);
}
