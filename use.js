const oracle_thin_mode = require('.');

oracle_thin_mode()
.then(libDir => console.log(libDir))
.catch(err => console.log(err))