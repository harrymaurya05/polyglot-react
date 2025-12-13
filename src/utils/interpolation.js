/**
 * Interpolate variables in translation string
 * Example: "Hello {{name}}" with { name: "John" } => "Hello John"
 */
export function interpolate(text, params) {
    if (!params)
        return text;
    let result = text;
    // Replace all {{variable}} patterns
    for (const [key, value] of Object.entries(params)) {
        if (key === "plural" || key === "count")
            continue;
        const placeholder = `{{${key}}}`;
        const replacement = String(value);
        result = result.replace(new RegExp(placeholder, "g"), replacement);
    }
    return result;
}
/**
 * Apply pluralization rules
 * Example: "{{count}} item" with { count: 5, plural: true } => "5 items"
 */
export function pluralize(text, params) {
    if (!params || !params.plural || typeof params.count !== "number") {
        return text;
    }
    const count = params.count;
    // Simple English pluralization rules
    // For production, consider using a library like 'pluralize' or Intl.PluralRules
    if (count === 1) {
        return text; // Singular form
    }
    // Apply basic pluralization
    // This is a simplified version; real-world needs proper i18n plural rules
    const words = text.split(" ");
    const pluralized = words.map((word) => {
        // Skip placeholders
        if (word.startsWith("{{") && word.endsWith("}}")) {
            return word;
        }
        // Common irregular plurals
        const irregulars = {
            child: "children",
            person: "people",
            man: "men",
            woman: "women",
            tooth: "teeth",
            foot: "feet",
            mouse: "mice",
            goose: "geese",
        };
        const lowerWord = word.toLowerCase();
        if (irregulars[lowerWord]) {
            return irregulars[lowerWord];
        }
        // Regular pluralization rules
        if (word.match(/[sxz]$/i) || word.match(/[cs]h$/i)) {
            return word + "es"; // box -> boxes, church -> churches
        }
        else if (word.match(/[^aeiou]y$/i)) {
            return word.slice(0, -1) + "ies"; // city -> cities
        }
        else if (word.match(/[aeiou]y$/i)) {
            return word + "s"; // boy -> boys
        }
        else if (word.match(/[^f]fe?$/i)) {
            return word.replace(/fe?$/, "ves"); // knife -> knives
        }
        else if (word.match(/[aeiou][^aeiou]$/i)) {
            return word + "s"; // cat -> cats
        }
        else {
            return word + "s"; // Default: add 's'
        }
    });
    return pluralized.join(" ");
}
/**
 * Main translation processing function
 * Combines interpolation and pluralization
 */
export function processTranslation(text, params) {
    let result = text;
    // Apply pluralization first
    if (params?.plural) {
        result = pluralize(result, params);
    }
    // Then apply variable interpolation
    result = interpolate(result, params);
    return result;
}
