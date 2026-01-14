'use client';

import { useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { SectionConfig } from '@/lib/site-config/types';
import { getSectionMetadata } from '@/lib/site-config/registry';
import {
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Image,
  Star,
  Phone,
  Shield,
  Briefcase,
  MessageSquare,
} from 'lucide-react';
import { AddSectionModal } from './AddSectionModal';

interface SectionListProps {
  sections: SectionConfig[];
  selectedSectionId: string | null;
  onSectionSelect: (sectionId: string) => void;
  onSectionsReorder: (sections: SectionConfig[]) => void;
  onSectionAdd: (section: SectionConfig, position?: number) => void;
  onSectionDelete: (sectionId: string) => void;
}

// Icon mapping for section types
const sectionIcons: Record<string, React.ReactNode> = {
  hero: <Image className="w-4 h-4" />,
  'trust-bar': <Shield className="w-4 h-4" />,
  services: <Briefcase className="w-4 h-4" />,
  reviews: <Star className="w-4 h-4" />,
  cta: <Phone className="w-4 h-4" />,
  'contact-form': <MessageSquare className="w-4 h-4" />,
};

export function SectionList({
  sections,
  selectedSectionId,
  onSectionSelect,
  onSectionsReorder,
  onSectionAdd,
  onSectionDelete,
}: SectionListProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onSectionsReorder(items);
  };

  const handleToggleEnabled = (sectionId: string, currentEnabled: boolean) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section) {
      const updatedSections = sections.map((s) =>
        s.id === sectionId ? { ...s, enabled: !currentEnabled } : s
      );
      onSectionsReorder(updatedSections);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex-1 overflow-y-auto p-2 space-y-1"
            >
              {sections.map((section, index) => {
                const metadata = getSectionMetadata(section.type);
                const icon = sectionIcons[section.type] || (
                  <div className="w-4 h-4 bg-zinc-600 rounded" />
                );

                return (
                  <Draggable
                    key={section.id}
                    draggableId={section.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`group flex items-center gap-2 p-2 rounded-lg transition-all cursor-pointer ${
                          selectedSectionId === section.id
                            ? 'bg-blue-600/20 ring-1 ring-blue-500'
                            : snapshot.isDragging
                            ? 'bg-zinc-700 shadow-lg'
                            : 'bg-zinc-800/50 hover:bg-zinc-800'
                        } ${!section.enabled ? 'opacity-50' : ''}`}
                        onClick={() => onSectionSelect(section.id)}
                      >
                        {/* Drag handle */}
                        <div
                          {...provided.dragHandleProps}
                          className="text-zinc-500 hover:text-zinc-300 cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>

                        {/* Section icon */}
                        <div className="text-zinc-400">{icon}</div>

                        {/* Section info */}
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium truncate">
                            {metadata?.label || section.type}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleEnabled(section.id, section.enabled);
                            }}
                            className="p-1 text-zinc-400 hover:text-white rounded transition-colors"
                            title={section.enabled ? 'Hide section' : 'Show section'}
                          >
                            {section.enabled ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                confirm(
                                  'Are you sure you want to delete this section?'
                                )
                              ) {
                                onSectionDelete(section.id);
                              }
                            }}
                            className="p-1 text-zinc-400 hover:text-red-400 rounded transition-colors"
                            title="Delete section"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add section button */}
      <div className="p-3 border-t border-zinc-800">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </button>
      </div>

      {/* Add section modal */}
      {showAddModal && (
        <AddSectionModal
          onAdd={(section) => {
            onSectionAdd(section);
            setShowAddModal(false);
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
