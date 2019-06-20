#!/usr/bin/env node

const fs = require('fs')
const PdfDoc = require('pdfkit')
const svg2pdf = require('svg-to-pdfkit')
const parser = require('parse5')
const { getAttribute } = require('./svg')

const inputFile = process.argv[2]
const outputFile = process.argv[3]
const svg = fs.readFileSync(inputFile, 'utf-8')
const parsed = parser.parse(svg)
// document -> html -> body -> svg
const svgElement = parsed.childNodes[0].childNodes[1].childNodes[0]

let width = getAttribute(svgElement, 'width')
let height = getAttribute(svgElement, 'height')
// remove px
if (width.indexOf('px') !== -1) {
  width = parseInt(width.substring(0, width.length - 2))
}
if (height.indexOf('px') !== -1) {
  height = parseInt(height.substring(0, height.length - 2))
}

const pdf = new PdfDoc({size: [width, height]})
pdf.pipe(fs.createWriteStream(outputFile))
svg2pdf(pdf, svg, 0, 0, {assumePt: true})

pdf.end()
