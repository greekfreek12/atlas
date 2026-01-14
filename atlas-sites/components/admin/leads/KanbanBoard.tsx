'use client';

import { useState, useCallback } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import LeadCard from './LeadCard';
import type { LeadWithBusiness, LeadStatus } from '@/lib/types';

interface KanbanBoardProps {
  initialLeads: Record<LeadStatus, LeadWithBusiness[]>;
  pipelineMode?: boolean; // If true, excludes 'new' column
}

interface ColumnConfig {
  status: LeadStatus;
  title: string;
  color: string;
}

const COLUMNS: ColumnConfig[] = [
  { status: 'new', title: 'New', color: 'var(--status-new)' },
  { status: 'contacted', title: 'Contacted', color: 'var(--status-contacted)' },
  { status: 'interested', title: 'Interested', color: 'var(--status-interested)' },
  { status: 'demo', title: 'Demo', color: 'var(--status-demo)' },
  { status: 'customer', title: 'Customer', color: 'var(--status-customer)' },
  { status: 'lost', title: 'Lost', color: 'var(--status-lost)' },
];

export default function KanbanBoard({ initialLeads, pipelineMode = false }: KanbanBoardProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [updating, setUpdating] = useState<string | null>(null);

  // Filter columns based on mode
  const columns = pipelineMode
    ? COLUMNS.filter((c) => c.status !== 'new')
    : COLUMNS;

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside of a droppable
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceStatus = source.droppableId as LeadStatus;
    const destStatus = destination.droppableId as LeadStatus;

    // Find the lead being moved
    const leadToMove = leads[sourceStatus].find((l) => l.id === draggableId);
    if (!leadToMove) return;

    // Optimistic update
    setLeads((prev) => {
      const newLeads = { ...prev };

      // Remove from source
      newLeads[sourceStatus] = prev[sourceStatus].filter(
        (l) => l.id !== draggableId
      );

      // Add to destination
      const updatedLead = { ...leadToMove, status: destStatus };
      const destLeads = [...prev[destStatus]];
      destLeads.splice(destination.index, 0, updatedLead);
      newLeads[destStatus] = destLeads;

      return newLeads;
    });

    // If status changed, update in database
    if (sourceStatus !== destStatus) {
      setUpdating(draggableId);

      try {
        const response = await fetch(`/admin/api/leads/${draggableId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: destStatus }),
        });

        if (!response.ok) {
          throw new Error('Failed to update lead');
        }
      } catch (error) {
        console.error('Error updating lead:', error);
        // Revert on error
        setLeads(initialLeads);
      } finally {
        setUpdating(null);
      }
    }
  }, [leads, initialLeads]);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="kanban-board">
        {columns.map((column, columnIndex) => (
          <div
            key={column.status}
            className="kanban-column animate-fade-in"
            data-status={column.status}
            style={{ animationDelay: `${columnIndex * 50}ms` }}
          >
            {/* Column Header */}
            <div className="kanban-column-header">
              <div
                className="kanban-column-dot"
                style={{ background: column.color }}
              />
              <span className="kanban-column-title">{column.title}</span>
              <span className="kanban-column-count">
                {leads[column.status]?.length || 0}
              </span>
            </div>

            {/* Droppable Area */}
            <Droppable droppableId={column.status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`kanban-column-cards ${
                    snapshot.isDraggingOver ? 'drag-over' : ''
                  }`}
                  style={{
                    background: snapshot.isDraggingOver
                      ? `${column.color}08`
                      : undefined,
                  }}
                >
                  {leads[column.status]?.map((lead, index) => (
                    <Draggable
                      key={lead.id}
                      draggableId={lead.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <LeadCard
                            lead={lead}
                            isDragging={snapshot.isDragging}
                            isUpdating={updating === lead.id}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}

                  {/* Empty state */}
                  {(!leads[column.status] || leads[column.status].length === 0) && (
                    <div className="empty-state py-8">
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        style={{ color: column.color, opacity: 0.3 }}
                      >
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      <p className="text-xs text-[var(--admin-text-muted)]">
                        No leads
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
