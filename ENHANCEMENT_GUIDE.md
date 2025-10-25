# Universal Project Manager - Enhancement Guide
## Incorporating Features from Previous Tracker

This document outlines how to enhance the Universal Project Manager with the best features from your previous Planswift tracker while maintaining AI capabilities.

## 🎯 Features to Add

### 1. **Drag-and-Drop Task Reordering with Undo**
- Allow users to drag tasks to reorder them
- Track move history
- Provide "Undo Move" button
- Store move history in localStorage

**Implementation:**
```typescript
// Add to App.tsx state
const [draggedTask, setDraggedTask] = useState(null);
const [moveHistory, setMoveHistory] = useState([]);

// Drag handlers
const handleDragStart = (e, task) => {
  setDraggedTask(task);
  e.dataTransfer.effectAllowed = 'move';
};

const handleDrop = (e, targetTask) => {
  e.preventDefault();
  if (!draggedTask || draggedTask.id === targetTask.id) return;

  // Save current state to history
  setMoveHistory(prev => [...prev, { tasks: [...tasks], timestamp: Date.now() }]);

  // Reorder tasks
  const dragIndex = tasks.findIndex(t => t.id === draggedTask.id);
  const targetIndex = tasks.findIndex(t => t.id === targetTask.id);
  const newTasks = [...tasks];
  const [removed] = newTasks.splice(dragIndex, 1);
  newTasks.splice(targetIndex, 0, removed);
  setTasks(newTasks);
};

const undoMove = () => {
  if (moveHistory.length === 0) return;
  const lastState = moveHistory[moveHistory.length - 1];
  setTasks(lastState.tasks);
  setMoveHistory(prev => prev.slice(0, -1));
};
```

### 2. **Inline Editing in Task Table**
Replace static display with inline inputs for:
- Status (dropdown)
- Actual Hours (number input)
- Notes (text input)
- Checkbox for completion

**Implementation:**
```typescript
<td>
  <select
    value={taskStates[task.id]?.status || 'pending'}
    onChange={(e) => updateTaskState(task.id, 'status', e.target.value)}
    style={{...inputStyle}}>
    <option value="pending">Pending</option>
    <option value="in-progress">In Progress</option>
    <option value="complete">Complete</option>
    <option value="blocked">Blocked</option>
  </select>
</td>

<td>
  <input
    type="number"
    value={taskStates[task.id]?.actualHours || ''}
    onChange={(e) => updateTaskState(task.id, 'actualHours', e.target.value)}
    placeholder="0"
    style={{...inputStyle, width: '70px'}}
  />
</td>

<td>
  <input
    type="text"
    value={taskStates[task.id]?.notes || ''}
    onChange={(e) => updateTaskState(task.id, 'notes', e.target.value)}
    placeholder="Add notes..."
    style={{...inputStyle}}
  />
</td>
```

### 3. **Phase Tabs with Task Counts**
Add visual navigation between phases with task counts.

**Implementation:**
```typescript
// Get unique phases
const phases = [...new Set(tasks.map(t => t.phase))].sort();

// Phase tabs component
<div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem', borderBottom: `2px solid ${theme.border}`, paddingBottom: '1rem' }}>
  <button
    onClick={() => setCurrentTab('all')}
    style={{
      background: currentTab === 'all' ? theme.accentBlue : 'transparent',
      color: currentTab === 'all' ? '#fff' : theme.textMuted,
      ...buttonStyle
    }}>
    All Tasks ({tasks.length})
  </button>

  {phases.map(phase => {
    const phaseTaskCount = tasks.filter(t => t.phase === phase).length;
    return (
      <button
        key={phase}
        onClick={() => setCurrentTab(phase)}
        style={{
          background: currentTab === phase ? phaseColors[phase] : 'transparent',
          ...buttonStyle
        }}>
        {phaseNameMap[phase]} ({phaseTaskCount})
      </button>
    );
  })}
</div>

// Filter tasks by current tab
const filteredTasks = tasks.filter(task => {
  if (currentTab !== 'all' && task.phase !== currentTab) return false;
  return true;
});
```

