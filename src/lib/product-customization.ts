import type { ProductOptionalItem, ProductSizeOption } from "./types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseMoney(value: string) {
  const normalized = value.replace(",", ".").trim();
  const numberValue = Number(normalized);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

export function parseSizeOptionsText(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index): ProductSizeOption => {
      const [label, delta = "0"] = line.split("|").map((part) => part.trim());
      return {
        id: `${slugify(label) || "size"}-${index + 1}`,
        label,
        priceDelta: parseMoney(delta),
      };
    })
    .filter((option) => option.label);
}

export function parseOptionalItemsText(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index): ProductOptionalItem => {
      const [label, price = "0"] = line.split("|").map((part) => part.trim());
      return {
        id: `${slugify(label) || "extra"}-${index + 1}`,
        label,
        price: parseMoney(price),
      };
    })
    .filter((option) => option.label);
}

export function stringifySizeOptions(options?: ProductSizeOption[] | null) {
  return (options ?? [])
    .map((option) => `${option.label}|${option.priceDelta}`)
    .join("\n");
}

export function stringifyOptionalItems(options?: ProductOptionalItem[] | null) {
  return (options ?? [])
    .map((option) => `${option.label}|${option.price}`)
    .join("\n");
}

export function buildCustomizationText(params: {
  sizeLabel?: string;
  optionalLabels?: string[];
  customerNote?: string;
}) {
  const parts = [
    params.sizeLabel ? `Tamanho: ${params.sizeLabel}` : null,
    params.optionalLabels && params.optionalLabels.length > 0
      ? `Opcionais: ${params.optionalLabels.join(", ")}`
      : null,
    params.customerNote ? `Obs.: ${params.customerNote}` : null,
  ].filter((item): item is string => Boolean(item));

  return parts.join(" | ");
}
