# logo-drone (aka turtle-drone)

control the parrot AR drone (aka [the nodecopter](http://nodecopter.com)) using the LOGO programming language

uses the excellent js [streaming LOGO interpreter](http://github.com/thisandagain/logo) written by [@thisandagain](http://github.com/thisandagain)

## usage

```javascript
var logodrone = require('logo-drone')(droneClientOptions)
var logoScript = 'RT 90 FD 200 RT 200'

logodrone.convert(logoScript, function(err, instructions) {
  logodrone.sendInstructions(instructions)
})

// or more simply:

logodrone.convertAndSend(logoScript)
```

## videos

http://www.youtube.com/watch?v=weV9ePxKo68
http://www.youtube.com/watch?v=M3s9Iwx2NsQ

## license

BSD