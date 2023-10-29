const balad = require("./balad");
const input = require("input");
const fs = require("node:fs/promises");

const fileIsExist = async (fileName) => {
    try {
        await fs.stat(fileName);
        return true;
    } catch (error) {
        console.log(error);
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

const mian = async () => {
    console.log("loading category groups...\n");
    const categoryGroups = await balad.getCategoryGroups();

    console.log("\n==> Select category group:");
    const categorySlug = await input.select(
        categoryGroups.map(({ slug }) => slug)
    );

    const groupCategories = await balad.getCategoryGroupBySlug(categorySlug);

    console.log("\n==> Select category:");
    const category = await input.select(groupCategories.map(({ slug }) => slug));

    const cities = await balad.getCities();
    console.log("\n==> Select city:");
    const city = await input.select(cities.map(({ city }) => city));

    console.log("Please wait...");
    const totalPages = await balad.getTotalPages({ city, category });
    if (!totalPages) {
        console.log("\nNo result found. try another category or city.");
        console.log("\n ==> Do you want to try again?");

        const answer = await input.select(["No", "Yes"]);
        if (answer === "Yes") return mian();
        else process.exit(0);
    }

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

    console.time("time");
    console.log("loading item ids...");
    const allIdsPromises = [];
    for (let i = 1; i <= totalPages; i++) {
        allIdsPromises.push(async () => {
            const ids = await balad.getPageItemIds({ city, category, page: i });
            console.log(`Page ${i} done.`);
            return ids;
        });
    }

    const loadIdsConcurrency = 30; // max 100
    const allIds = [];
    for (let i = 0; i < allIdsPromises.length; i += loadIdsConcurrency) {
        const promises = allIdsPromises
            .slice(i, i + loadIdsConcurrency)
            .map((f) => f());
        const ids = await Promise.all(promises);
        allIds.push(...ids.flat());
    }

    console.log(`start scraping ${allIds.length} items...`);

    const chunks = [];
    const chunkSize = 230; //max 230
    const concurrency = 5;
    for (let i = 0; i < allIds.length; i += chunkSize) {
        chunks.push(allIds.slice(i, i + chunkSize));
    }

    const getItemsPromises = [];
    for (let chunk of chunks) {
        getItemsPromises.push(async () => {
            const items = await balad.getItems(chunk);
            const csvRow = items.map(
                ({ name, address, telephone }) => `${name},${address},${telephone}`
            );
            await fs.appendFile(outputFileName, "\n" + csvRow.join("\n"));
            console.log(`${chunk.length} items done.`);
        });
    }

    for (let i = 0; i <= getItemsPromises.length; i += concurrency) {
        console.log(
            `scraping ${i}=>${i + concurrency} | (${getItemsPromises.length})`
        );
        const promises = getItemsPromises.slice(i, i + concurrency).map((f) => f());
        await Promise.all(promises);
    }
    console.timeEnd("time");
};

mian();
