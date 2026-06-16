export const parseServerResponse = (text: string): any => {
  let pos = 0;

  const skipWhitespace = () => {
    while (pos < text.length && /\s/.test(text[pos])) pos += 1;
  };

  const skipMetadata = () => {
    while (pos < text.length && (text.substring(pos, pos + 2) === '!:' || text[pos] === '~')) {
      while (pos < text.length && text[pos] !== ' ' && text[pos] !== '\n') pos += 1;
      skipWhitespace();
    }
  };

  const parseKey = (): string => {
    skipWhitespace();
    let key = '';
    if (text[pos] === '"') {
      pos += 1;
      while (pos < text.length && text[pos] !== '"') {
        key += text[pos];
        pos += 1;
      }
      if (text[pos] === '"') pos += 1;
      return key;
    }
    while (pos < text.length && text[pos] !== ':') {
      key += text[pos];
      pos += 1;
    }
    return key.trim();
  };

  const parseValue = (): any => {
    skipWhitespace();
    skipMetadata();
    skipWhitespace();

    if (pos >= text.length) return null;

    const char = text[pos];
    if (char === '[') {
      pos += 1;
      const arr: any[] = [];
      skipWhitespace();
      skipMetadata();
      skipWhitespace();
      while (pos < text.length && text[pos] !== ']') {
        const value = parseValue();
        if (value !== null && value !== '') arr.push(value);
        skipWhitespace();
        if (text[pos] === ',') pos += 1;
        skipWhitespace();
        skipMetadata();
        skipWhitespace();
      }
      if (text[pos] === ']') pos += 1;
      return arr;
    }

    if (char === '{') {
      pos += 1;
      const obj: Record<string, any> = {};
      skipWhitespace();
      while (pos < text.length && text[pos] !== '}') {
        const key = parseKey();
        skipWhitespace();
        if (text[pos] === ':') pos += 1;
        skipWhitespace();
        obj[key] = parseValue();
        skipWhitespace();
        if (text[pos] === ',') pos += 1;
        skipWhitespace();
      }
      if (text[pos] === '}') pos += 1;
      return obj;
    }

    if (char === '"') {
      pos += 1;
      let str = '';
      while (pos < text.length && text[pos] !== '"') {
        if (text[pos] === '\\' && pos + 1 < text.length) pos += 1;
        str += text[pos];
        pos += 1;
      }
      if (text[pos] === '"') pos += 1;
      return str;
    }

    let value = '';
    while (pos < text.length && text[pos] !== '\n' && text[pos] !== ',' && text[pos] !== '}' && text[pos] !== ']' && text[pos] !== ':') {
      value += text[pos];
      pos += 1;
    }
    value = value.trim();
    if (pos < text.length && text[pos] === '\n') pos += 1;
    return /^-?\d+(\.\d+)?$/.test(value) ? Number.parseFloat(value) : value;
  };

  return parseValue();
};
