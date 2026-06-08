export function shortHash(value: string, head = 10, tail = 6) {
  if (!value) return "";
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

export function hexToDecimal(value: string) {
  try {
    return Number.parseInt(value, 16).toLocaleString();
  } catch {
    return value;
  }
}

export function copyText(value: string) {
  if (typeof navigator === "undefined") return Promise.resolve();
  return navigator.clipboard.writeText(value);
}
