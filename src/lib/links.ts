export function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

export function isBannerLink(value: string) {
  return value.startsWith("#") || value.startsWith("/") || isHttpUrl(value);
}
