import fs from "node:fs/promises";
const getTotalPages = async () => {
    const response = await fetch(
        "https://search.raah.ir/v4/placeslist/cat/?region=city-qom&name=restaurant&page=1"
    );
    const data = await response.json();
    return data.page_count;
};

const getPageItems = async (page) => {
    const response = await fetch(
        `https://search.raah.ir/v4/placeslist/cat/?region=city-qom&name=restaurant&page=${page}`
    );
    const data = await response.json();
    return data.items
};

const writeItemsToFile = async (items) => {
    const file = "items.txt";
    await fs.appendFile(file, '\n' + items.join("\n"));
};

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// const loadItemsToTxt = async () => {
//     const totalPages = await getTotalPages();
//     for (let i = 1; i <= totalPages; i++) {
//         const items = await getPageItems(i);
//         await writeItemsToFile(items)
//         sleep(1000)
//     }
// };

// loadItemsToTxt()



const getLink = async () => {
    const file = "items.txt";
    const data = await fs.readFile(file, "utf8");
    const items = data.split("\n").filter(item => item !== "")
    const chunkSize = 100;
    for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        // do whatever
        const param = chunk.join("%2C")
        console.log(`https://poi.raah.ir/web/v4/preview-bulk/${param}`)
        await fs.appendFile("links.txt", `https://poi.raah.ir/web/v4/preview-bulk/${param}\n`)
    }

}
getLink()