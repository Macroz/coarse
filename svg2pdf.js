#!/usr/bin/env node

const fs = require('fs')
const PdfDoc = require('pdfkit')
const svg2pdf = require('svg-to-pdfkit')

const inputFile = process.argv[2]
const outputFile = process.argv[3]

const pdf = new PdfDoc()
pdf.pipe(fs.createWriteStream(outputFile))

const svg = fs.readFileSync(inputFile, 'utf-8')
svg2pdf(pdf, svg, 0, 0)

pdf.end()
