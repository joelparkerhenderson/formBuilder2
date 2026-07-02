/**
 * Custom text parser for responses from shadesofpale.net APIs.
 */
export const parseServerResponse = (text: string): any => {
  let pos = 0;

  const skipWhitespace = () => {
    while (pos < text.length && /\s/.test(text[pos])) {
      pos++;
    }
  };

  const skipMetadata = () => {
    // Skip tokens starting with !: or ~ until next space
    while (pos < text.length && (text.substring(pos, pos + 2) === '!:' || text[pos] === '~')) {
      while (pos < text.length && text[pos] !== ' ' && text[pos] !== '\n') {
        pos++;
      }
      skipWhitespace();
    }
  };

  const parseValue = (): any => {
    skipWhitespace();
    skipMetadata();
    skipWhitespace();

    if (pos >= text.length) return null;

    const char = text[pos];

    // Parse array
    if (char === '[') {
      pos++;
      const arr: any[] = [];
      skipWhitespace();
      skipMetadata(); // Skip any metadata after opening bracket
      skipWhitespace();
      while (pos < text.length && text[pos] !== ']') {
        const value = parseValue();
        if (value !== null && value !== '') {
          arr.push(value);
        }
        skipWhitespace();
        if (text[pos] === ',') pos++; // Skip optional comma
        skipWhitespace();
        skipMetadata(); // Skip metadata between items
        skipWhitespace();
      }
      if (text[pos] === ']') pos++;
      return arr;
    }

    // Parse object
    if (char === '{') {
      pos++;
      const obj: any = {};
      skipWhitespace();
      while (pos < text.length && text[pos] !== '}') {
        // Parse key
        const key = parseKey();
        skipWhitespace();
        if (text[pos] === ':') pos++;
        skipWhitespace();
        // Parse value
        obj[key] = parseValue();
        skipWhitespace();
        if (text[pos] === ',') pos++; // Skip optional comma
        skipWhitespace();
      }
      if (text[pos] === '}') pos++;
      return obj;
    }

    // Parse quoted string
    if (char === '"') {
      pos++;
      let str = '';
      while (pos < text.length && text[pos] !== '"') {
        if (text[pos] === '\\' && pos + 1 < text.length) {
          pos++;
          str += text[pos];
        } else {
          str += text[pos];
        }
        pos++;
      }
      if (text[pos] === '"') pos++;
      return str;
    }

    // Parse number or unquoted string
    let value = '';
    while (pos < text.length && text[pos] !== '\n' && text[pos] !== ',' && text[pos] !== '}' && text[pos] !== ']' && text[pos] !== ':') {
      value += text[pos];
      pos++;
    }
    value = value.trim();

    // Skip trailing newline if present
    if (pos < text.length && text[pos] === '\n') {
      pos++;
    }

    // Try to parse as number
    if (/^-?\d+(\.\d+)?$/.test(value)) {
      return parseFloat(value);
    }

    return value;
  };

  const parseKey = (): string => {
    skipWhitespace();
    let key = '';

    // Quoted key
    if (text[pos] === '"') {
      pos++;
      while (pos < text.length && text[pos] !== '"') {
        key += text[pos];
        pos++;
      }
      if (text[pos] === '"') pos++;
      return key;
    }

    // Unquoted key (ends at colon)
    while (pos < text.length && text[pos] !== ':') {
      key += text[pos];
      pos++;
    }
    return key.trim();
  };

  return parseValue();
};
