export const parseFilterParams = (query) => {
    const { type, isFavourite } = query;

    const filters = {};

    if (type) {
        filters.contactType = type;
    }

    if (isFavourite !== undefined) {
        filters.isFavourite = isFavourite === 'true';
    }

    return filters;
};