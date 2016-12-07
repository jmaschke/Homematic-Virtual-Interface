//
//  PioneerBridge.js
//  Homematic Virtual Interface Plugin
//
//  Created by Thomas Kluge on 07.12.16.
//  Copyright � 2016 kSquare.de. All rights reserved.
//


"use strict";

var HomematicDevice;
var avr = require(__dirname + '/pioneer-avr.js');
var path = require('path');


var PioneerBridge = function(plugin,name,server,log) {
	this.plugin = plugin;
	this.server = server;
	this.log = log;
	this.name = name;
	this.bridge = server.getBridge();
	HomematicDevice = server.homematicDevice;
}


PioneerBridge.prototype.init = function() {
	var that = this;
	this.configuration = this.server.configuration;
    this.hm_layer = this.server.getBridge();
	this.hmDevice = new HomematicDevice();
	var avrName = "PioneerAVR";
	
	var data = this.bridge.deviceDataWithSerial(avrName);
	if (data!=undefined) {
		this.hmDevice.initWithStoredData(data);
	} 
	
	if (this.hmDevice.initialized == false) {
		this.hmDevice.initWithType("HM-RC-19_Pioneer",avrName);
		this.bridge.addDevice(this.hmDevice,true);
	} else {
		this.bridge.addDevice(this.hmDevice,false);
	}
    
    this.hmDevice.on('device_channel_value_change', function(parameter){
		var newValue = parameter.newValue;
		
		if (parameter.name == "TARGET_VOLUME") {
			    
			var newVolume = parameter.newValue;
			that.setVolume(newVolume);							    

		} else {
			
		var channel = that.hmDevice.getChannel(parameter.channel);
		switch (channel.index) {
			
			case 1:
				that.sendCommand("PO\r");
				break;
			case 2:
				that.sendCommand("PF\r");
				break;
			case 3:
				that.sendCommand("VU\r");
				break;
			case 4:
				that.sendCommand("VD\r");
				break;
			case 5:
			case 6:
			case 7:
			case 8:
			case 9:
			case 10:
			case 11:
			case 12:
			case 13:
			case 14:
			case 15:
			case 16:
			case 17:
			case 18:
				var func = that.functionForChannel(parameter.name, channel);
				if (func != undefined) {
					that.sendCommand(func);
				}
			break;
			
		}

		}
	});

}

PioneerBridge.prototype.sendCommand = function(command) {
 var that = this;
 var options = this.configuration.getValueForPlugin(this.name,"options");
 if (auth != undefined) {
	var options = {port: auth["port"],host: auth["host"],log: false};
	var receiver = new avr.VSX(options);

	receiver.on("connect", function() {
		receiver.sendCommand(command);
	});
 }
}

PioneerBridge.prototype.setVolume = function(newVolume) {
 var that = this;
 var options = this.configuration.getValueForPlugin(this.name,"options");
 if (auth != undefined) {
	var options = {port: auth["port"],host: auth["host"],log: false};
	var receiver = new avr.VSX(options);

	receiver.on("connect", function() {
		receiver.volume(newVolume);
	});
 }
}



PioneerBridge.prototype.functionForChannel=function(type,channel) {
	var result = channel.getParamsetValueWithDefault("MASTER","CMD_" + type,"");
	return result;
}


PioneerBridge.prototype.handleConfigurationRequest = function(dispatched_request) {
	dispatched_request.dispatchFile(this.plugin.pluginPath , "index.html",undefined);
}


module.exports = {
  PioneerBridge : PioneerBridge
}
