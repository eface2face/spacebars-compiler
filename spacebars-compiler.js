var input,output,dir,i;

function showHelp() {
	console.log("Usage: spacebars-compiler [--input template.hbs] [--dir directory]  --output template.js");
};

for(i=0;i<process.argv.length-1;++i) { 
	switch(process.argv[i]) {
		case "--input":
		case "-i":
			input = process.argv[++i];
			break;
		case "--dir":
		case "-d":
			dir = process.argv[++i];
			break;
		case "--output":
		case "-o":
			output = process.argv[++i];
			break;
	}
}

if ((!input && !dir) || !output)
	return showHelp();

var fs       = require("fs");
var path     = require("path");
var lodash   = require("lodash");
var Meteor   = require("meteor-core")(lodash);
require("meteor-htmljs")(Meteor);
require("meteor-html-tools")(Meteor);
require("meteor-blaze-tools")(Meteor);
require("meteor-spacebars-compiler")(Meteor);

if (input)
	fs.readFile(input, 'utf8', function (err,data) {
		if (err) 
			return console.log("Error opening input template file " +err);
		var js = "module.exports = function(Meteor) {\r\n";
		js += "	var HTML = Meteor.HTML;\r\n";
		js += "	var Blaze = Meteor.Blaze;\r\n";
		js += "	var Spacebars = Meteor.Spacebars;\r\n";
		js += "	return " + Meteor.SpacebarsCompiler.compile(data, {isTemplate: true}) + ";\r\n";
		js += "};\r\n";	
		//Write JS to file
		fs.writeFile(output,js,{flags:'w'}, function(err) {
			if(err) 
				return console.log("Error writing output js file "+ err);
			console.log("done!");
		}); 
	});
else if (dir)
	fs.readdir(dir, function(err, files) {
		if (err) 
			return console.log("Error accessing directory with input template files " +err);
		var js = "module.exports = function(Meteor) {\r\n";
		js += "	var HTML = Meteor.HTML;\r\n";
		js += "	var Blaze = Meteor.Blaze;\r\n";
		js += "	var Spacebars = Meteor.Spacebars;\r\n";
		js += "	var templates = {};\r\n";
		//For each file in dir
		for(i=0;i<files.length;++i) {
			//Get file name
			var file = files[i];
			//if it is a template
			if (path.extname(file)===".hbs") {
				//Get template name
				var template = path.basename(file,".hbs");
				//Log
				console.log("appending template '" + template +"'");
				//Read data
				var data = fs.readFileSync(dir+"/"+file, 'utf8');
				//Compile and generate entry in template map
				js += "	templates['" + template + "'] = " + Meteor.SpacebarsCompiler.compile(data, {isTemplate: true}) + ";\r\n";
			}
		}
		js += "	return templates;\r\n";
		js += "};\r\n";	
		//Write JS to file
		fs.writeFile(output,js,{flags:'w'}, function(err) {
			if(err) 
				return console.log("Error writing output js file "+ err);
			console.log("done!");
		}); 
	});
