export const escapeRegex = (text: string) => {
	const sanitizedText = text.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
	return new RegExp(sanitizedText, "i");
};
