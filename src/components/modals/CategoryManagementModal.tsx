// ============================================
// Universal Project Manager - Category Management Modal
// ============================================

import { useState } from 'react';
import { theme } from '../../config/theme';
import Modal from '../Modal';
import type { Task } from '../../types';

interface CategoryManagementModalProps {
  show: boolean;
  onClose: () => void;
  categories: string[];
  tasks: Task[];
  onSave: (categories: string[]) => void;
}

const inputStyle = {
  padding: '0.5rem',
  borderRadius: '4px',
  border: `1px solid ${theme.border}`,
  background: theme.bgTertiary,
  color: theme.textPrimary,
  fontSize: '0.9rem',
};

export default function CategoryManagementModal({
  show,
  onClose,
  categories,
  tasks,
  onSave,
}: CategoryManagementModalProps) {
  const [localCategories, setLocalCategories] = useState(categories);
  const [newCategory, setNewCategory] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      alert('Please enter a category name');
      return;
    }
    if (localCategories.includes(newCategory.trim())) {
      alert('This category already exists');
      return;
    }

    setLocalCategories([...localCategories, newCategory.trim()]);
    setNewCategory('');
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(localCategories[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;

    if (!editValue.trim()) {
      alert('Category name cannot be empty');
      return;
    }

    const oldCategory = localCategories[editingIndex];
    const tasksUsingCategory = tasks.filter(task => task.category === oldCategory);

    if (tasksUsingCategory.length > 0) {
      const confirmMsg = `${tasksUsingCategory.length} task(s) use this category. Changing it will affect all these tasks. Continue?`;
      if (!confirm(confirmMsg)) {
        setEditingIndex(null);
        setEditValue('');
        return;
      }
    }

    const newCategories = [...localCategories];
    newCategories[editingIndex] = editValue.trim();
    setLocalCategories(newCategories);
    setEditingIndex(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleDeleteCategory = (index: number) => {
    const categoryToDelete = localCategories[index];
    const tasksInCategory = tasks.filter(task => task.category === categoryToDelete);

    if (tasksInCategory.length > 0) {
      alert(`Cannot delete this category. ${tasksInCategory.length} task(s) are using it.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete the category "${categoryToDelete}"?`)) {
      return;
    }

    const newCategories = localCategories.filter((_, i) => i !== index);
    setLocalCategories(newCategories);
  };

  const handleSave = () => {
    if (localCategories.length === 0) {
      alert('You must have at least one category');
      return;
    }
    onSave(localCategories);
    onClose();
  };

  return (
    <Modal show={show} onClose={onClose} title="🏷️ Manage Categories" width="600px">
      {/* Add New Category */}
      <div style={{
        background: theme.bgTertiary,
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        border: `1px solid ${theme.border}`,
      }}>
        <h4 style={{ margin: '0 0 1rem 0', color: theme.textPrimary }}>Add New Category</h4>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            placeholder="Enter category name..."
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            onClick={handleAddCategory}
            style={{
              padding: '0.5rem 1.5rem',
              background: theme.accentGreen,
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              whiteSpace: 'nowrap',
            }}>
            + Add
          </button>
        </div>
      </div>

      {/* Existing Categories */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: theme.textPrimary }}>Existing Categories</h4>
        {localCategories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: theme.textMuted }}>
            No categories yet. Add one above to get started.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {localCategories.map((category, index) => {
              const taskCount = tasks.filter(task => task.category === category).length;
              const isEditing = editingIndex === index;

              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    background: theme.bgSecondary,
                    borderRadius: '6px',
                    border: `1px solid ${theme.border}`,
                  }}>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                        style={{ ...inputStyle, flex: 1 }}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEdit}
                        style={{
                          padding: '0.5rem 1rem',
                          background: theme.accentGreen,
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '600',
                        }}>
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        style={{
                          padding: '0.5rem 1rem',
                          background: theme.textMuted,
                          color: theme.bgPrimary,
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '600',
                        }}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span style={{ flex: 1, color: theme.textPrimary, fontWeight: '500' }}>
                        {category}
                      </span>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: theme.bgTertiary,
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        color: theme.textSecondary,
                        whiteSpace: 'nowrap',
                      }}>
                        {taskCount} task{taskCount !== 1 ? 's' : ''}
                      </span>
                      <button
                        onClick={() => handleStartEdit(index)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          background: theme.accentBlue,
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '600',
                        }}>
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(index)}
                        disabled={taskCount > 0}
                        style={{
                          padding: '0.5rem 0.75rem',
                          background: taskCount > 0 ? theme.textMuted : theme.accentRed,
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: taskCount > 0 ? 'not-allowed' : 'pointer',
                          fontWeight: '600',
                          opacity: taskCount > 0 ? 0.5 : 1,
                        }}
                        title={taskCount > 0 ? 'Cannot delete category with tasks' : 'Delete category'}>
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button
          onClick={() => {
            setLocalCategories(categories);
            setEditingIndex(null);
            setEditValue('');
            onClose();
          }}
          style={{
            padding: '0.75rem 1.5rem',
            background: theme.textMuted,
            color: theme.bgPrimary,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
          }}>
          Cancel
        </button>
        <button
          onClick={handleSave}
          style={{
            padding: '0.75rem 1.5rem',
            background: theme.accentBlue,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
          }}>
          Save Changes
        </button>
      </div>
    </Modal>
  );
}
