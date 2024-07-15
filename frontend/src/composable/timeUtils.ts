export function useTimeUtils() {
  const locale = 'en-GB'

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

  function humanizedDuration(isoDuration: string) {
    const duration = dayjs.duration(isoDuration)
    const formattedDuration = []

    const hours = Math.floor(duration.hours())
    if (hours > 0) {
      formattedDuration.push(`${hours} hrs`)
    }

    const minutes = Math.floor(duration.minutes())
    if (minutes > 0) {
      formattedDuration.push(`${minutes} min`)
    }

    const seconds = Math.floor(duration.seconds())
    if (seconds > 0) {
      formattedDuration.push(`${seconds} s`)
    }

    const milliseconds = Math.round(duration.milliseconds())
    if (milliseconds > 0) {
      formattedDuration.push(`${milliseconds} ms`)
    }

    return formattedDuration.join(', ')
  }

  return {
    shortDateTime,
    localizedShortDateTime,
    longDateTime,
    localizedLongDateTime,
    humanizedDuration
  }
}