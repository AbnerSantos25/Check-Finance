/// <reference types="vite/client" />

/**
 * Ano em que o bundle foi gerado, injetado pelo `define` do vite.config.ts.
 *
 * Existe porque `new Date().getFullYear()` durante a renderização produz um valor
 * na pré-renderização e outro na hidratação sempre que o ano vira entre um build e
 * uma visita — o React acusaria descasamento. Uma constante de build é igual nos
 * dois momentos.
 */
declare const __BUILD_YEAR__: number;
