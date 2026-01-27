import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, User, Mail, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Status column configuration - Must match backend enum values
const STATUS_COLUMNS = [
    { id: 'lead', title: 'Lead', color: 'bg-purple-500', bgLight: 'bg-purple-50', border: 'border-purple-200' },
    { id: 'draft', title: 'Draft', color: 'bg-slate-500', bgLight: 'bg-slate-50', border: 'border-slate-200' },
    { id: 'submitted', title: 'Submitted', color: 'bg-blue-500', bgLight: 'bg-blue-50', border: 'border-blue-200' },
    { id: 'verified', title: 'Verified', color: 'bg-emerald-500', bgLight: 'bg-emerald-50', border: 'border-emerald-200' },
    { id: 'rejected', title: 'Rejected', color: 'bg-red-500', bgLight: 'bg-red-50', border: 'border-red-200' },
];

export default function StudentKanban({ students, onStatusChange, isUpdating }) {
    const navigate = useNavigate();

    // Group students by status
    const groupedStudents = STATUS_COLUMNS.reduce((acc, col) => {
        acc[col.id] = students?.filter(s => s.profileStatus === col.id) || [];
        return acc;
    }, {});

    const handleDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        // Dropped outside a droppable area
        if (!destination) return;

        // Dropped in the same position
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        // Find the student that was dragged
        const student = students.find(s => s._id === draggableId);
        if (!student) return;

        // Get the new status from the destination column
        const newStatus = destination.droppableId;

        // If status changed, trigger the update
        if (student.profileStatus !== newStatus) {
            onStatusChange(student._id, newStatus);
        }
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                {STATUS_COLUMNS.map((column) => (
                    <div key={column.id} className="flex-shrink-0 w-72">
                        {/* Column Header */}
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-t-lg ${column.bgLight} ${column.border} border-b-0`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
                            <span className="font-semibold text-slate-700 text-sm">{column.title}</span>
                            <span className="ml-auto bg-white/80 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                {groupedStudents[column.id]?.length || 0}
                            </span>
                        </div>

                        {/* Droppable Column */}
                        <Droppable droppableId={column.id}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`min-h-[400px] p-2 rounded-b-lg border ${column.border} transition-colors ${snapshot.isDraggingOver ? `${column.bgLight}` : 'bg-slate-50/50'
                                        }`}
                                >
                                    {groupedStudents[column.id]?.map((student, index) => (
                                        <Draggable key={student._id} draggableId={student._id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`bg-white rounded-lg p-3 mb-2 border border-slate-200 shadow-sm hover:shadow-md transition-all group ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary-500/20 rotate-2' : ''
                                                        } ${isUpdating === student._id ? 'opacity-50 pointer-events-none' : ''}`}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        {/* Drag Handle */}
                                                        <div
                                                            {...provided.dragHandleProps}
                                                            className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing mt-0.5"
                                                        >
                                                            <GripVertical size={16} />
                                                        </div>

                                                        {/* Student Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                                    {student.personalInfo?.firstName?.[0] || '?'}
                                                                </div>
                                                                <span className="font-semibold text-slate-800 text-sm truncate">
                                                                    {student.personalInfo?.firstName} {student.personalInfo?.lastName}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-xs text-slate-500 truncate ml-9">
                                                                <Mail size={12} />
                                                                <span className="truncate">{student.personalInfo?.email}</span>
                                                            </div>
                                                        </div>

                                                        {/* View Button */}
                                                        <button
                                                            onClick={() => navigate(`/dashboard/student/${student._id}`)}
                                                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary-600 p-1 rounded hover:bg-primary-50 transition-all"
                                                            title="View Profile"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                    </div>

                                                    {/* Optional: Show last updated */}
                                                    {student.updatedAt && (
                                                        <div className="text-[10px] text-slate-400 mt-2 ml-9">
                                                            Updated: {new Date(student.updatedAt).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}

                                    {/* Empty State */}
                                    {groupedStudents[column.id]?.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                                            <User size={24} className="mb-2 opacity-50" />
                                            <span className="text-xs">No students</span>
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
