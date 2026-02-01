
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { useState } from 'react';

const STAGES = ['Lead In', 'Qualified', 'Proposal', 'Won'] as const;

export default function Deals() {
  const [columns, setColumns] = useState<Record<string, string[]>>({
    'Lead In': ['Acme Onboarding', 'Soylent Upgrade'],
    'Qualified': ['Globex Renewal'],
    'Proposal': ['Umbrella Pilot'],
    'Won': ['Wayne Corp Annual']
  });

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.data.current?.from === over.id) return;
    const from = active.data.current.from;
    const to = over.id;
    const item = active.id as string;
    setColumns(prev => {
      const next = { ...prev };
      next[from] = next[from].filter(x => x !== item);
      next[to] = [item, ...next[to]];
      return next;
    });
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid md:grid-cols-4 gap-4">
        {STAGES.map((stage) => (
          <Column key={stage} id={stage} items={columns[stage]} />
        ))}
      </div>
    </DndContext>
  );
}

function Column({ id, items }: { id: string; items: string[] }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`card p-3 transition ${isOver ? 'ring-2 ring-brand-500' : ''}`}>
      <div className="font-semibold mb-2">{id}</div>
      <div className="space-y-2 min-h-[240px]">
        {items.map((d) => <DealCard key={d} from={id} id={d} />)}
      </div>
    </div>
  );
}

function DealCard({ id, from }: { id: string; from: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, data: { from } });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}
      className={`p-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm cursor-grab ${isDragging ? 'opacity-70' : ''}`}>
      {id}
    </div>
  );
}
