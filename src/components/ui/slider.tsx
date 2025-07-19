import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

// نوار لغزنده (Slider) با انیمیشن و افکت‌های صاف
const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center transition-all duration-300", // انیمیشن برای انتقال نرم
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary transition-all duration-300">
      <SliderPrimitive.Range className="absolute h-full bg-primary transition-all duration-300" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/80" />
  </SliderPrimitive.Root>
));

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };

// کامپوننت سایدبار با انیمیشن
export function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <div
      className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transition-all duration-300 transform",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">مدیریت</h2>
        <button
          onClick={toggleSidebar}
          className="text-gray-600 hover:text-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            width="24"
            height="24"
          >
            <path fill="currentColor" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex flex-col space-y-4 p-4">
        <Button className="hover:bg-gray-200 transition-all">پروفایل</Button>
        <Button className="hover:bg-gray-200 transition-all">دسته‌بندی‌ها</Button>
        <Button className="hover:bg-gray-200 transition-all">تنظیمات</Button>
      </div>
    </div>
  );
}
