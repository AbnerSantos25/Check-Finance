/**
 * Converte os campos de uma calculadora em query string e de volta, para o link
 * de uma simulação levar os valores que a pessoa preencheu.
 *
 * Cada ferramenta declara um esquema com chaves curtas em português (`?ap=1500&anos=20`).
 * Só entram na URL os campos diferentes do padrão: quem não mexeu em nada continua
 * com o endereço limpo, e o link compartilhado fica curto.
 *
 * A leitura não confia na URL: devolve só o que reconhece e consegue converter, e
 * quem chama passa o resultado pelo `sanitizeParams` da ferramenta.
 */

export type ShareField =
  | { key: string; type: 'number' }
  | { key: string; type: 'boolean' }
  | { key: string; type: 'enum'; values: readonly string[] };

export type ShareSchema<T> = { [K in keyof T]?: ShareField };

const serialize = (field: ShareField, value: unknown): string | null => {
  if (field.type === 'number') return typeof value === 'number' && Number.isFinite(value) ? String(value) : null;
  if (field.type === 'boolean') return typeof value === 'boolean' ? (value ? '1' : '0') : null;
  return typeof value === 'string' && field.values.includes(value) ? value : null;
};

const parse = (field: ShareField, raw: string): unknown => {
  const text = raw.trim();
  if (field.type === 'number') {
    // Aceita "1.250,50" e "1250.5": quem edita o link à mão escreve no formato brasileiro.
    const normalized = /,/.test(text) ? text.replace(/\./g, '').replace(',', '.') : text;
    const value = normalized === '' ? NaN : Number(normalized);
    return Number.isFinite(value) ? value : undefined;
  }
  if (field.type === 'boolean') {
    if (text === '1' || text === 'true') return true;
    if (text === '0' || text === 'false') return false;
    return undefined;
  }
  return field.values.includes(text) ? text : undefined;
};

/** Query string (sem o `?`) com os campos que diferem do padrão. */
export function encodeParams<T extends object>(params: T, defaults: T, schema: ShareSchema<T>): string {
  const query = new URLSearchParams();
  for (const name of Object.keys(schema) as (keyof T)[]) {
    const field = schema[name];
    if (!field || Object.is(params[name], defaults[name])) continue;
    const text = serialize(field, params[name]);
    if (text !== null) query.set(field.key, text);
  }
  return query.toString();
}

/** Campos reconhecidos na query string. O que não converte é ignorado, não zerado. */
export function decodeParams<T extends object>(search: string, schema: ShareSchema<T>): Partial<T> {
  const query = new URLSearchParams(search);
  const result: Partial<T> = {};
  for (const name of Object.keys(schema) as (keyof T)[]) {
    const field = schema[name];
    const raw = field ? query.get(field.key) : null;
    if (!field || raw === null) continue;
    const value = parse(field, raw);
    if (value !== undefined) result[name] = value as T[keyof T];
  }
  return result;
}
