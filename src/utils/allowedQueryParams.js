export const validateAllowedQueryParams = (req, allowedParams) => {
    const queryKeys = Object.keys(req.query);
    const invalidParams = queryKeys.filter((key) => !allowedParams.includes(key));
    if (invalidParams.length > 0) {
        return invalidParams;
    }
    return undefined;
};
