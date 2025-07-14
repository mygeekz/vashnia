import React from 'react';
import DatePicker, { DayValue } from '@hassanmojab/react-modern-calendar-datepicker';
import '@hassanmojab/react-modern-calendar-datepicker/lib/DatePicker.css';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toJalaliObject, jalaliObjectToGregorian } from '@/utils/date';

interface JalaliDatePickerProps {
  value?: string; // ISO date string
  onChange: (date: string) => void; // Returns ISO date string
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ',
  className,
  disabled = false
}) => {
  const [selectedDay, setSelectedDay] = React.useState<DayValue>(
    value ? toJalaliObject(value) : null
  );

  React.useEffect(() => {
    if (value) {
      setSelectedDay(toJalaliObject(value));
    } else {
      setSelectedDay(null);
    }
  }, [value]);

  const handleDateChange = (date: DayValue) => {
    setSelectedDay(date);
    if (date) {
      const isoDate = jalaliObjectToGregorian(date);
      onChange(isoDate);
    } else {
      onChange('');
    }
  };

  const displayValue = selectedDay 
    ? `${selectedDay.year}/${selectedDay.month.toString().padStart(2, '0')}/${selectedDay.day.toString().padStart(2, '0')}`
    : '';

  return (
    <div className={cn("relative", className)}>
      <DatePicker
        value={selectedDay}
        onChange={handleDateChange}
        shouldHighlightWeekends
        locale="fa"
        calendarClassName="z-50"
        calendarTodayClassName="text-primary"
        calendarSelectedDayClassName="bg-primary text-primary-foreground"
        inputPlaceholder={placeholder}
        inputClassName={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "text-right pr-10"
        )}
        wrapperClassName="w-full"
        renderInput={({ ref }) => (
          <div className="relative">
            <input
              ref={ref as React.LegacyRef<HTMLInputElement>}
              value={displayValue}
              placeholder={placeholder}
              readOnly
              disabled={disabled}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                "text-right pr-10"
              )}
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        )}
      />
    </div>
  );
};