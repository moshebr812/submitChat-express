// services
const fileSrv = require('fs');
const expressSrv = require('express');
const myApp = expressSrv(); // need to return pointer to App
const pathSrv = require ('path');

// const 
const htmlMainPage = 'submitChat-express.html';
const chatHistFile = './chat-History.json';
// this command already converts the JSON file into a valid JS object
let chatHistArray = require (chatHistFile);
const myPort = 4040;
const fullDebug = false;
//
let reqCounter = 0;

console.clear();
console.log (`STARTING     <<submitChat-express.js>>     RUNNING on posrt ${myPort}`);
fullDebug? console.log (`json file at start: ${JSON.stringify(chatHistArray)}` ) : 0;


myApp.use ((req, res, next) =>{
    console.log (`\n\n_______Middleware______ myApp.use(). reqCounter = ${reqCounter}`);
    // if I don't sepcify the next, the code will stop and no function will be exceuted thereafter
    next();
});


// Load the CSS directly after u located it in /public
myApp.use ( expressSrv.static(pathSrv.join ( __dirname , '/public/') ) );

// just loading the html once upon refresh
// the population of all other objects / chat hist is from js FILE after DOM Body completed loading
myApp.get ('/', (request, response) => {
    console.log (`get('/') REQUEST ##  ${++reqCounter}  ##  req.url: ${request.url}`);
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

