export function exploitPatch(raw) {
    if (Array.isArray(raw))
        return raw.map(s=>exploitPatch(s));
    return raw;
}