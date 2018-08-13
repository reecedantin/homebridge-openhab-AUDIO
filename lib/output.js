var request = require("request")
var Service, Characteristic;

var HIFIInput = require("./input")
var HIFIPower = require("./power")
var HIFIVolume = require("./volume")
var WSListener = require("./WSListener")

function HIFIOutput(homebridge, log, name, inputs, source, power, volume, sourceIO, powerIO, volumeIO) {

    Service = homebridge.Service;
    Characteristic = homebridge.Characteristic;

    this.log = log;
    this.name = name
    this.inputList = inputs
    this.source = sourceIO
    this.power = powerIO
    this.volume = volumeIO

    this.inputs = []
    this.services = []
    this.listener = new WSListener(this.name, source.link, this.log, this.setSelfState.bind(this)).startListener();

    this.log("Configuring HIFI output: " + name);

    for(var i = 0; i < inputs.length; i++){
        if (inputs[i] !== "") {
            this.addInput(new HIFIInput(homebridge, this.log, inputs[i] + " " + this.name, i, source, this.source))
        }
    }

    this.powerService = new HIFIPower(homebridge, this.log, this.name, power, this.power)
    this.addPower(this.powerService)

    this.volumeService = new HIFIVolume(homebridge, this.log, this.name, volume, this.volume)
    this.addVolume(this.volumeService)

    var informationService = new Service.AccessoryInformation();
    informationService
        .setCharacteristic(Characteristic.Manufacturer, 'HIFI2')
        .setCharacteristic(Characteristic.Model, this.name)
        .setCharacteristic(Characteristic.SerialNumber, this.name);

    this.services.push(informationService);
}

HIFIOutput.prototype.addInput = function (newInput) {
    this.inputs.push(newInput);
    this.services.push(newInput.getService());
}

HIFIOutput.prototype.addVolume = function (newVolume) {
    this.services.push(newVolume.getService());
}

HIFIOutput.prototype.addPower = function (newPower) {
    this.services.push(newPower.getService());
}

HIFIOutput.prototype.getServices = function () {
    return this.services
}

HIFIOutput.prototype.setSelfState = function (state) {
    this.source = state + "";
    this.inputs.forEach(function(input) {
        input.setSelfState(parseInt(state))
    });
}

module.exports = HIFIOutput;
