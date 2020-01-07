//
// Copyright (c) 2020 Cisco Systems
// Licensed under the MIT License 
//

/**
 * JSON Database as a Macro: persists JSON to a macro with read and write functions
 * 
 * examples:
 *    write({'congrats':'you did it'})
 * 
 *    read().then((data) => console.log(data.foo))
 * 
 *    async () => {
 *       await write({ player : 'steve', score: 5 });
 *       let data = await read();
 *       console.log(`player score is: ${data.score}`)
 *    }
 * 
 */

const xapi = require('xapi');

const PREFIX = 'const json = ';
const DATABASE_NAME = 'DB'; // name of the macro with db contents

// Read database contents
async function read() {
   // Load contents
   let contents;
   try {
      let macro = await xapi.command('Macros Macro Get', { Name: DATABASE_NAME, Content: true })
      contents = macro.Macro[0].Content.substring(PREFIX.length);
   }
   catch(err) {
      console.error(`cannot load contents from macro: ${DATABASE_NAME}`);
      throw new Error("DB_ACCESS_ERROR");
   }
   
   // Parse contents
   try {
      console.debug(`DB contains: ${contents}`);
      let data = JSON.parse(contents);
      console.debug('DB successfully parsed');
      return data;
   }
   catch (err) {
      console.error('DB is corrupted, cannot JSON parse the DB');
      throw new Error('DB_PARSE_ERROR');
   }
}

// Write database contents
async function write(data) {
   // Serialize data as JSON and append prefix
   let contents;
   try {
      contents = PREFIX + JSON.stringify(data);
   }
   catch (err) {
      console.debug('Contents cannot be serialized to JSON');
      throw new Error('DB_SERIALIZE_ERROR');
   }
   
   // Write
   try {
      let res = await xapi.command('Macros Macro Save', { Name: DATABASE_NAME, OverWrite: true, body: contents });
      return (res.status == 'OK');
   }
   catch (err) {
      console.error(`cannot write contents to macro: ${DATABASE_NAME}`);
      throw new Error('DB_ACCESS_ERROR');
   }
}
   
// read example
/*
read()
   .then((data) => console.log(data.foo))
   .catch((err) => {
      switch (err.message) {
         case 'DB_ACCESS_ERROR': 
            console.log("db not found: is the DB macro deployed ?");
            break;
         case 'DB_PARSE_ERROR': 
            console.log(`cannot parse: check the contents are JSON with prefix: ${PREFIX}, in macro with name: ${DATABASE_NAME}`);
            break;      
      }
   });
   */

// write example
/*
write({'congrats':'you did it'})
   .then((success) => {
      if (success) {
         console.log('contents persisted');
      }
   })
   .catch((err) => {
      switch (err.message) {
         case 'DB_ACCESS_ERROR': 
            console.log(`cannot write to DB: ${DATABASE_NAME}`);
            break;
         case 'DB_SERIALIZE_ERROR': 
            console.log(`cannot serialize contents as JSON`);
            break;      
      }
   });
   */

xapi.on('ready', async () => {
   await write({ player : 'steve', score: 5 });
   let data = await read();
   console.log(`player score is: ${data.score}`)
});

   

