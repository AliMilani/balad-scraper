import { Client, Account, ID, Functions, Databases } from "appwrite";
const client = new Client();
const account = new Account(client);
const functions = new Functions(client);

client
    .setEndpoint("http://localhost:1380/v1")
    .setProject("653ba2d1410b24604926");

// --------- account ===============
// account.create(ID.unique(), 'me@example.com', 'password', 'Jane Doe')
//     .then(function (response) {
//         console.log(response);
//     }, function (error) {
//         console.log(error);
//     });

// -------- functions ===============
// const functionId = "653bade219c280e39de0"

// const data = {
//     name: "John",
//     age: 30
// }

// console.log(await functions.createExecution(functionId, "haya",_,_,_,))

// -------- database ==============

// const databases = new Databases(client);
// console.log(
//     await databases.listDocuments(
//         "coffeeshop-db",
//         "food_category"
//         // "653ba94d879b0443073d"
//     )
// );

// console.log(
//     await databases.createDocument(
//         "coffeeshop-db",
//         "food_category",
//         ID.unique(),
//         {
//             name: "ali",
//         }
//         // "653ba94d879b0443073d"
//     )
// );


client.subscribe("test", events => {
    console.log(events)
})