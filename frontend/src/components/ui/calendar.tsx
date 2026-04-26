"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: string
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-transparent group/calendar p-2 md:p-3",
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit mx-auto", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-6 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex flex-col gap-4", defaultClassNames.month),
        month_caption: cn(
          "flex h-8 w-full items-center justify-center pt-1 mb-2",
          defaultClassNames.month_caption
        ),
        caption_label: cn(
          "select-none font-bold text-xs md:text-[13px] uppercase tracking-widest",
          defaultClassNames.caption_label
        ),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: (buttonVariant as any) || "ghost" }),
          "h-8 w-8 select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: (buttonVariant as any) || "ghost" }),
          "h-8 w-8 select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_grid: cn(
          "border-collapse border-spacing-0 table-fixed",
          defaultClassNames.month_grid
        ),
        weekdays: cn("", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground/70 select-none text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] pb-3 text-center",
          defaultClassNames.weekday
        ),
        weeks: cn("", defaultClassNames.weeks),
        week: cn("mt-2", defaultClassNames.week),
        day: cn(
          "p-0 text-center relative",
          defaultClassNames.day
        ),
        day_button: cn(
          "h-8 w-8 mx-auto md:h-9 md:w-9 text-[11px] md:text-[12px] font-bold select-none p-0 transition-all duration-200 rounded-full hover:bg-slate-100 dark:hover:bg-primary/20 cursor-pointer focus:outline-none flex items-center justify-center bg-transparent",
          defaultClassNames.day_button
        ),
        range_start: cn(
          "!bg-primary !text-white !rounded-l-[24px] !rounded-r-none glow-selection-primary relative z-10",
          defaultClassNames.range_start
        ),
        range_middle: "range-middle-elite [&_button]:!text-primary",
        range_end: cn(
          "!bg-primary !text-white !rounded-r-[24px] !rounded-l-none glow-selection-primary relative z-10",
          defaultClassNames.range_end
        ),
        selected: cn(
          /* When a button is inside a selected cell, ensure the text adapts */
          "[&_button]:!text-white",
          defaultClassNames.selected
        ),
        today: cn(
          "[&_button]:bg-primary/10 [&_button]:text-primary",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground/30 aria-selected:text-muted-foreground/50",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

export { Calendar }
