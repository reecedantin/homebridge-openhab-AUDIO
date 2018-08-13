var request = require("request")
var Service, Characteristic;

/////////////////////INPUT
function HIFIInput(homebridge, log, name, inputNumber, sourceItem, currentInput) {

    Service = homebridge.Service;
    Characteristic = homebridge.Characteristic;


    this.name = name + " Sound";
    this.inputNumber = inputNumber;
    this.sourceItem = sourceItem;
    this.log = log;

    this.service = new Service.Switch(this.name);
    this.service.subtype = this.name;
    this.service
        .getCharacteristic(Characteristic.On)
        .on('set', this.setState.bind(this))
        .on('get', this.getState.bind(this));

    this.currentInput = currentInput
    this.state = true;
    this.setSelfState(currentInput)

    this.log(this.name);
}

HIFIInput.prototype.getService = function() {
    this.log(this.name + " getService");
    return this.service;
}

HIFIInput.prototype.getState = function (callback) {
    callback(null, this.state);
}


HIFIInput.prototype.setState = function (state, callback) {
    this.state = state;
    this.currentInput = this.inputNumber + 1

    if (this.selfSet) {
      this.selfSet = false;
      callback(null);
      return;
    }

    var command = (this.inputNumber + 1) + ""

    if(state){
        console.log("POST " + command + " TO " + this.sourceItem.link)
        var self = this;
        request.post(
            self.sourceItem.link,
            {
                body: command,
                headers: {'Content-Type': 'text/plain'}
            },
            function (error, response, body) {
                if (!error && response.statusCode == 201) {
                    //self.log("OpenHAB HTTP - response from (" + (self.name) + "): " + body);
                    callback(null);
                } else {
                    self.log("OpenHAB HTTP - error from (" + (self.name) + "): " + error);
                }
            }
        );
    } else {
        callback(null)
    }
}

HIFIInput.prototype.setSelfState = function (currentInput) {
    var state = false;
    if (currentInput == (this.inputNumber + 1)) {
      state = true
    }

    if(this.state !== state) {
        this.state = state;
        this.selfSet = true;
        this.service
          .getCharacteristic(Characteristic.On)
          .setValue(state);
    }
}

module.exports = HIFIInput;
