#!/usr/bin/env node

const fs = require('fs')
const coarse = require('coarse')
const xmlserializer = require('xmlserializer');
const parser = require('parse5');

const inputFile = process.argv[2]
const outputFile = process.argv[3]

const original = fs.readFileSync(inputFile)
const roughened = coarse(original, {strokeWidth: 2})
const parsed = parser.parse(roughened)
const serialized = xmlserializer.serializeToString(parsed)

const svgStart = serialized.indexOf('<svg')
const svgEnd = serialized.lastIndexOf('</body>')
const svg = serialized.substring(svgStart, svgEnd)

fs.writeFileSync(outputFile, svg)
