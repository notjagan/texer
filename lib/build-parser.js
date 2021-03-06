// Helper module to re/build the PEGJS parser.
"use strict";

var INPUT_FILE = __dirname + '/parser.pegjs';
var OUTPUT_FILE = __dirname + '/parser.js';

var buildParser = module.exports = function(styFile, commandDefinitions, inFile, outFile) {
    if (typeof inFile == "undefined") {
        inFile = INPUT_FILE;
    }
    if (typeof outFile == "undefined") {
        outFile = OUTPUT_FILE;
    }
    var PEG = require('pegjs');
    var fs = require('fs');
    var tu = require('./texutil');
    tu.createMacroCode(styFile, commandDefinitions);

    var parserSource = PEG.buildParser(fs.readFileSync(inFile, 'utf8'), {
        /* PEGJS options */
        output: "source",
        cache: true,// makes repeated calls to generic_func production efficient
        allowedStartRules: [ "start" ]
    });
    // hack up the source to make it pass jshint
    parserSource = parserSource
        .replace(/(peg\$subclass\(child, parent\)|peg\$SyntaxError\(message, expected, found, location\)|peg\$parse\(input\)) {/g,
        function (m) {
            return m + "\n    /*jshint validthis:true, newcap:false*/ ";
        }).replace(/\n(\s+)([?:+]) (expectedDescs|" or "|peg)/g, ' $2\n$1$3');
    parserSource =
        '/* jshint latedef: false */\n' +
        'module.exports = ' + parserSource + ';';
    fs.writeFileSync(outFile, parserSource, 'utf8');
};
