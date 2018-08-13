var request = require("request")
var WSListener = require("./WSListener")
var Service, Characteristic;

/////////////////////VOLUME
function HIFIVolume(homebridge, log, name, volumeItem, currentVolume) {

    Service = homebridge.Service;
    Characteristic = homebridge.Characteristic;

    this.name = name + " Volume";
    this.log = log;

    this.state = true;
    this.volume = currentVolume;
    this.volumeItem = volumeItem;

    this.listener = new WSListener(this.name, volumeItem.link, this.log, this.setSelfState.bind(this)).startListener();

    this.service = new Service.Lightbulb(this.name);
    this.service.subtype = this.name;
    this.service
        .getCharacteristic(Characteristic.On)
        .on('set', this.setState.bind(this))
        .on('get', this.getState.bind(this));

    this.service
        .getCharacteristic(Characteristic.Brightness)
        .on('set', this.setBrightness.bind(this))
        .on('get', this.getBrightness.bind(this));


    this.setSelfState(currentVolume);
    this.log(this.name);
}

HIFIVolume.prototype.getService = function() {
    this.log(this.name + " getService");
    return this.service;
}

HIFIVolume.prototype.getState = function (callback) {
    callback(null, this.state);
}


HIFIVolume.prototype.setState = function (state, callback) {
    callback(null);
}

HIFIVolume.prototype.getBrightness = function (callback) {
    callback(null, this.volume);
}

HIFIVolume.prototype.setBrightness = function (state, callback) {
    if (state == 100) {
        state = 20;
    }

    var command = state + "";
    this.volume = state;

    if (this.selfSet) {
      this.selfSet = false;
      callback(null);
      return;
    }

    console.log("POST " + command + " TO " + this.volumeItem.link)

    var self = this;
    request.post(
        self.volumeItem.link,
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

HIFIVolume.prototype.setSelfState = function (state) {
    this.selfSet = true;
    this.service
      .getCharacteristic(Characteristic.Brightness)
      .setValue(parseInt(state));
}

module.exports = HIFIVolume;
