export function exploitPatch(raw) {
    if (Array.isArray(raw))
        return raw.map(s=>exploitPatch(s));

    if (typeof raw !== 'string')
        return raw;

    return raw
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
