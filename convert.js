const parser = require('parse5');
const styleParser = require('style-parser');
const { getAttibute, getStyle } = require('./svg');

// prewalk the DOM starting from `element`
// and use `transformer` to replace nodes
function transformDOM(element, transformer) {
  const newElement = transformer(element);

  // if nothing happened we assume we should
  // recurse to children
  if (element === newElement && element.childNodes) {
    const newChildren = element.childNodes.map(child => transformDOM(child, transformer));
    newElement.childNodes = newChildren;
  } else {
    newElement.parentNode = element.parentNode;
  }
  return newElement;
}

// recursively return the combined #text of an element tree
// breaks are replaced with newline characters
function getText(element) {
  let text = '';
  element.childNodes.forEach(c => {
    if (c.nodeName === '#text') {
      text += c.value;
    } else if (c.nodeName === 'br') {
      text += '\n';
    } else {
      text += getText(c);
    }
  });
  return text;
}

// create SVG text given width, height and a CSS style object
function createSvgText(text, width, height, style) {
  let x = 0;
  let y = -3; // TODO calculate margins?
  let dx = 0;
  let dy = 14; // TODO calculate line height from font-size?

  const align = style['text-align'] || 'left';
  if (align === 'left') {
    x = 0;
  } else if (align === 'center') {
    x = width / 2;
  } else if (align === 'right') {
    x = width;
  }

  let anchor = 'start';
  switch (align) {
    case 'right':
      anchor = 'end';
      break;
    case 'center':
      anchor = 'middle';
      break;
  }
  let svgText = '<text xmlns="http://www.w3.org/2000/svg"'
              + ' x="' + x + '"'
              + ' y="' + y + '"'
              + ' style="'
              + 'font-size: ' + style['font-size'] + ';'
              + 'font-family: ' + style['font-family'] + ';'
              + '"'
              + ' fill="' + style.color + '">';

  // each line of text shall be its own tspan in SVG text
  const lines = text.split('\n');
  lines.forEach(line => {
    if (line !== '') {
      svgText += '<tspan xmlns="http://www.w3.org/2000/svg"'
               + ' x="' + x + '"'
               + ' dx="' + dx + '"'
               + ' dy="' + dy + '"' // move after each line downwards by line height estimate
               + ' text-anchor="' + anchor
               + '">' + line + '</tspan>';
    }});

  svgText += '</text>';

  // to achieve a background color we must create a group
  // with a rect that is behind the text
  if (style['background-color']) {
    svgText = '<g xmlns="http://www.w3.org/2000/svg"><rect xmlns="http://www.w3.org/2000/svg" style="fill: ' + style['background-color'] + '" width="' + width + '" height="' + height + '"></rect>' + svgText + '</g>';
  }
  return svgText;
}

function convertForeignObject(element) {
  // the SVG will check for foreignObject support and at the root there is
  // a switch element
  if (element.tagName === 'switch') {
    const foreignObject = element.childNodes[0];
    if (foreignObject.tagName === 'foreignObject') {
      const width = getAttribute(foreignObject, "width");
      const height = getAttribute(foreignObject, "height");
      const textContainerDiv = foreignObject.childNodes[0];
      // the text container may have a separate DIV for background color
      const potentialTextBackgroundDiv = textContainerDiv.childNodes[0];
      const style = getStyle(textContainerDiv);
      if (potentialTextBackgroundDiv && potentialTextBackgroundDiv.tagName === 'div') {
        backgroundDivStyle = getStyle(potentialTextBackgroundDiv);
        if (backgroundDivStyle['background-color']) {
          // copy potential background color to the same style object
          style['background-color'] = backgroundDivStyle['background-color'];
        }
      }
      const text = getText(textContainerDiv);
      const svgText = createSvgText(text, width, height, style);

      return parser.parseFragment(svgText).childNodes[0]; // converting back to DOM
    } else {
      console.warn('Unsupported switch', element);
    }
  }
  return element;
}

// takes SVG element and converts all foreignObjects to SVG text
function convertSVGForeignObjectsToText(svgElement) {
  return transformDOM(svgElement, convertForeignObject);
}

// takes a document element and converts all foreignObjects to SVG text
function convertDocumentForeignObjectsToText(documentElement) {
  // document -> html -> body -> svg
  return convertSVGForeignObjectsToText(documentElement.childNodes[0].childNodes[1].childNodes[0]);
}

module.exports = {
  convertSVGForeignObjectsToText,
  convertDocumentForeignObjectsToText
};
