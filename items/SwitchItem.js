"use strict";

var request = require("request");

var SwitchItem = function(widget, output, input, platform, homebridge) {
    widget.name = platform.inputs[input] + " " + platform.outputs[output];
    SwitchItem.super_.call(this, widget, platform, homebridge, output, input); ////////////////////////////////////////?
    this.output = output;
    this.input = input;
    this.platform = platform;
};

SwitchItem.prototype.getOtherServices = function() {
    var otherService = new this.homebridge.hap.Service.Switch();

    otherService.getCharacteristic(this.homebridge.hap.Characteristic.On)
        .on('set', this.setItemState.bind(this))
        .on('get', this.getItemState.bind(this))
        .setValue(this.state === this.input);

    return otherService;
};

SwitchItem.prototype.updateCharacteristics = function(message) {

    //this.log("OpenHAB HTTP - message from " + this.name + ": " + ((""+message) === (""+(this.input+1)))  + "| " + (""+message) + " ? " +  (""+(this.input+1)));
    this.setFromOpenHAB = true;
    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.On)
        .setValue((""+message) === (""+(this.input+1)),
            function() {
                this.setFromOpenHAB = false;
            }.bind(this)
        );
};

SwitchItem.prototype.getItemState = function(callback) {

    var self = this;

    this.log("iOS - request power state from " + this.name);
    request(this.url + '/state?type=json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            self.log("OpenHAB HTTP - response from " + self.name + ": " + ((""+body) === (""+(self.input+1)))  + "| " + (""+body) + " ? " +  (""+(self.input+1)));
            callback(undefined,(""+body) === (""+(self.input+1)));
        } else {
            self.log("OpenHAB HTTP - error from " + self.name + ": " + error);
        }
    })
};

SwitchItem.prototype.setItemState = function(value, callback) {

    var self = this;

    if (this.setInitialState) {
        this.setInitialState = false;
        callback();
        return;
    }

    if (this.setFromOpenHAB) {
        callback();
        return;
    }

    this.log("iOS - send message to " + this.name + ": " + value);
    var command = ""+(this.input+1);
    request.post(
        this.url,
        { body: command },
        function (error, response, body) {
            if (!error && response.statusCode == 201) {
                self.log("OpenHAB HTTP - response from " + self.name + ": " + body);
            } else {
                self.log("OpenHAB HTTP - error from " + self.name + ": " + error);
            }
            callback();
        }
    );
};

module.exports = SwitchItem;
