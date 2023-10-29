const getTotalPages = async ({ city, category, page }) => {
    const url = _getSearchApiUrl({ city, category, page });
    const response = await fetch(url);
    const { page_count } = await response.json();
    return page_count;
};

const _getSearchApiUrl = ({ city, category, page }) => {
    const searchBaseUrl = "https://search.raah.ir/v4/placeslist/cat";
    const url = new URL(searchBaseUrl);
    url.searchParams.append("region", `city-${city}`);
    url.searchParams.append("name", category);
    if (page) url.searchParams.append("page", page);
    url.searchParams.append("f_phone", "61");
    url.searchParams.append("has_filter", true);
    return url;
};

const getItems = async (ids) => {
    const param = ids.join("%2C");
    const url = `https://poi.raah.ir/web/v4/preview-bulk/${param}`;
    const options = {
        times: 3,
        initialDelay: 100,
        onRetry: (error) => console.log(`Retrying... ${error.message}`),
    };

    const response = await fetch(url);
    return (await response.json()).items;
};

const getPageItemIds = async ({ city, category, page }) => {
    const url = _getSearchApiUrl({ city, category, page });


    const response = await fetch(url);
    const { items } = await response.json();
    return items;
};

const getCityName = (searchUrl) => {
    const url = new URL(searchUrl);
    const cityRegex = /(?<=\/city-)(.*?)(?=\/cat)/g;
    const cityName = url.pathname.match(cityRegex)[0];
    return cityName;
};

const getCategory = (searchUrl) => {
    const categoryRegex = /(?<=cat-)(.*?)(?=[^a-zA-Z0-9-\-]|$)/g;
    const category = searchUrl.match(categoryRegex)[0];
    return category;
};

const getCities = async () => {
    const homedata = await (
        await fetch("https://search.raah.ir/v1/web/homepage/")
    ).json();
    return homedata.widgets
        .find((w) => w.type === "stacked-list")
        .data.items.map((city) => ({
            label: city.text,
            city: city.link.params.city,
        }));
};

const getCategoryGroups = async () => {
    const categories = await _getCategories();
    return categories.map(({ slug, title }) => ({ slug, title }));
};

const _getCategories = async () => {
    const { results } = await (
        await fetch("https://search.raah.ir/v6/bundle-list/full/")
    ).json();
    return results;
};

const getCategoryGroupBySlug = async (slug) => {
    const categories = await _getCategories();
    return categories.find((categoryGroup) => categoryGroup.slug === slug)
        .categories;
}

module.exports = {
    getTotalPages,
    getPageItemIds,
    getCityName,
    getItems,
    getCategory,
    getCities,
    getCategoryGroups,
    getCategoryGroupBySlug,
};
