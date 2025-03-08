import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Grip, X } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CreateJobForm } from '@/@types/job';
import { UseFormReturn } from 'react-hook-form';

interface RoundFieldProps {
    form: UseFormReturn<CreateJobForm>
}

const RoundField:React.FC<RoundFieldProps> = ({ form }) => {
  const rounds = form.watch('selection_process') || [];

  const handleAddRound = () => {
    const currentRounds = form.getValues('selection_process') || [];
    form.setValue('selection_process', [
      ...currentRounds,
      { stage_name: '', sequence: (currentRounds.length + 1).toString() },
    ]);
  };

  const handleRemoveRound = (index: number) => {
    const currentRounds = form.getValues('selection_process');
    const newRounds = currentRounds.filter((_, i) => i !== index);
    const updatedRounds = newRounds.map((round, i) => ({
      ...round,
      sequence: (i + 1).toString(),
    }));
    form.setValue('selection_process', updatedRounds);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = rounds.findIndex((round) => round.sequence === active.id);
      const newIndex = rounds.findIndex((round) => round.sequence === over.id);
      const newRounds = arrayMove(rounds, oldIndex, newIndex);
      const updatedRounds = newRounds.map((round, index) => ({
        ...round,
        sequence: (index + 1).toString(),
      }));
      form.setValue('selection_process', updatedRounds);
    }
  };

  const SortableItem = ({ id, index } : {id: string, index: number}) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div ref={setNodeRef} style={style} className="flex items-center gap-4 p-4 rounded-lg">
        <div {...attributes} {...listeners} className="cursor-move">
          <Grip className="h-5 w-5" />
        </div>

        <div className="grow">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Round {index + 1}</span>
            <FormField
              control={form.control}
              name={`selection_process.${index}.stage_name`}
              render={({ field }) => (
                <FormItem className="grow">
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select interview round" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technical Interview">Technical Interview</SelectItem>
                        <SelectItem value="HR Interview">HR Interview</SelectItem>
                        <SelectItem value="CEO Interview">CEO Interview</SelectItem>
                        <SelectItem value="Trial Round">Trial Round</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={index === 0}
          onClick={() => handleRemoveRound(index)}
          className="text-red-500 hover:text-red-600"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <FormLabel>Selection Process Rounds</FormLabel>
        <Button
          type="button"
          onClick={handleAddRound}
        >
          Add Round
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToVerticalAxis]}>
        <SortableContext items={rounds.map((round) => round.sequence)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {rounds.map((round, index) => (
              <SortableItem key={round.sequence} id={round.sequence} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default RoundField;