import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { SetInput } from './set-input/SetInput';
import { Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface SwipeableSetInputProps {
  index: number;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
  exerciseLabel?: string;
  fieldArrayPath?: string;
  customExercise?: string;
  canDelete?: boolean;
}

export function SwipeableSetInput({
  index,
  onRemove,
  onDuplicate,
  exerciseLabel,
  fieldArrayPath = 'sets',
  customExercise,
  canDelete = true,
}: SwipeableSetInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef(null);
  const x = useMotionValue(0);
  
  const deleteOpacity = useTransform(x, [-100, -50], [1, 0]);
  const duplicateOpacity = useTransform(x, [50, 100], [0, 1]);
  const deleteScale = useTransform(x, [-100, -50], [1, 0.8]);
  const duplicateScale = useTransform(x, [50, 100], [0.8, 1]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    
    if (info.offset.x < -80 && canDelete) {
      // Swipe left - delete with undo
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      toast('Set deleted', {
        action: {
          label: 'Undo',
          onClick: () => {
            // Re-add would require parent state - for now just notify
            toast.info('Undo not available for this action');
          },
        },
        duration: 3000,
      });
      onRemove(index);
    } else if (info.offset.x > 80) {
      // Swipe right - duplicate
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      onDuplicate(index);
      toast.success('Set duplicated');
    }
  };

  return (
    <div ref={constraintsRef} className="relative overflow-hidden rounded-ios-lg">
      {/* Delete background (left swipe) */}
      <motion.div 
        className="absolute inset-y-0 left-0 w-24 bg-destructive flex items-center justify-center rounded-l-ios-lg"
        style={{ opacity: deleteOpacity, scale: deleteScale }}
      >
        <Trash2 className="h-6 w-6 text-destructive-foreground" />
      </motion.div>

      {/* Duplicate background (right swipe) */}
      <motion.div 
        className="absolute inset-y-0 right-0 w-24 bg-primary flex items-center justify-center rounded-r-ios-lg"
        style={{ opacity: duplicateOpacity, scale: duplicateScale }}
      >
        <Copy className="h-6 w-6 text-primary-foreground" />
      </motion.div>

      {/* Main content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: canDelete ? -100 : 0, right: 100 }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ x }}
        whileTap={{ cursor: 'grabbing' }}
        className="relative z-10 bg-ios-surface-elevated"
      >
        <SetInput
          index={index}
          onRemove={onRemove}
          exerciseLabel={exerciseLabel}
          fieldArrayPath={fieldArrayPath}
          customExercise={customExercise}
        />
      </motion.div>

      {/* Swipe hints */}
      {!isDragging && (
        <div className="absolute inset-x-0 bottom-1 flex justify-between px-3 pointer-events-none">
          <span className="text-[10px] text-muted-foreground/50">← Delete</span>
          <span className="text-[10px] text-muted-foreground/50">Duplicate →</span>
        </div>
      )}
    </div>
  );
}
