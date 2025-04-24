export function useTimeUtils() {
  const locale = 'es-ES'

  function shortDateTime(date: Date): string {
    return date.toLocaleString(locale)
  }

  function localizedShortDateTime(date: string): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }

    return new Date(date).toLocaleString(locale, options)
  }

  function longDateTime(date: Date): string {
    return date.toLocaleString(locale)
  }

  function localizedLongDateTime(date: string): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    }
    return new Date(date).toLocaleString(locale, options)
  }

  function formatDateToYMD(date: Date): string {
    return date.toLocaleDateString('en-CA')
  }

  return {
    shortDateTime,
    localizedShortDateTime,
    longDateTime,
    localizedLongDateTime,
    formatDateToYMD
  }
}
