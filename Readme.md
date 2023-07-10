# To use this for node-oracledb thick mode

**Note:** Only for windows and linux

* In linux you need to install unzip manually

```js
const oracle_thick_mode = require('oracle_thick_mode');
const libDir = await oracle_thick_mode();
oracledb.initOracleClient({libDir});


# To install

```sh
yarn add https://github.com/rdev06/oracle_thick_mode.git