### 4. **Project Info Modal**
Modal for editing project metadata.

**Create:** `src/components/modals/ProjectInfoModal.tsx`
```typescript
interface ProjectInfoModalProps {
  show: boolean;
  onClose: () => void;
  projectMeta: ProjectMeta;
  onUpdate: (meta: ProjectMeta) => void;
}

export default function ProjectInfoModal({ show, onClose, projectMeta, onUpdate }: ProjectInfoModalProps) {
  const [editedMeta, setEditedMeta] = useState(projectMeta);

  const handleSave = () => {
    onUpdate(editedMeta);
    onClose();
  };

  return (
    <Modal show={show} onClose={onClose} title="Edit Project Information">
      <div style={{ marginBottom: '1rem' }}>
        <label>Project Name</label>
        <input
          value={editedMeta.name}
          onChange={(e) => setEditedMeta(prev => ({ ...prev, name: e.target.value }))}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Project Lead</label>
        <input
          value={editedMeta.lead}
          onChange={(e) => setEditedMeta(prev => ({ ...prev, lead: e.target.value }))}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label>Description</label>
        <textarea
          value={editedMeta.description}
          onChange={(e) => setEditedMeta(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
          style={inputStyle}
        />
      </div>

      <button onClick={handleSave} style={buttonStyle}>
        Save Changes
      </button>
    </Modal>
  );
}
```

### 5. **Phase Management Modal**
Add/edit/delete phases with color picker.

**Create:** `src/components/modals/PhaseManagementModal.tsx`

