
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface DateSelectorProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export function DateSelector({ date, onDateChange }: DateSelectorProps) {
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
            onSelect={(date) => date && onDateChange(date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
