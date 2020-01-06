function isEmail(email) {
   // extract from http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
   let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
   return re.test(email);
}

let email1 = "stsfartz@cisco"
console.log(`is an email? ${email1}: ${isEmail(email1)}`)

let email2 = "stsfartz@cisco.com"
console.log(`is an email? ${email2}: ${isEmail(email2)}`)
