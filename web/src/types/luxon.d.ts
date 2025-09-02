declare module 'luxon' {
  export class DateTime {
    static now(): DateTime
    static fromISO(iso: string, opts?: { zone?: string }): DateTime
    setZone(zone: string): DateTime
    toMillis(): number
    plus(values: { days?: number; hours?: number; minutes?: number; seconds?: number; milliseconds?: number }): DateTime
    set(values: { year?: number; month?: number; day?: number; hour?: number; minute?: number; second?: number; millisecond?: number }): DateTime
    readonly year: number
    readonly month: number
    readonly day: number
    readonly hour: number
    readonly minute: number
    readonly second: number
  }

  export class Duration {
    static fromMillis(ms: number): Duration
    shiftTo(...units: ('hours' | 'minutes' | 'seconds')[]): Duration
    hours: number
    minutes: number
    seconds: number
  }
}
