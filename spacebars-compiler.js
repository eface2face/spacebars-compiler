var input,output,i;

function showHelp() {
	console.log("Usage: spacebars-compiler --input template.hbs --output template.js");
};

for(i=0;i<process.argv.length-1;++i) { 
	switch(process.argv[i]) {
		case "--input":
		case "-i":
			input = process.argv[++i];
			break;
		case "--output":
		case "-o":
			output = process.argv[++i];
			break;
	}
}

if (!input || !output)
	return showHelp();

var fs       = require("fs");
var lodash   = require("lodash");
var Meteor   = require("meteor-core")(lodash);
require("meteor-htmljs")(Meteor);
require("meteor-html-tools")(Meteor);
require("meteor-blaze-tools")(Meteor);
require("meteor-spacebars-compiler")(Meteor);

fs.readFile(input, 'utf8', function (err,data) {
	if (err) {
		return console.log("Error opening input template file " +err);
	}
	var js = "module.exports = function(Meteor) {\r\n";
        js += "	var HTML = Meteor.HTML;\r\n";
        js += "	var Blaze = Meteor.Blaze;\r\n";
        js += "	var Spacebars = Meteor.Spacebars;\r\n";
	js += "	return " + Meteor.SpacebarsCompiler.compile(data, {isTemplate: true}) + ";\r\n";
	js += "};\r\n";	
	fs.writeFile(output,js,{flags:'w'}, function(err) {
		if(err) 
			return console.log("Error writing output js file "+ err);
		console.log("done!");
	}); 
});
