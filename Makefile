INPUT_SVG = $(wildcard input-*.svg)
OUTPUT_SVG = $(patsubst input-%.svg,output-%.svg,$(INPUT_SVG))
OUTPUT_PDF = $(patsubst output-%.svg,output-%.pdf,$(OUTPUT_SVG))

.SECONDARY : ${OUTPUT_SVG}

all : ${OUTPUT_PDF}

output-%.pdf : output-%.svg
	node ./svg2pdf.js $< $@

output-%.svg : input-%.svg
	node coarse.js $< $@

clean :
	@rm -f ${OUTPUT_SVG} ${OUTPUT_PDF} *~
