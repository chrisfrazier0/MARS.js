export function make_regexp(str, fl) {
    return new RegExp(str.replace(/\s/g, ''), fl)
}
