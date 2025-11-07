export enum FormatNumberType {
  Currency = 'currency',
  DigitSpaces = 'digitSpaces',
}

type FormatNumberValue = string | number | bigint | null | undefined;
type ValidNumberValue = number | bigint | `${number}`;

type FormatNumberConfig = {
  type?: FormatNumberType;
  /**
    Можно передать navigator.language для автоматического определения
   */
  language?: string;
  precision?: number;
  // в частности чтобы, например, для -0.12 не получать -0
  softPrecision?: number;
  minPrecision?: number;
  maxPrecision?: number;
  unit?: string | false | null;
};

export function formatNumber(
  value: FormatNumberValue,
  { type, unit, language = 'ru', ...rest }: FormatNumberConfig = {},
): string {
  if (value === undefined || value === null) {
    return '–';
  }

  const numberValue = Number(value);

  if (!isFinite(numberValue)) {
    return '–';
  }

  const { precision, softPrecision, minPrecision = 0, maxPrecision = 2 } = rest;

  const innerSoftPrecision = numberValue < 1 && numberValue > -1 ? softPrecision : null;

  let formattedValue = new Intl.NumberFormat(language, {
    minimumFractionDigits: precision ?? innerSoftPrecision ?? minPrecision,
    maximumFractionDigits: precision ?? innerSoftPrecision ?? maxPrecision,
  }).format(value as ValidNumberValue);

  if (type === FormatNumberType.Currency) {
    formattedValue = `${formattedValue} ₽`;
  }

  return unit ? `${formattedValue} ${unit}` : formattedValue;
}

formatNumber.types = FormatNumberType;