Features:
- Add new phase (ID, title, color)
- Edit existing phases
- Delete phases (with validation - can't delete if has tasks)
- List all phases with edit buttons
- Color picker for visual customization

### 6. **Category Management Modal**
Add/edit/delete categories.

**Create:** `src/components/modals/CategoryManagementModal.tsx`

Features:
- Add new category
- Edit category name
- Delete category (with validation)
- List all categories

### 7. **CSV Import Modal**
Import tasks from CSV with proper parsing.

**Create:** `src/components/modals/ImportModal.tsx`

Features:
- Textarea for CSV paste
- Column header detection
- Validation
- Preview before import
- Format: task,phase,phaseTitle,category,estHours

Example CSV:
```
task,phase,category,estHours
Design mockups,planning,Design,8
Develop API,development,Development,24
```

### 8. **Saved Reports History**
Track and display historical reports.

**Create:** `src/components/modals/ReportsHistoryModal.tsx`

Features:
- Save snapshot when exporting
- Display list of past reports
- Show key metrics (completion %, hours, date)
- Compare reports over time

**Implementation:**
```typescript
// When exporting, save report
const exportData = () => {
  // ... existing export logic

  const reportSnapshot = {
    id: Date.now(),
    date: new Date().toISOString(),
    stats: stats,
    tasksCount: tasks.length,
    completedCount: stats.overall.completed,
  };

  setSavedReports(prev => [...prev, reportSnapshot]);
};
```

### 9. **Enhanced Filtering**
Add status filter dropdown and search.

**Implementation:**
```typescript
const [statusFilter, setStatusFilter] = useState('');
const [searchTerm, setSearchTerm] = useState('');

const filteredTasks = tasks.filter(task => {
  // Phase filter
  if (currentTab !== 'all' && task.phase !== currentTab) return false;

  // Status filter
  if (statusFilter && taskStates[task.id]?.status !== statusFilter) return false;

  // Search filter
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    return task.task.toLowerCase().includes(searchLower) ||
           (taskStates[task.id]?.notes || '').toLowerCase().includes(searchLower);
  }

  return true;
});
```

### 10. **Edit/Delete Task Buttons**
Add action buttons to each task row.

**Implementation:**
```typescript
<td className="no-print">
  <div style={{ display: 'flex', gap: '0.5rem' }}>
    <button
      onClick={() => handleEditTask(task)}
      style={{ ...buttonStyle, background: theme.accentBlue }}>
      Edit
    </button>
    <button
      onClick={() => handleDeleteTask(task.id)}
      style={{ ...buttonStyle, background: theme.accentRed }}>
      Delete
    </button>
  </div>
</td>
```

## 📋 Implementation Checklist

### Phase 1: Core Table Enhancements
- [ ] Add drag-and-drop handlers to task rows
- [ ] Implement move history and undo
- [ ] Replace static cells with inline inputs
- [ ] Add Edit/Delete buttons column

### Phase 2: Navigation & Filtering
- [ ] Create phase tabs component
- [ ] Add status filter dropdown
- [ ] Add search input
- [ ] Implement filtering logic

### Phase 3: Management Modals
- [ ] Create ProjectInfoModal
- [ ] Create PhaseManagementModal
- [ ] Create CategoryManagementModal
- [ ] Create EditTaskModal
- [ ] Create ImportModal
- [ ] Create ReportsHistoryModal

### Phase 4: State Management
- [ ] Add states for all modals
- [ ] Add draggedTask state
- [ ] Add moveHistory state
- [ ] Add savedReports state
- [ ] Add currentTab state
- [ ] Add statusFilter state
- [ ] Add searchTerm state

### Phase 5: Integration & Testing
- [ ] Wire up all modals to App
- [ ] Test drag-and-drop
- [ ] Test undo functionality
- [ ] Test inline editing
- [ ] Test all filters
- [ ] Test CSV import
- [ ] Test reports history

## 🎨 UI Updates

### Action Buttons Order (as requested)
```
1. 💾 Save Progress
2. 🖨️ Print
3. 📊 Export Report
4. 📈 View Reports (new)
5. 📥 Import Tasks
6. ➕ Add/Revise Tasks
7. 🔢 Add/Revise Phase
8. 🏷️ Add/Revise Category
9. 🤖 AI Project Setup (keep prominent)
10. 👤 Experience Level
11. ↶ Undo Move (conditional, only when history exists)
```

### Table Enhancements
- Add `draggable` attribute to rows
- Add drag event handlers
- Make cursor: 'move' on hover
- Add opacity change during drag
- Add Edit/Delete column (no-print class)

## 💾 Storage Updates

Update localStorage structure:
```typescript
{
  tasks: Task[],
  taskStates: { [key: string]: TaskState },
  projectMeta: ProjectMeta,
  phaseColors: { [key: string]: string },
  customPhases: { [key: string]: string },
  customCategories: string[],
  moveHistory: Array<{ tasks: Task[], timestamp: number }>,
  savedReports: Array<ReportSnapshot>,
  timestamp: string
}
```

## 🔄 Migration Strategy

For users with existing data:
1. Load existing data
2. Add default values for new fields
3. Migrate gracefully without data loss

```typescript
const savedData = storageService.load();
if (savedData) {
  // Existing fields
  setTasks(savedData.tasks || INITIAL_DELIVERABLES);
  setTaskStates(savedData.taskStates || {});
  setProjectMeta(savedData.projectMeta || DEFAULT_PROJECT_META);
  setPhaseColors(savedData.phaseColors || {});

  // New fields with defaults
  setCustomPhases(savedData.customPhases || {});
  setCustomCategories(savedData.customCategories || []);
  setMoveHistory(savedData.moveHistory || []);
  setSavedReports(savedData.savedReports || []);
}
```

## 🚀 Quick Start for Implementation

1. **Start with inline editing** - Easiest win, immediate value
2. **Add phase tabs** - Better navigation
3. **Implement drag-and-drop** - Most visible feature
4. **Create modals one by one** - Systematic approach
5. **Test thoroughly** - Ensure no regressions

## 📝 Notes

- Keep AI features prominent (don't hide them)
- Maintain the modern dark theme
- Ensure print styles still work
- Test with large datasets (100+ tasks)
- Consider performance for drag-and-drop
- Add loading states where needed

## 🎯 Priority Order

**High Priority (Do First):**
1. Inline editing in table
2. Phase tabs navigation
3. Edit/Delete task buttons
4. Status filter

**Medium Priority:**
5. Drag-and-drop with undo
6. Project info modal
7. CSV import

**Lower Priority (Nice to Have):**
8. Phase management
9. Category management
10. Reports history

This keeps the development manageable while delivering the most impactful features first.
