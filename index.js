var logo = require('logo')
var arDrone = require('ar-drone')

function LogoDrone(droneOptions) {
  this.droneOptions = droneOptions
  this.drone = arDrone.createClient(this.droneOptions)
  return this
}

module.exports = function(droneOptions) {
  return new LogoDrone(droneOptions)
}

module.exports.LogoDrone = LogoDrone

LogoDrone.prototype.convert = function(commands, cb) {
  var self = this
  logo.convert(commands, function(err, obj) {
    if (err) return cb(err)
    var droneCommands = self.translateToDroneLanguage(obj)
    cb(false, droneCommands)
  })
}

LogoDrone.prototype.convertAndSend = function(logoString) {
  var self = this
  self.convert(logoString, function(err, instructions) {
    console.log('sending', logoString, 'to drone:')
    self.sendInstructions(instructions)
  })
}

LogoDrone.prototype.sendInstructions = function(instructions) {
  var self = this
  var time = 0
  var tookoff = false
  self.drone.disableEmergency()
  instructions.map(function(cmd) {
    if (cmd.command === "takeoff" && tookoff) cmd.command = "land"
    setTimeout(function() { self.drone[cmd.command](cmd.arg) }, time)
    console.log(cmd.command, cmd.arg ? cmd.arg : '', 'at', time)
    if (cmd.duration) {
      time = time + cmd.duration
      setTimeout(self.drone.stop, time)
      console.log('stop', 'at', time)
      if (['front', 'back'].indexOf(cmd.command) > -1) {
        time = time + 2000
      }
    }
    if (cmd.command === "takeoff") tookoff = true
  })
}

LogoDrone.prototype.convertTurnToTime = function(degrees) {
  return +degrees * 20
}

LogoDrone.prototype.convertDistanceToTime = function(degrees) {
  return +degrees
}

LogoDrone.prototype.translateToDroneLanguage = function(commands) {
  var self = this
  var droneable = ['begin', 'move', 'turn', 'end']
  var cmds = []
  commands.map(function(cmd) {
    var key = Object.keys(cmd)[0]
    if (droneable.indexOf(key) > -1) {
      if (key === 'begin') cmds.push({command: 'takeoff', duration: 6000})
      if (key === 'end') cmds.push({command: 'land', duration: 4000})
      if (key === 'turn') {
        var degrees = cmd[key]
        if (degrees >= 0) {
          cmds.push({command: 'clockwise', arg: 0.5, duration: self.convertTurnToTime(degrees)})
        } else {
          cmds.push({command: 'counterClockwise', arg: 0.5, duration: self.convertTurnToTime(degrees)})
        }
      }
      if (key === 'move') {
        var distance = cmd[key]
        if (distance >= 0) {
          cmds.push({command: 'front', arg: 0.5, duration: self.convertDistanceToTime(distance)})
        } else {
          cmds.push({command: 'back', arg: 0.5, duration: self.convertDistanceToTime(distance)})
        }
      }
    }
  })
  return cmds
}