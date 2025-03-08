"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, set } from "date-fns";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface DateTimePickerProps {
  onDateTimeSelect?: any;
  timeSlots?: TimeSlot[];
  className?: string;
  minDate?: Date;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  onDateTimeSelect,
  timeSlots,
  className = "",
  minDate = new Date(),
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(minDate);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [combinedDateTime, setCombinedDateTime] = useState<Date | null>(null);

  // Default time slots if none provided
  const defaultTimeSlots: TimeSlot[] = [
    { time: "09:00", available: true },
    { time: "09:30", available: true },
    { time: "10:00", available: true },
    { time: "10:30", available: true },
    { time: "11:00", available: true },
    { time: "11:30", available: true },
    { time: "12:00", available: true },
    { time: "12:30", available: true },
    { time: "13:00", available: true },
    { time: "13:30", available: true },
    { time: "14:00", available: true },
    { time: "14:30", available: true },
    { time: "15:00", available: true },
    { time: "15:30", available: true },
    { time: "16:00", available: true },
    { time: "16:30", available: true },
    { time: "17:00", available: true },
    { time: "17:30", available: true },
  ];

  const slots = timeSlots || defaultTimeSlots;

  // Combine date and time when either changes
  useEffect(() => {
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const dateTime = set(selectedDate, { hours, minutes, seconds: 0 });
      setCombinedDateTime(dateTime);
      
      if (onDateTimeSelect) {
        onDateTimeSelect(dateTime);
      }
    } else {
      setCombinedDateTime(null);
      
      if (onDateTimeSelect) {
        onDateTimeSelect(null);
      }
    }
  }, [selectedDate, selectedTime, onDateTimeSelect]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  return (
    <div className={`${className}`}>
      <div className="rounded-md border">
        <div className="flex max-sm:flex-col">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="p-2 sm:pe-5"
            disabled={[
              { before: minDate }, // Dates before minDate
            ]}
          />
          <div className="relative w-full max-sm:h-48 sm:w-40">
            <div className="absolute inset-0 py-4 max-sm:border-t">
              <ScrollArea className="h-full sm:border-s">
                <div className="space-y-3">
                  <div className="flex h-5 shrink-0 items-center px-5">
                    <p className="text-sm font-medium">
                      {selectedDate ? format(selectedDate, "EEEE, d") : "Select a date"}
                    </p>
                  </div>
                  <div className="grid gap-1.5 px-5 max-sm:grid-cols-2">
                    {slots.map(({ time, available }) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                        onClick={() => handleTimeSelect(time)}
                        disabled={!available || !selectedDate}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
      {combinedDateTime && (
        <p className="mt-4 text-sm text-center">
          Selected: {format(combinedDateTime, "EEEE, MMMM d, yyyy 'at' h:mm a")}
        </p>
      )}
    </div>
  );
};

export default DateTimePicker;