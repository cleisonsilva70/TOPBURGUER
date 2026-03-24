const dataImagePattern = /^data:image\/[a-zA-Z0-9.+-]+;base64,/;

export function isImageReference(value: string) {
  return /^https?:\/\//.test(value) || value.startsWith("/") || dataImagePattern.test(value);
}

export function isInlineImage(value: string) {
  return dataImagePattern.test(value);
}
