<script lang="ts">
  import { formatFormDate } from '$lib/utils/dateFormat';

  let {
    value = null,
    class: className = ''
  }: {
    value?: string | Date | null;
    class?: string;
  } = $props();

  function formatDisplayDate(rawValue?: string | Date | null): string {
    if (!rawValue) return '';
    if (rawValue instanceof Date) {
      if (Number.isNaN(rawValue.getTime())) return '';
      return formatFormDate(rawValue);
    }
    const trimmed = rawValue.trim();
    if (!trimmed) return '';
    const isoDateOnly = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoDateOnly) {
      const [, year, month, day] = isoDateOnly;
      return formatFormDate(new Date(Number(year), Number(month) - 1, Number(day)));
    }
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) return trimmed;
    return formatFormDate(parsed);
  }

  const displayValue = $derived(formatDisplayDate(value));
</script>

<span class={`fb-date-display ${className}`.trim()}>{displayValue}</span>
