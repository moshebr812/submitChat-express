// services
const fileSrv = require('fs');
const expressSrv = require('express');
const myApp = expressSrv(); // need to return pointer to App
const pathSrv = require ('path');
const { stringify } = require('querystring');

// const 
const htmlMainPage = './submitChat-express.html';
const chatHistFile = './chat-History.json';
// this command already converts the JSON file into a valid JS object
// Note this happens only ONCE when the server starts
let chatHistArray = require (chatHistFile) || [];
const myPort = 8080;
const fullDebug = false;
//
let reqCounter = 0;

console.clear();
console.log (`========================\n  NOTE - WORKINTG ON PORT  ${myPort}\n========================\n`);

console.log (`STARTING     <<submitChat-express.js>>     RUNNING on posrt ${myPort}`);
fullDebug? console.log (`json file at start: ${JSON.stringify(chatHistArray)}` ) : 0;


myApp.use ((req, res, next) =>{
    console.log (`\n\n_______Middleware______ myApp.use(). reqCounter = ${++reqCounter}`);
    // if I don't sepcify the next, the code will stop and no function will be exceuted thereafter
    next();
});


// Load the CSS directly after u located it in /public
myApp.use ( expressSrv.static(pathSrv.join ( __dirname , '/public/') ) );

// just loading the html once upon refresh
// the population of all other objects / chat hist is from js FILE after DOM Body completed loading
myApp.get ('/', (request, response) => {
    console.log (`get('/') REQUEST ##  ${reqCounter}  ##  req.url: ${request.url}`);
    // load the html with no data
    const htmlPage = fileSrv.readFileSync (htmlMainPage, {encoding: 'utf-8'});
    response.send (htmlPage);
});

myApp.get('/read-chat-hist' , (request, response) => {
    // assuming the list is already in the array, and now need to reload from file
    console.log (`get('/read-chat-hist') request.url \n.... ${request.url}`);
    // just return the chat-hist-array
    response.send (chatHistArray);
});

myApp.get ('/write-chat' , (request, response) => {
    // request.url = is before parsing --> debug the input
    console.log (`get('/write-chat') request.url \n.... ${request.url}`);

    // request.parse = get the parameters in a Tidy JSON element {} 
    // console.log (`JSON.stringify (request.query) \n ...${JSON.stringify(request.query)} `);
    
    // So now I can add the new submit to my "global array"
    chatHistArray.push (request.query);
    // And now commit the new array back to the file. Remeber to convert to JSON syntax fisrt
    fileSrv.writeFileSync (chatHistFile, JSON.stringify (chatHistArray) );
    // it is expected to return to caller the new updated array after the push & after file commit
    response.send (chatHistArray);
});

myApp.get('/del-single-chat' , (req, response) =>  {
    const idToDel = req.query['id'];

    if (fullDebug) {
        console.log ('del-single-chat req.url : ' + req.url);
        console.log ('del-single-chat req.query : ' + req.query );
        console.log ('del-single-chat req.query.id : ' + req.query.id );
        console.log ('del-single-chat JSON.stringify : ' + JSON.stringify ( req.query ) );
    }    
    
    console.log ('DELETE: \ndel-single-chat req.query["id"] : ' +  req.query['id']  );
    
    // 1. find the INDEX of this chat in the Array
        //      const fruits = ["apple", "banana", "cantaloupe", "blueberries", "grapefruit"];
        //      const index = fruits.findIndex(fruit => fruit === "blueberries");
    let location = chatHistArray.findIndex ( element => element.id === idToDel);
    if (location<0) {
        // NO changes
        console.log (`ERROR: did find id ${idToDel} to delete`);
        response.send (chatHistArray);
    } 
    console.log (`FOUND item to del ${idToDel} at location ${location}`);
    
    // Delete from Array
    chatHistArray.splice (location, 1);
    // Write to file updated array
    fileSrv.writeFileSync (chatHistFile, JSON.stringify (chatHistArray) );
    // Written to client new Array
    response.send (chatHistArray);
});

myApp.get ('/del-chat-history' , (req, res) => {
    console.log (`get('/del-chat-history') request.url \n.... ${req.url}`);
    // Set to empty Array
    chatHistArray = [];
    // Save a valid empty array in file
    fileSrv.writeFileSync (chatHistFile, JSON.stringify (chatHistArray) );

    // return the Empty Array (to DOM)
    res.send (chatHistArray);
});
myApp.listen(myPort);

