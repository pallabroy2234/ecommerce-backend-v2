export const escapeRegex = (text) => {
    const sanitizedText = text.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    return new RegExp(sanitizedText, "i");
};
