

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
    if (page)
        url.searchParams.append("page", page);
    url.searchParams.append("f_phone", "61");
    url.searchParams.append("has_filter", true);
    return url;
};

const getItems = async (ids) => {
    const param = ids.join("%2C");
    const url = `https://poi.raah.ir/web/v4/preview-bulk/${param}`;
    const response = await fetch(url);
    // console.log(response)
    return (await response.json()).items
};

const getPageItemIds = async ({ city, category, page }) => {
    const url = _getSearchApiUrl({ city, category, page });
    const response = await fetch(url);
    const { items } = await response.json();
    return items;
};

// const sleep = (ms) => {
//     return new Promise((resolve) => setTimeout(resolve, ms));
// };

const getCityName = (searchUrl) => {
    const url = new URL(searchUrl);
    const cityRegex = /(?<=\/city-)(.*?)(?=\/cat)/g;
    const cityName = url.pathname.match(cityRegex)[0];
    return cityName;
};

const getCategory = (searchUrl) => {
    const categoryRegex = /(?<=cat-)(.*?)(?=[^a-zA-Z0-9])/g;
    const category = searchUrl.match(categoryRegex)[0];
    return category;
};

module.exports = {
    getTotalPages,
    getPageItemIds,
    getCityName,
    getItems,
    getCategory,
};