var request = require("request")
var WSListener = require("./WSListener")
var Service, Characteristic;

/////////////////////POWER
function HIFIPower(homebridge, log, name, powerItem, currentPower) {

    Service = homebridge.Service;
    Characteristic = homebridge.Characteristic;

    this.name = name + " Sound";
    this.log = log;
    this.state = currentPower
    this.powerItem = powerItem

    this.listener = new WSListener(this.name, powerItem.link, this.log, this.setSelfState.bind(this)).startListener();

    this.service = new Service.Switch(this.name);
    this.service.subtype = name;
    this.service
        .getCharacteristic(Characteristic.On)
        .on('set', this.setState.bind(this))
        .on('get', this.getState.bind(this));


    this.selfSet = true;
    this.setSelfState(powerItem.state);
    this.log(this.name);
}

HIFIPower.prototype.getService = function() {
    this.log(this.name + " getService");
    return this.service;
}

HIFIPower.prototype.getState = function (callback) {
    callback(null, this.state);
}


HIFIPower.prototype.setState = function (state, callback) {
    var changedState = 'OFF'
    if(state){
        changedState = 'ON'
    }
    var command = changedState;
    this.state = state;

    if (this.selfSet) {
      this.selfSet = false;
      callback(null);
      return;
    }

    console.log("POST " + command + " TO " + this.powerItem.link)

    var self = this;
    request.post(
        self.powerItem.link,
        { body: command },
        function (error, response, body) {
            if (!error && response.statusCode == 201) {
                //self.log("OpenHAB HTTP - response from (" + (self.name) + "): " + body);
                callback(null)
            } else {
                self.log("OpenHAB HTTP - error from (" + (self.name) + "): " + error);
                callback(error)
            }
        }
    );
}

HIFIPower.prototype.setSelfState = function (state) {
    this.selfSet = true;
    this.service
      .getCharacteristic(Characteristic.On)
      .setValue(state === 'ON');
}

module.exports = HIFIPower;
