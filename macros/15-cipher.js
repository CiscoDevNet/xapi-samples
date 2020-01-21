//
// Extract from https://stackoverflow.com/questions/18279141/javascript-string-encryption-and-decryption
// Contributed by https://stackoverflow.com/users/2861702/jorgeblom
//

/*
 * Simplist symetric encoding using a shared secret
 *
 */
const cipher = salt => {
   const textToChars = text => text.split('').map(c => c.charCodeAt(0));
   const byteHex = n => ("0" + Number(n).toString(16)).substr(-2);
   const applySaltToChar = code => textToChars(salt).reduce((a,b) => a ^ b, code);

   return text => text.split('')
       .map(textToChars)
       .map(applySaltToChar)
       .map(byteHex)
       .join('');
}

const decipher = salt => {
   const textToChars = text => text.split('').map(c => c.charCodeAt(0));
   const applySaltToChar = code => textToChars(salt).reduce((a,b) => a ^ b, code);
   return encoded => encoded.match(/.{1,2}/g)
       .map(hex => parseInt(hex, 16))
       .map(applySaltToChar)
       .map(charCode => String.fromCharCode(charCode))
       .join('');
}

// Example
const text = 'Vision without execution is hallucination';
console.log(`BEFORE: ${text}`);
const encrypted = cipher('not so secret')(text);
console.log(`ENCRYPTED: ${encrypted}`);

const decrypted = decipher('not so secret')(encrypted);
console.log(`DECRYPTED: ${decrypted}`);

if (text !== decrypted) {
 console.error('failed');
}