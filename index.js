//HIFI2 PLATFORM

var request = require("request")
var HIFIOutput = require("./lib/output")
var Service, Characteristic, Accessory, uuid, hap;

var powerIO = [];
var volumeIO = [];
var sourceIO = [];


/* Register the plugin with homebridge */
module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    Accessory = homebridge.hap.Accessory;
    uuid = homebridge.hap.uuid;
    hap = homebridge.hap;

    homebridge.registerPlatform("homebridge-HIFI2", "HIFI2", HIFIPlatform);
}

function HIFIPlatform(log, config) {
    this.log = log;
    this.host = config.host;
    this.port = config.port;
    this.sitemap = config.sitemap;
    this.inputs = config.inputs;
    this.outputs = config.outputs;
}

HIFIPlatform.prototype.accessories = function (callback) {

    url = "http://" + this.host + ":" + this.port + "/rest/sitemaps/" + this.sitemap + "?type=json";

    request.get({
        url: url,
        json: true
    }, function(err, response, json) {
        if (!err && response.statusCode == 200) {
            if (Array.isArray(json.homepage.widget)) {
                var results = [];
                for(var output in this.outputs) {
                    var source = json.homepage.widget[3 * output].item
                    var power = json.homepage.widget[3 * output + 1].item
                    var volume = json.homepage.widget[3 * output + 2].item
                    sourceIO.push(source.state)
                    powerIO.push(power.state === "ON")
                    volumeIO.push(volume.state)
                    results.push(new HIFIOutput(hap, this.log, this.outputs[output], this.inputs, source, power, volume, sourceIO[output], powerIO[output], volumeIO[output]));
                }
                this.log(sourceIO)
                this.log(powerIO)
                this.log(volumeIO)
                callback(results)
            } else {
                this.log("Error parsing config file");
            }
        } else {
            console.log("Platform - There was a problem connecting to OpenHAB.");
        }
    }.bind(this));
}
