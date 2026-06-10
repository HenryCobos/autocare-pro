/**
 * Constantes de monedas para AutoCare Pro
 */

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  locale: string;
}

// Monedas de Latinoamérica
export const LATIN_AMERICA_CURRENCIES: Currency[] = [
  { code: 'MXN', name: 'Peso Mexicano', symbol: '$', locale: 'es-MX' },
  { code: 'ARS', name: 'Peso Argentino', symbol: '$', locale: 'es-AR' },
  { code: 'CLP', name: 'Peso Chileno', symbol: '$', locale: 'es-CL' },
  { code: 'COP', name: 'Peso Colombiano', symbol: '$', locale: 'es-CO' },
  { code: 'PEN', name: 'Sol Peruano', symbol: 'S/', locale: 'es-PE' },
  { code: 'BRL', name: 'Real Brasileño', symbol: 'R$', locale: 'pt-BR' },
  { code: 'VES', name: 'Bolívar Soberano', symbol: 'Bs.', locale: 'es-VE' },
  { code: 'UYU', name: 'Peso Uruguayo', symbol: '$U', locale: 'es-UY' },
  { code: 'PYG', name: 'Guaraní Paraguayo', symbol: '₲', locale: 'es-PY' },
  { code: 'BOB', name: 'Boliviano', symbol: 'Bs.', locale: 'es-BO' },
  { code: 'GTQ', name: 'Quetzal Guatemalteco', symbol: 'Q', locale: 'es-GT' },
  { code: 'HNL', name: 'Lempira Hondureño', symbol: 'L', locale: 'es-HN' },
  { code: 'NIO', name: 'Córdoba Nicaragüense', symbol: 'C$', locale: 'es-NI' },
  { code: 'CRC', name: 'Colón Costarricense', symbol: '₡', locale: 'es-CR' },
  { code: 'PAB', name: 'Balboa Panameño', symbol: 'B/.', locale: 'es-PA' },
  { code: 'DOP', name: 'Peso Dominicano', symbol: 'RD$', locale: 'es-DO' },
  { code: 'HTG', name: 'Gourde Haitiano', symbol: 'G', locale: 'fr-HT' },
  { code: 'JMD', name: 'Dólar Jamaiquino', symbol: 'J$', locale: 'en-JM' },
];

// Monedas de América del Centro/Norte
export const CENTRAL_NORTH_AMERICA_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'Dólar Estadounidense', symbol: '$', locale: 'en-US' },
  { code: 'CAD', name: 'Dólar Canadiense', symbol: 'C$', locale: 'en-CA' },
];

// Monedas de Europa
export const EUROPE_CURRENCIES: Currency[] = [
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'es-ES' },
  { code: 'GBP', name: 'Libra Esterlina', symbol: '£', locale: 'en-GB' },
  { code: 'CHF', name: 'Franco Suizo', symbol: 'CHF', locale: 'de-CH' },
  { code: 'SEK', name: 'Corona Sueca', symbol: 'kr', locale: 'sv-SE' },
  { code: 'NOK', name: 'Corona Noruega', symbol: 'kr', locale: 'no-NO' },
  { code: 'DKK', name: 'Corona Danesa', symbol: 'kr', locale: 'da-DK' },
  { code: 'PLN', name: 'Złoty Polaco', symbol: 'zł', locale: 'pl-PL' },
  { code: 'CZK', name: 'Corona Checa', symbol: 'Kč', locale: 'cs-CZ' },
  { code: 'HUF', name: 'Forint Húngaro', symbol: 'Ft', locale: 'hu-HU' },
  { code: 'RON', name: 'Leu Rumano', symbol: 'lei', locale: 'ro-RO' },
  { code: 'BGN', name: 'Lev Búlgaro', symbol: 'лв', locale: 'bg-BG' },
];

// Todas las monedas combinadas
export const ALL_CURRENCIES: Currency[] = [
  ...LATIN_AMERICA_CURRENCIES,
  ...CENTRAL_NORTH_AMERICA_CURRENCIES,
  ...EUROPE_CURRENCIES,
];

// Moneda por defecto
export const DEFAULT_CURRENCY = 'MXN';

// Obtener información de una moneda por código
export const getCurrencyByCode = (code: string): Currency | undefined => {
  return ALL_CURRENCIES.find(currency => currency.code === code);
};

// Obtener símbolo de moneda
export const getCurrencySymbol = (code: string): string => {
  const currency = getCurrencyByCode(code);
  return currency?.symbol || '$';
};

