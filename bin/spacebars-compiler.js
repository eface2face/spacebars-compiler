#!/usr/bin/env node
var input,output,dir,i,i18n = false,recursive = false,prefix = '';

function showHelp() {
	console.log("Usage: spacebars-compiler [-i|--input template.hbs] [-d|--dir directory] [--i18n] [-p|--prefix prefix] [-r|--recursive]  -o|--output template.js");
};

for(i=0;i<process.argv.length;++i) { 
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
		case "--prefix":
		case "-p":
			prefix = process.argv[++i];
			break;
		case "--i18n":
			i18n = true;
			break;
		case "--recursive":
		case "-r":
			recursive = true;
			break;
	}
}

if ((!input && !dir) || !output)
	return showHelp();

var compiler = require("../spacebars-compiler.js");

if (input)
	compiler.file({
		input: input,
		output: output,
		i18n: i18n,
		charset: 'utf8',
		prefix: prefix
	});
else if (dir)
	compiler.directory({
		dir: dir,
		output: output,
		recursive: recursive,
		i18n: i18n,
		charset: 'utf8',
		prefix: prefix
	});
