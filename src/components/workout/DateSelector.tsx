
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, startOfDay } from "date-fns";

interface DateSelectorProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export function DateSelector({ date, onDateChange }: DateSelectorProps) {
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Create a new date at the start of the selected day in the local timezone
      const localDate = startOfDay(selectedDate);
      // Set to noon UTC to avoid timezone issues
      localDate.setUTCHours(12, 0, 0, 0);
      onDateChange(localDate);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Date</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
