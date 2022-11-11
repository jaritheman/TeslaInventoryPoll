const moment = require("moment");
const fs = require('node:fs');
const readline = require('node:readline');

const databaseFileName = "vins.txt";
var knownVins = [];

var date = moment().format('MMMM Do YYYY, h:mm:ss a');
console.log("*** Running job on", date);

run();

async function run(){    
    await pollTeslaInventory();     
}

async function pollTeslaInventory() {
    const url = 'https://www.tesla.com/inventory/api/v1/inventory-results?query={"query":{"model":"m3","condition":"used","options":{},"arrangeby":"Price","order":"asc","market":"FI","language":"fi","super_region":"north america","lng":24.9349,"lat":60.1717,"zip":"","range":0},"offset":0,"count":50,"outsideOffset":0,"outsideSearch":false}';
    const res = await fetch(url);
    const json = await res.json();

    if(json.total_matches_found > 0){        
        await readKnownVins();

        json.results.forEach(element => {
            console.log("VIN from API: "+ element.VIN + ", already known: "+ knownVins.includes(element.VIN));
            if(!knownVins.includes(element.VIN))
            {
                console.log("New Tesla available: ", element.VIN);

                sendEmail();

                knownVins.push(element.VIN);

                saveVinsFile();
            }
        });        
    }    
    else{
        console.log("Tesla Inventory API returned no results");
    }
}

async function sendEmail() {
    const response = await fetch("https://us-central1-teslainventorypoll.cloudfunctions.net/reportNewTeslaAvailable");
}

async function readKnownVins() {
    const fileStream = fs.createReadStream(databaseFileName);
  
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.
  
    for await (const line of rl) {
      // Each line in input.txt will be successively available here as `line`.      
      knownVins.push(line);
    }

    knownVins.forEach(element => {
        console.log("known vin: ", element);        
    });
}

function saveVinsFile(){
    const writeStream = fs.createWriteStream(databaseFileName);
    const pathName = writeStream.path;
        
    // write each value of the array on the file breaking line
    knownVins.forEach(value => {
        writeStream.write(`${value}\n`)
        console.log("writing value "+value+" to "+databaseFileName);
    });

    // the finish event is emitted when all data has been flushed from the stream
    writeStream.on('finish', () => {
    console.log(`wrote all the array data to file ${pathName}`);
    });

    // handle the errors on the write process
    writeStream.on('error', (err) => {
        console.error(`There is an error writing the file ${pathName} => ${err}`)
    });

    // close the stream
    writeStream.end();
}