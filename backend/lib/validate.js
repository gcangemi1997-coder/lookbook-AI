export function validateEvaluationJson(data) {
  if (!data || typeof data !== "object" || Array.isArray(data))
    return {
      valid: false,
      message: "La risposta non è un oggetto JSON valido",
    };

  // If the image is irrelevant
  if (
    data.error_non_clothing === true &&
    typeof data.motivation === "string" &&
    data.motivation.trim().length > 0
  )
    return { valid: true, message: "JSON valido (immagine non pertinente)" };

  if (!Number.isInteger(data.suggested_price))
    return {
      valid: false,
      message: "suggested_price deve essere un numero intero",
    };

  if (
    !data.range ||
    typeof data.range !== "object" ||
    Array.isArray(data.range)
  )
    return { valid: false, message: "range deve essere un oggetto" };

  if (!Number.isInteger(data.range.min) || !Number.isInteger(data.range.max))
    return {
      valid: false,
      message: "range.min e range.max devono essere numeri interi",
    };

  if (data.range.min > data.range.max)
    return {
      valid: false,
      message: "range.min non può essere maggiore di range.max",
    };

  if (
    data.suggested_price < data.range.min ||
    data.suggested_price > data.range.max
  )
    return {
      valid: false,
      message: "suggested_price deve essere compreso tra range.min e range.max",
    };

  if (
    typeof data.motivation !== "string" ||
    data.motivation.trim().length === 0
  )
    return {
      valid: false,
      message: "motivation deve essere una stringa non vuota",
    };

  if (!Array.isArray(data.selling_tips) || data.selling_tips.length !== 3)
    return {
      valid: false,
      message: "selling_tips deve contenere esattamente 3 elementi",
    };

  if (
    !data.selling_tips.every(
      (tip) => typeof tip === "string" && tip.trim().length > 0,
    )
  )
    return {
      valid: false,
      message:
        "Ogni elemento di selling_tips deve essere una stringa non vuota",
    };

  return { valid: true, message: "JSON valido" };
}
