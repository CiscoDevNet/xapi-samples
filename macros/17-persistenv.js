//
// Copyright (c) 2020 Cisco Systems
// Licensed under the MIT License 
//

// An advanced implementation for the Environment Macro that persists ENV values to the local device (using an 'ENV' Macro to serialize JSON)

const xapi = require('xapi');

// Read ENV from local storage
const DEFAULT_ENV = {PING:'PONG'};
let ENV;
xapi.on('ready', async () => {
   let data = await read();

   // if env is empty, create a new storage with default env
   if (!data || (!data.PING)) {
      console.info('No existing ENV, creating default');
      ENV = DEFAULT_ENV;
      await write(ENV);
   }
   else {
      ENV = data;
   }
});

xapi.event.on('Message Send Text', (msg) => {
   console.debug(`new "Message Send" Event with text: ${msg}`);

   // WORKAROUND: needed if message was sent from the cloud via POST https://api.ciscospark.com/v1/xapi/command/message.send
   msg = msg.replace(/\'/g, '"');
   let parsed;
   try {
      parsed = JSON.parse(msg);
   }
   catch (err) {
      console.err(`cannot JSON parse the text in 'Message Send' Event: ${msg}, ignoring...`);
      return
   }

   let data = parsed;
   if (!data.env) {
      console.debug(`"Message Send" Event is not about Env: ${msg}, ignoring`);
      return;
   }

   console.debug(`"Message Sent" event concerns env variable: "${data.env}"`);

   // GET ENV
   if (data.operation && (data.operation == 'get')) {

      if (!data.env) {
         console.warn(`no ENV variable specified in: "${msg}", ignoring...`);
         return;
      }

      console.debug(`requested value for env variable: "${data.env}"`);
      let response = {
         'env': data.env,
         'operation': 'get_response',
         'value': '' // default to '' if variable is not found
      }
      let value = ENV[data.env];
      if (value) {
         response.value = value;
      }
     
      // Publish value for ENV variable
      xapi.command('Message Send', { Text: JSON.stringify(response) });
      return;
   }

   // RESPONSE provided => ignore
   if (data.operation && (data.operation == 'get_response')) {
      console.debug(`ignoring get_response type of "Message Sent" event: ${msg}`);
      return;
   }

   // SET ENV
   // Note that the storage is volatile (dynamically added variables will be lost every time the macro or runtime is restared)
   if (data.operation && (data.operation == 'set')) {
      
      console.log(`setting value: "${data.value}" for env variable: "${data.env}"`);
      ENV[data.env] = data.value;

      // Write to local storage
      try {
         write(ENV);
      }
      catch(err) {
         console.warn(`could not write variable to ENV, err: ${err.message}`)
      }
      return;
   }

   console.warn(`operation for "Message Sent" event is not supported:"${msg}, ignoring...`);
   return;
})


const PREFIX = 'const json = ';
const DATABASE_NAME = 'ENV'; // name of the macro with db contents

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
