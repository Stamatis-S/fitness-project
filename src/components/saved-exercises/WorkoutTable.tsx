
import { format } from "date-fns";
import { Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { WorkoutLog } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

interface WorkoutTableProps {
  logs: WorkoutLog[];
  onDelete: (id: number) => void;
  onEdit: (id: number, updatedLog: Partial<WorkoutLog>) => void;
}

export function WorkoutTable({ logs, onDelete, onEdit }: WorkoutTableProps) {
  const isMobile = useIsMobile();
  const [editingLog, setEditingLog] = useState<WorkoutLog | null>(null);
  const [editDate, setEditDate] = useState<Date | null>(null);
  const [editWeight, setEditWeight] = useState<string>("");
  const [editReps, setEditReps] = useState<string>("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const getExerciseName = (log: WorkoutLog) => {
    if (log.custom_exercise) {
      return log.custom_exercise;
    }
    return log.exercises?.name || 'Unknown Exercise';
  };

  const handleEdit = (log: WorkoutLog) => {
    setEditingLog(log);
    setEditDate(new Date(log.workout_date));
    setEditWeight(log.weight_kg?.toString() || "");
    setEditReps(log.reps?.toString() || "");
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setEditDate(date);
      setIsDatePickerOpen(false); // Close the date picker after selection
    }
  };

  const handleSave = () => {
    if (!editingLog || !editDate) return;

    const updates: Partial<WorkoutLog> = {
      workout_date: editDate.toISOString().split('T')[0],
      weight_kg: editWeight ? parseFloat(editWeight) : null,
      reps: editReps ? parseInt(editReps) : null,
    };

    onEdit(editingLog.id, updates);
    setEditingLog(null);
  };

  const handleCloseDialog = () => {
    setEditingLog(null);
    setIsDatePickerOpen(false);
  };

  if (isMobile) {
    return (
      <>
        <div className="space-y-4">
          {logs.map((log: WorkoutLog) => (
            <Card key={log.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="space-y-1">
                  <h3 className="font-medium">{getExerciseName(log)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(log.workout_date), 'PP')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(log)}
                  >
                    <Edit className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(log.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p>{log.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Set</p>
                  <p>{log.set_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Weight</p>
                  <p>{log.weight_kg || '-'} kg</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reps</p>
                  <p>{log.reps || '-'}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Dialog open={!!editingLog} onOpenChange={handleCloseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Exercise</DialogTitle>
              <DialogDescription>
                Modify the exercise details below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover 
                  open={isDatePickerOpen} 
                  onOpenChange={setIsDatePickerOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDatePickerOpen(true);
                      }}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editDate ? format(editDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-auto p-0" 
                    align="start"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Calendar
                      mode="single"
                      selected={editDate || undefined}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Weight (KG)</Label>
                <Input
                  type="number"
                  value={editWeight}
                  onChange={(e) => setEditWeight(e.target.value)}
                  step="0.5"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label>Repetitions</Label>
                <Input
                  type="number"
                  value={editReps}
                  onChange={(e) => setEditReps(e.target.value)}
                  min="0"
                />
              </div>

              <Button onClick={handleSave} className="w-full">
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Exercise</TableHead>
              <TableHead>Set</TableHead>
              <TableHead>Weight (KG)</TableHead>
              <TableHead>Reps</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log: WorkoutLog) => (
              <TableRow key={log.id}>
                <TableCell>{format(new Date(log.workout_date), 'PP')}</TableCell>
                <TableCell>{log.category}</TableCell>
                <TableCell>{getExerciseName(log)}</TableCell>
                <TableCell>{log.set_number}</TableCell>
                <TableCell>{log.weight_kg || '-'}</TableCell>
                <TableCell>{log.reps || '-'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(log)}
                    >
                      <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(log.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingLog} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Exercise</DialogTitle>
            <DialogDescription>
              Modify the exercise details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover 
                open={isDatePickerOpen} 
                onOpenChange={setIsDatePickerOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDatePickerOpen(true);
                    }}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editDate ? format(editDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-0" 
                  align="start"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Calendar
                    mode="single"
                    selected={editDate || undefined}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Weight (KG)</Label>
              <Input
                type="number"
                value={editWeight}
                onChange={(e) => setEditWeight(e.target.value)}
                step="0.5"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Repetitions</Label>
              <Input
                type="number"
                value={editReps}
                onChange={(e) => setEditReps(e.target.value)}
                min="0"
              />
            </div>

            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
