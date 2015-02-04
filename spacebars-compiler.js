var fs       = require("fs");
var path     = require("path");
var lodash   = require("lodash");
var Meteor   = require("meteor-core")(lodash);
require("meteor-htmljs")(Meteor);
require("meteor-html-tools")(Meteor);
require("meteor-blaze-tools")(Meteor);
require("meteor-spacebars-compiler")(Meteor);

module.exports =
{
	file : function (options) {
		fs.readFile(options.input, options.charset, function (err,data) {
			if (err) 
				return console.log("Error opening input template file " +err);
			var js = "module.exports = function(Meteor) {\r\n";
			js += "	var HTML = Meteor.HTML;\r\n";
			js += "	var Blaze = Meteor.Blaze;\r\n";
			js += "	var Spacebars = Meteor.Spacebars;\r\n";
			js += "	return " + Meteor.SpacebarsCompiler.compile(data, {isTemplate: true}) + ";\r\n";
			js += "};\r\n";	
			//Add support for i18n with {{[xxx]}} -> {{t 'xxx'}}
			if (options.i18n)
				//Replace
				data.replace(/\{\{\s*\[\s*([^\s]*)\s*\]\s*\}\}/g,"{{t '$1'}}");
			//Write JS to file
			fs.writeFile(options.output,js,{flags:'w'}, function(err) {
				if(err) 
					return console.log("Error writing output js file "+ err);
				console.log("done!");
			}); 
		});
	},
	directory : function (options) {
		//JS file header
		var js = "module.exports = function(Meteor) {\r\n";
		js += "	var HTML = Meteor.HTML;\r\n";
		js += "	var Blaze = Meteor.Blaze;\r\n";
		js += "	var Spacebars = Meteor.Spacebars;\r\n";
		js += "	var templates = {};\r\n";
		//Traverse dir
		var walk = function(dir,recursive,prefix,i18n) {
			var files,i;
			try {
				//Get files
				files = fs.readdirSync(dir);
			} catch(err) {
				//Exit
				return console.log("Error accessing directory with input template files for " + path + "." +err);
			}
			//Log
			console.log("Processing " + dir);
			
			//For each file in dir
			for(i=0;i<files.length;++i) {
				//Get file name
				var name = files[i];
				//Get full path
				var file = path.join(dir,name);
				//Get file stats
				var stats = fs.statSync(file);
				//Check if it is a directory 
				if (stats.isDirectory()) {
					//If we are recursing
					if (recursive)
						//Append files in it
						walk(file,recursive,(prefix.length?prefix+".":"")+name,i18n);
				//if it is a template
				} else if (stats.isFile() && path.extname(file)===".hbs") {
					//Get template name
					var template = path.basename(name,".hbs");
					//If we have a preffix
					if (prefix.length)
						//Prepend
						template = prefix + "." + template;
					//Log
					console.log("appending template '" + template +"'");
					//Read data
					var data = fs.readFileSync(file, 'utf8');
					//Add support for i18n with {{[xxx]}} -> {{t 'xxx'}}
					if (i18n)
						//Replace
						data = data.replace(/\{\{\s*\[\s*([^\s]*)\s*\]\s*\}\}/g,"{{t '$1'}}");
					//Compile and generate entry in template map
					js += "	templates['" + template + "'] = " + Meteor.SpacebarsCompiler.compile(data, {isTemplate: true}) + ";\r\n";
				}
			}
		};
		//Init recursivity
		walk(options.dir,options.recursive,options.prefix,options.i18n);
		//JS file footer
		js += "	return templates;\r\n";
		js += "};\r\n";	
		//Write JS to file
		fs.writeFile(options.output,js,{flags:'w'}, function(err) {
			if(err) 
				return console.log("Error writing output js file "+ err);
			console.log("done!");
		}); 
	}
};

