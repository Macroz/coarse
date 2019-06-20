// helpers
const styleParser = require('style-parser');

function getAttribute(element, attributeName) {
  let value;
  element.attrs.forEach(a => {
    if (a.name === attributeName) {
      value = a.value;
    }
  });
  return value;
}

function getStyle(element) {
  let style = getAttribute(element, "style");
  style = typeof style === 'string' ? styleParser(style) : {};
  return style;
}

module.exports = {
  getAttribute,
  getStyle,
};
