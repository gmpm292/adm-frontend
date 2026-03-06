/**
 * deepClean
 * -------------------------------------------------------------
 * Limpia recursivamente un objeto eliminando:
 *  - propiedades con valor `null`
 *  - propiedades que terminan siendo `undefined`
 *
 * Convierte todos los `null` en `undefined` y luego
 * elimina esas propiedades del objeto final.
 *
 * ¿Por qué es importante?
 * -------------------------------------------------------------
 * En GraphQL (y especialmente con class-validator en el backend),
 * existe una diferencia CRÍTICA entre:
 *
 *   - propiedad NO enviada        -> undefined
 *   - propiedad enviada como null -> null
 *
 * Mandar `null` puede provocar:
 *  - Validaciones incorrectas
 *  - Que class-validator crea que un campo "existe"
 *  - Errores en validadores condicionales o exclusivos
 *
 * Esta función garantiza que:
 *  - O mandas un valor válido
 *  - O NO mandas la propiedad
 *
 * Nunca manda `null`.
 *
 * -------------------------------------------------------------
 * CASOS DE USO RECOMENDADOS
 * -------------------------------------------------------------
 * ✔ Antes de ejecutar mutaciones GraphQL de tipo CREATE
 * ✔ Cuando hay campos mutuamente excluyentes (ej: amount / percentage)
 * ✔ Cuando usas ValidateIf, @IsOptional o validadores custom
 * ✔ Para inputs anidados y arrays complejos
 *
 * Ejemplo de uso:
 *
 *   const input = deepClean(createPaymentRuleInput);
 *   await createPaymentRule({ variables: { createPaymentRuleInput: input } });
 *
 * -------------------------------------------------------------
 * CASOS DONDE NO USARLA (o usar una variante)
 * -------------------------------------------------------------
 * ❌ Mutaciones UPDATE donde `null` significa "borrar un valor"
 * ❌ Cuando el backend espera explícitamente `null`
 *
 * En esos casos, crea una versión específica:
 *   - deepCleanCreate()
 *   - deepCleanUpdate()
 *
 * -------------------------------------------------------------
 * COMPORTAMIENTO
 * -------------------------------------------------------------
 * - Objetos: limpia todas sus propiedades recursivamente
 * - Arrays: limpia cada elemento y elimina los undefined
 * - Valores primitivos:
 *     - null      -> undefined
 *     - undefined -> undefined
 *     - otros     -> se devuelven tal cual
 */

export const deepClean = (value) => {
  // Si el valor es un array:
  // - Se limpia cada elemento recursivamente
  // - Se eliminan los elementos undefined del array
  if (Array.isArray(value)) {
    return value
      .map(deepClean)
      .filter((v) => v !== undefined);
  }

  // Si el valor es un objeto (y no null):
  // - Se recorren todas sus propiedades
  // - Se limpian recursivamente
  // - Solo se conservan las propiedades que NO sean undefined
  if (value !== null && typeof value === "object") {
    return Object.entries(value).reduce((acc, [key, val]) => {
      const cleaned = deepClean(val);

      // Solo se agrega la propiedad si sigue teniendo valor
      if (cleaned !== undefined) {
        acc[key] = cleaned;
      }

      return acc;
    }, {});
  }

  // Caso base:
  // - null se transforma en undefined
  // - cualquier otro valor se devuelve sin cambios
  return value === null ? undefined : value;
};
