import jalaali from 'jalaali-js'

export type Persian = { year: number; month: number; day: number }

/** ISO -> Persian object */
export const isoToPersian = (iso: string): Persian => {
  const d = new Date(iso)
  const { jy, jm, jd } = jalaali.toJalaali(d)
  return { year: jy, month: jm, day: jd }
}

/** Persian -> ISO */
export const persianToIso = (p: Persian) => {
  const { gy, gm, gd } = jalaali.toGregorian(p.year, p.month, p.day)
  return `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`
}