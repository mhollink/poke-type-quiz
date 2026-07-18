
function assertNever(value: never): never {
    throw new Error(`Unsupported state: ${String(value)}`);
}