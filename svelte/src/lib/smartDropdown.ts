export interface SmartDropdownOption {
  value: string;
  label: string;
}

export function normaliseSmartDropdownOptions(options: (SmartDropdownOption | string)[]): SmartDropdownOption[] {
  return options.map((option) => (typeof option === 'string' ? { value: option, label: option } : option));
}

export function matchSmartDropdownOptions(options: (SmartDropdownOption | string)[], query: string, limit = 20): SmartDropdownOption[] {
  const parsed = normaliseSmartDropdownOptions(options);
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return parsed.slice(0, limit);
  return parsed
    .map((option) => {
      const haystack = `${option.label} ${option.value}`.toLowerCase();
      const matched = terms.every((term) => haystack.includes(term));
      const starts = terms.some((term) => option.label.toLowerCase().startsWith(term));
      return { option, score: matched ? (starts ? 2 : 1) : 0 };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.option.label.localeCompare(b.option.label))
    .slice(0, limit)
    .map((item) => item.option);
}
