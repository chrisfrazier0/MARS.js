export function make_regexp(str, fl) {
    return new RegExp(str.replace(/\s/g, ''), fl)
}

export function mod(n, m) {
    return ((n % m) + m) % m
}
