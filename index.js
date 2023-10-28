const balad = require("./balad");
const input = require("input");
const fs = require("node:fs/promises");

const fileIsExist = async (fileName) => {
    try {
        await fs.stat(fileName);
        return true;
    } catch (error) {
        console.log(error)
        if (error.code === "ENOENT") return false;
        throw error;
    }
};

const getOutputFileName = async () => {
    const outputFileName =
        (await input.text("Enter output file name (default: output.csv): ")) ||
        "output.csv";

    return outputFileName;
};

const getIds = async (city, category, page) => {

}

const mian = async () => {
    console.log(
        "example : https://balad.ir/city-qom/cat-restaurant?page=2#11.64/34.6128/50.8964"
    );
    const searchUrl = await input.text("Enter search url: ")
    // const searchUrl =
    //     "https://balad.ir/city-qom/cat-restaurant?page=2#11.64/34.6128/50.8964";

    const category = balad.getCategory(searchUrl);
    const city = balad.getCityName(searchUrl);
    const totalPages = await balad.getTotalPages({ city, category });

    console.log({ category, city, totalPages });

    const outputFileName = await await getOutputFileName();
    if (await fileIsExist(outputFileName)) {
        console.log(
            `\n\n==>File '${outputFileName}' already exists.\nDo you want to append to the file?`
        );
        const answer = await input.select(["No", "Yes"]);
        if (answer === "No") {
            console.log("Exiting...");
            process.exit(0);
        }
    } else await fs.writeFile(outputFileName, "name,address,telephone"); // csv header

    console.log("loading item ids...");
    const allIdsPromises = [];
    for (let i = 1; i <= totalPages; i++) {
        allIdsPromises.push(new Promise(async (resolve, reject) => {
            try {
                const ids = await balad.getPageItemIds({ city, category, page: i });
                console.log(`Page ${i} done.`);
                resolve(ids);
            } catch (error) {
                reject(error);
            }
        }))
    }

    const concurrency = 100;
    const allIds = [];
    for (let i = 0; i < allIdsPromises.length; i += concurrency) {
        const ids = await Promise.all(allIdsPromises.slice(i, i + concurrency));
        allIds.push(...ids.flat());
    }

    console.log(`start scraping ${allIds.length} items...`);

    const chunks = [];
    const chunkSize = 200; //max 200
    for (let i = 0; i < allIds.length; i += chunkSize) {
        chunks.push(allIds.slice(i, i + chunkSize));
    }
    chunks.forEach(async (itemIds, index) => {
        const items = await balad.getItems(itemIds);
        const csvRow = items.map(
            ({ name, address, telephone }) => `${name},${address},${telephone}`
        );
        await fs.appendFile(outputFileName, "\n" + csvRow.join("\n"));
        console.log(`chunk ${index + 1} of ${chunks.length} done.`);
    })
};

console.time("time")

mian()

process.on("exit", () => {
    console.timeEnd("time");
})