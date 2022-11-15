const isObject = require('lodash/isObject');

class RegexBuilder {
  static buildRegexString = (regex) => {
    if (!isObject(regex)) {
      return regex;
    } else {
      const {start = '', end = '', between} = regex;

      return `${start}(${between})${end}`;
    }
  };
  static generateRegex = (regex, flags) => {
    const finalRegexString = RegexBuilder.buildRegexString(regex);

    return new RegExp(finalRegexString, flags);
  };

  startRegex = '';
  endRegex = '';
  regexStrings = [];

  constructor(regexString, flags) {
    this.add(this.getRegexString(regexString));
    this.flags = flags;
  }

  getRegexString = (regexString) => {
    if (!isObject(regexString)) {
      this.add(regexString);
    } else {
      const {start = '', end = '', between} = regexString;

      if (between) {
        this.add(between);
      }

      this.startRegex = start;
      this.endRegex = end;
    }
  };

  add = (regexString) => {
    this.regexStrings.push(regexString);
  };

  getRegex = () => {
    const combinedRegexString = this.regexStrings
      .map((regexString) => `(${regexString})`)
      .join('|');

    return RegexBuilder.generateRegex(
      {
        start: this.startRegex,
        end: this.endRegex,
        between: combinedRegexString,
      },
      this.flags,
    );
  };
}

module.exports = RegexBuilder;
