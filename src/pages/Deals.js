import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { useState } from 'react';
const STAGES = ['Lead In', 'Qualified', 'Proposal', 'Won'];
export default function Deals() {
    const [columns, setColumns] = useState({
        'Lead In': ['Acme Onboarding', 'Soylent Upgrade'],
        'Qualified': ['Globex Renewal'],
        'Proposal': ['Umbrella Pilot'],
        'Won': ['Wayne Corp Annual']
    });
    function handleDragEnd(event) {
        const { active, over } = event;
        if (!over || active.data.current?.from === over.id)
            return;
        const from = active.data.current.from;
        const to = over.id;
        const item = active.id;
        setColumns(prev => {
            const next = { ...prev };
            next[from] = next[from].filter(x => x !== item);
            next[to] = [item, ...next[to]];
            return next;
        });
    }
    return (_jsx(DndContext, { onDragEnd: handleDragEnd, children: _jsx("div", { className: "grid md:grid-cols-4 gap-4", children: STAGES.map((stage) => (_jsx(Column, { id: stage, items: columns[stage] }, stage))) }) }));
}
function Column({ id, items }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (_jsxs("div", { ref: setNodeRef, className: `card p-3 transition ${isOver ? 'ring-2 ring-brand-500' : ''}`, children: [_jsx("div", { className: "font-semibold mb-2", children: id }), _jsx("div", { className: "space-y-2 min-h-[240px]", children: items.map((d) => _jsx(DealCard, { from: id, id: d }, d)) })] }));
}
function DealCard({ id, from }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, data: { from } });
    const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
    return (_jsx("div", { ref: setNodeRef, style: style, ...listeners, ...attributes, className: `p-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm cursor-grab ${isDragging ? 'opacity-70' : ''}`, children: id }));
}
