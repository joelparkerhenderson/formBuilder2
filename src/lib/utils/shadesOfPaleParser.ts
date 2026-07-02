export const parseServerResponse = (text: string): unknown => {
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

  const parseValue = (): unknown => {
    skipWhitespace();
    skipMetadata();
    skipWhitespace();
    if (pos >= text.length) return null;

    const char = text[pos];
    if (char === '[') {
      pos += 1;
      const values: unknown[] = [];
      skipWhitespace();
      skipMetadata();
      skipWhitespace();
      while (pos < text.length && text[pos] !== ']') {
        const value = parseValue();
        if (value !== null && value !== '') values.push(value);
        skipWhitespace();
        if (text[pos] === ',') pos += 1;
        skipWhitespace();
        skipMetadata();
        skipWhitespace();
      }
      if (text[pos] === ']') pos += 1;
      return values;
    }

    if (char === '{') {
      pos += 1;
      const obj: Record<string, unknown> = {};
      skipWhitespace();
      while (pos < text.length && text[pos] !== '}') {
        const key = parseKey();
        skipWhitespace();
        if (text[pos] === ':') pos += 1;
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
      let value = '';
      while (pos < text.length && text[pos] !== '"') {
        if (text[pos] === '\\' && pos + 1 < text.length) pos += 1;
        value += text[pos];
        pos += 1;
      }
      if (text[pos] === '"') pos += 1;
      return value;
    }

    let value = '';
    while (pos < text.length && text[pos] !== '\n' && text[pos] !== ',' && text[pos] !== '}' && text[pos] !== ']' && text[pos] !== ':') {
      value += text[pos];
      pos += 1;
    }
    value = value.trim();
    if (pos < text.length && text[pos] === '\n') pos += 1;
    if (/^-?\d+(\.\d+)?$/.test(value)) return Number.parseFloat(value);
    return value;
  };

  return parseValue();
};
