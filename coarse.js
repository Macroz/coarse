#!/usr/bin/env node

const fs = require('fs')
const coarse = require('coarse')
const xmlserializer = require('xmlserializer');
const parser = require('parse5');

inputFile = process.argv[2]
outputFile = process.argv[3]

const original = fs.readFileSync(inputFile)
const roughened = coarse(original, {strokeWidth: 2})
const parsed = parser.parse(roughened)
const serialized = xmlserializer.serializeToString(parsed)
const prefixed = "<?xml version='1.0' encoding='UTF-8' standalone='no'?>\n" + serialized
fs.writeFileSync(outputFile, prefixed)
