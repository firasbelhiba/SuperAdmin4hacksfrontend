"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import Label from "./Label";

interface DateRange {
  start: string;
  end: string;
}

interface DateRangePickerProps {
  startLabel?: string;
  endLabel?: string;
  startValue: string;
  endValue: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  startError?: boolean;
  endError?: boolean;
  startHint?: string;
  endHint?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function DateRangePicker({
  startLabel = "Start Date",
  endLabel = "End Date",
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  startError = false,
  endError = false,
  startHint,
  endHint,
  disabled = false,
  required = false,
}: DateRangePickerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Start Date */}
      <div>
        <Label htmlFor="start-date">
          {startLabel}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <div className="relative">
          <input
            id="start-date"
            type="datetime-local"
            value={startValue}
            onChange={(e) => onStartChange(e.target.value)}
            disabled={disabled}
            className={`
              w-full px-4 py-3 pl-11 rounded-xl border-2 transition-all duration-150
              bg-white dark:bg-gray-900 
              text-[#18191F] dark:text-white
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:outline-none focus:ring-2 focus:ring-[#56CCA9]/20
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                startError
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#18191F] dark:border-gray-300 focus:border-[#56CCA9] dark:focus:border-[#56CCA9] hover:border-[#56CCA9] dark:hover:border-[#56CCA9]"
              }
            `}
          />
          <Calendar
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${
              startError ? "text-red-500" : "text-gray-400"
            }`}
          />
        </div>
        {startHint && (
          <p
            className={`mt-1 text-sm ${
              startError
                ? "text-red-600 dark:text-red-400"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {startHint}
          </p>
        )}
      </div>

      {/* End Date */}
      <div>
        <Label htmlFor="end-date">
          {endLabel}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <div className="relative">
          <input
            id="end-date"
            type="datetime-local"
            value={endValue}
            onChange={(e) => onEndChange(e.target.value)}
            disabled={disabled}
            min={startValue}
            className={`
              w-full px-4 py-3 pl-11 rounded-xl border-2 transition-all duration-150
              bg-white dark:bg-gray-900 
              text-[#18191F] dark:text-white
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:outline-none focus:ring-2 focus:ring-[#56CCA9]/20
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                endError
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#18191F] dark:border-gray-300 focus:border-[#56CCA9] dark:focus:border-[#56CCA9] hover:border-[#56CCA9] dark:hover:border-[#56CCA9]"
              }
            `}
          />
          <Calendar
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${
              endError ? "text-red-500" : "text-gray-400"
            }`}
          />
        </div>
        {endHint && (
          <p
            className={`mt-1 text-sm ${
              endError
                ? "text-red-600 dark:text-red-400"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {endHint}
          </p>
        )}
      </div>
    </div>
  );
}
