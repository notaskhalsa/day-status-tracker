"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { buttonVariants } from "./button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout="dropdown-buttons"
      fromYear={2020}
      toYear={2030}
      className={`p-4 ${className || ""}`}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-6",
        caption: "flex justify-center pt-1 relative items-center w-full px-12",
        caption_label: "text-lg font-semibold text-slate-800 hidden",
        caption_dropdowns: "flex items-center gap-2",
        dropdown_month: "relative",
        dropdown_year: "relative",
        dropdown:
          "appearance-none bg-white border border-slate-200 rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-slate-700 cursor-pointer hover:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors",
        nav: "flex items-center gap-1",
        nav_button: `${buttonVariants({
          variant: "outline",
        })} size-8 bg-transparent p-0 opacity-50 hover:opacity-100`,
        nav_button_previous: "absolute left-0",
        nav_button_next: "absolute right-0",
        table: "w-full border-collapse",
        head_row: "flex justify-center",
        head_cell:
          "text-slate-400 rounded-md w-12 font-medium text-sm",
        row: "flex w-full mt-3 justify-center",
        cell: `relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-teal-50 [&:has([aria-selected].day-range-end)]:rounded-r-md ${
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        }`,
        day: `${buttonVariants({
          variant: "ghost",
        })} size-12 p-0 font-normal text-base aria-selected:opacity-100`,
        day_range_start:
          "day-range-start aria-selected:bg-teal-600 aria-selected:text-white",
        day_range_end:
          "day-range-end aria-selected:bg-teal-600 aria-selected:text-white",
        day_selected:
          "bg-teal-600 text-white hover:bg-teal-700 hover:text-white focus:bg-teal-600 focus:text-white",
        day_today: "bg-slate-100 text-slate-900 font-semibold",
        day_outside:
          "day-outside text-slate-300 aria-selected:text-slate-300",
        day_disabled: "text-slate-300 opacity-50",
        day_range_middle:
          "aria-selected:bg-teal-50 aria-selected:text-teal-900",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={`size-4 ${className || ""}`} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={`size-4 ${className || ""}`} {...props} />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };
