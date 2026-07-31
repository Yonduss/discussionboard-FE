let sequence = 0;

export function createClientId(prefix = "item") {
    sequence += 1;

    return `${prefix}-${Date.now()}-${sequence}`;
}
