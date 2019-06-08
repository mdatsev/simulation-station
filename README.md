# simulation-station

## Setting up for development
Install rollup dependencies 
```
npm install
```
### Building
Run rollup
```
npx rollup -c rollup.config.esm.js
```
You can supply custom config file

### Examples
To run the examples you need an http server.
Run it in the top-level directory.

With node:
```
npm install http-server -g
http-server
```
or if you want live reload:
```
npm install live-server -g
live-server
```

With python 3:
```
python3 -m http.server
```
