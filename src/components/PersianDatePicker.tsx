import { DayValue } from '@hassanmojab/react-modern-calendar-datepicker'
import DatePicker from '@hassanmojab/react-modern-calendar-datepicker'
import '@hassanmojab/react-modern-calendar-datepicker/lib/DatePicker.css'
import jalaali from 'jalaali-js'
import { isoToPersian, persianToIso, Persian } from '@/lib/persianDate'

const fa = {
  months: [
    'فروردین',
    'اردیبهشت', 
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
  ],
  weekDays: [
    { name: 'شنبه', short: 'ش' },
    { name: 'یکشنبه', short: 'ی' },
    { name: 'دوشنبه', short: 'د' },
    { name: 'سه‌شنبه', short: 'س' },
    { name: 'چهارشنبه', short: 'چ' },
    { name: 'پنج‌شنبه', short: 'پ' },
    { name: 'جمعه', short: 'ج' },
  ],
  weekStartingIndex: 6,
  getToday(gregorianTodayObject: any) {
    return gregorianTodayObject;
  },
  toNativeDate(date: any) {
    return new Date(date.year, date.month - 1, date.day);
  },
  getMonthLength(date: any) {
    return jalaali.jalaaliMonthLength(date.year, date.month);
  },
  transformDigit(digit: string) {
    return digit;
  },
  nextMonth: 'ماه بعد',
  previousMonth: 'ماه قبل',
  openMonthSelector: 'باز کردن انتخابگر ماه',
  openYearSelector: 'باز کردن انتخابگر سال',
  closeMonthSelector: 'بستن انتخابگر ماه',
  closeYearSelector: 'بستن انتخابگر سال',
  defaultPlaceholder: 'انتخاب...',
  from: 'از',
  to: 'تا',
  digitSeparator: ',',
  yearLetterSkip: 0,
  isRtl: true,
};

type Props = {
  value: string | undefined
  onChange: (iso: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export default function PersianDatePicker({ value, onChange, placeholder, required, disabled, className }: Props) {
  const handleChange = (d: DayValue) => {
    if (d) {
      onChange(persianToIso(d as Persian))
    } else {
      onChange('')
    }
  }

  return (
    <DatePicker
      value={value ? isoToPersian(value) : null}
      onChange={handleChange}
      locale={fa as any}
      shouldHighlightWeekends
      inputPlaceholder={placeholder || 'انتخاب تاریخ'}
      renderInput={({ ref, ...props }) => (
        <input
          {...props}
          ref={ref as React.LegacyRef<HTMLInputElement>}
          readOnly
          required={required}
          disabled={disabled}
          className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-right ${className || ''}`}
        />
      )}
    />
  )
}