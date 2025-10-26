import { useState, useEffect, useRef } from 'react';

interface Note {
  id: string;
  text: string;
  timestamp: string;
  page: string;
  priority: 'low' | 'medium' | 'high';
  category: 'idea' | 'bug' | 'todo' | 'improvement';
}

interface Position {
  x: number;
  y: number;
}

type DockPosition = 'floating' | 'bottom' | 'right' | 'left';

const DevNotes = () => {
  // Only render in development
  if (import.meta.env.PROD) return null;

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('dev-notes');
    return saved ? JSON.parse(saved) : [];
  });

  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('dev-notes-open');
    return saved === 'true';
  });

  const [dockPosition, setDockPosition] = useState<DockPosition>(() => {
    const saved = localStorage.getItem('dev-notes-dock');
    return (saved as DockPosition) || 'floating';
  });

  const [position, setPosition] = useState<Position>(() => {
    const saved = localStorage.getItem('dev-notes-position');
    return saved ? JSON.parse(saved) : { x: window.innerWidth - 420, y: 100 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [newNote, setNewNote] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Note['priority']>('medium');
  const [selectedCategory, setSelectedCategory] = useState<Note['category']>('idea');
  const [filter, setFilter] = useState<string>('all');

  const panelRef = useRef<HTMLDivElement>(null);
  const currentPath = window.location.pathname;

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem('dev-notes', JSON.stringify(notes));
  }, [notes]);

  // Save open state
  useEffect(() => {
    localStorage.setItem('dev-notes-open', String(isOpen));
  }, [isOpen]);

  // Save dock position
  useEffect(() => {
    localStorage.setItem('dev-notes-dock', dockPosition);
  }, [dockPosition]);

  // Save floating position
  useEffect(() => {
    if (dockPosition === 'floating') {
      localStorage.setItem('dev-notes-position', JSON.stringify(position));
    }
  }, [position, dockPosition]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (dockPosition !== 'floating') return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || dockPosition !== 'floating') return;
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, dockPosition]);

  const addNote = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      text: newNote,
      timestamp: new Date().toISOString(),
      page: currentPath,
      priority: selectedPriority,
      category: selectedCategory,
    };

    setNotes([...notes, note]);
    setNewNote('');
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const clearAllNotes = () => {
    if (confirm('Clear all notes? This cannot be undone.')) {
      setNotes([]);
    }
  };

  const exportToMarkdown = () => {
    const grouped = notes.reduce((acc, note) => {
      if (!acc[note.page]) acc[note.page] = [];
      acc[note.page].push(note);
      return acc;
    }, {} as Record<string, Note[]>);

    let markdown = `# Development Session Notes - ${new Date().toLocaleDateString()}\n\n`;

    Object.entries(grouped).forEach(([page, pageNotes]) => {
      markdown += `## ${page}\n\n`;
      pageNotes.forEach(note => {
        const checkbox = note.category === 'todo' ? '- [ ]' : '-';
        const priority = note.priority === 'high' ? '🔴' : note.priority === 'medium' ? '🟡' : '🟢';
        markdown += `${checkbox} ${priority} [${note.category.toUpperCase()}] ${note.text}\n`;
        markdown += `  *Added: ${new Date(note.timestamp).toLocaleString()}*\n\n`;
      });
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dev-notes-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToGitHub = () => {
    const grouped = notes.reduce((acc, note) => {
      if (!acc[note.page]) acc[note.page] = [];
      acc[note.page].push(note);
      return acc;
    }, {} as Record<string, Note[]>);

    let issuesText = '# GitHub Issues Template\n\n';
    issuesText += 'Copy each section below into a new GitHub issue:\n\n---\n\n';

    Object.entries(grouped).forEach(([page, pageNotes]) => {
      issuesText += `## Issue: Feature Ideas for ${page}\n\n`;
      issuesText += `**Labels:** enhancement, dev-notes\n\n`;
      issuesText += `**Description:**\n\n`;
      pageNotes.forEach(note => {
        const priority = note.priority === 'high' ? '🔴 HIGH' : note.priority === 'medium' ? '🟡 MEDIUM' : '🟢 LOW';
        issuesText += `- [${note.category.toUpperCase()}] ${priority}: ${note.text}\n`;
        issuesText += `  - Noted on: ${new Date(note.timestamp).toLocaleString()}\n\n`;
      });
      issuesText += `---\n\n`;
    });

    const blob = new Blob([issuesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `github-issues-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredNotes = notes.filter(note => {
    if (filter === 'all') return true;
    if (filter === 'current') return note.page === currentPath;
    return note.category === filter;
  });

  // Position styling based on dock position
  const getPositionStyle = () => {
    switch (dockPosition) {
      case 'bottom':
        return {
          position: 'fixed' as const,
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: '300px',
        };
      case 'right':
        return {
          position: 'fixed' as const,
          top: 0,
          right: 0,
          width: '400px',
          height: '100vh',
        };
      case 'left':
        return {
          position: 'fixed' as const,
          top: 0,
          left: 0,
          width: '400px',
          height: '100vh',
        };
      case 'floating':
      default:
        return {
          position: 'fixed' as const,
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '400px',
          height: '500px',
        };
    }
  };

  const getCategoryIcon = (category: Note['category']) => {
    switch (category) {
      case 'idea': return '💡';
      case 'bug': return '🐛';
      case 'todo': return '✓';
      case 'improvement': return '⚡';
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '9999px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          zIndex: 9999,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
        title="Open Developer Notes"
      >
        📝 Dev Notes {notes.length > 0 && `(${notes.length})`}
      </button>
    );
  }

  return (
    <div
      ref={panelRef}
      style={{
        ...getPositionStyle(),
        backgroundColor: '#111827',
        color: 'white',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #374151',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 9999,
      }}
    >
      {/* Header */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          backgroundColor: '#1f2937',
          padding: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: dockPosition === 'floating' ? 'move' : 'default',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 'bold' }}>📝 Dev Notes</span>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>({filteredNotes.length})</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Dock Position Controls */}
          <select
            value={dockPosition}
            onChange={(e) => setDockPosition(e.target.value as DockPosition)}
            style={{
              backgroundColor: '#374151',
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #4b5563',
              color: 'white',
              cursor: 'pointer',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="floating">Float</option>
            <option value="bottom">Dock Bottom</option>
            <option value="right">Dock Right</option>
            <option value="left">Dock Left</option>
          </select>

          <button
            onClick={() => setIsOpen(false)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        padding: '8px 12px',
        backgroundColor: '#1a1f2e',
        borderBottom: '1px solid #374151',
        display: 'flex',
        gap: '8px',
        fontSize: '12px',
      }}>
        {['all', 'current', 'idea', 'todo', 'bug'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: filter === f ? '#2563eb' : '#374151',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              if (filter !== f) e.currentTarget.style.backgroundColor = '#4b5563';
            }}
            onMouseLeave={(e) => {
              if (filter !== f) e.currentTarget.style.backgroundColor = '#374151';
            }}
          >
            {f === 'all' ? 'All' :
             f === 'current' ? 'This Page' :
             f === 'idea' ? '💡 Ideas' :
             f === 'todo' ? '✓ Todos' : '🐛 Bugs'}
          </button>
        ))}
      </div>

      {/* Notes List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {filteredNotes.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#6b7280',
            marginTop: '32px',
          }}>
            No notes yet. Add one below!
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div key={note.id} style={{
              backgroundColor: '#1f2937',
              padding: '12px',
              borderRadius: '4px',
              border: '1px solid #374151',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{getCategoryIcon(note.category)}</span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: note.priority === 'high' ? '#ef4444' :
                           note.priority === 'medium' ? '#eab308' : '#22c55e',
                  }}>
                    {note.priority.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  style={{
                    color: '#f87171',
                    fontSize: '12px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#fca5a5'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#f87171'}
                >
                  Delete
                </button>
              </div>

              <p style={{ fontSize: '14px', marginBottom: '8px' }}>{note.text}</p>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
                color: '#9ca3af',
              }}>
                <span>{note.page}</span>
                <span>{new Date(note.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Note Form */}
      <div style={{
        borderTop: '1px solid #374151',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as Note['category'])}
            style={{
              backgroundColor: '#1f2937',
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #4b5563',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            <option value="idea">💡 Idea</option>
            <option value="todo">✓ Todo</option>
            <option value="bug">🐛 Bug</option>
            <option value="improvement">⚡ Improvement</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as Note['priority'])}
            style={{
              backgroundColor: '#1f2937',
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #4b5563',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
          </select>
        </div>

        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              addNote();
            }
          }}
          placeholder="Add a note... (Ctrl+Enter to save)"
          style={{
            width: '100%',
            backgroundColor: '#1f2937',
            fontSize: '14px',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #4b5563',
            color: 'white',
            outline: 'none',
            resize: 'none',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#4b5563'}
          rows={3}
        />

        <button
          onClick={addNote}
          style={{
            backgroundColor: '#2563eb',
            fontSize: '14px',
            padding: '8px',
            borderRadius: '4px',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
        >
          Add Note
        </button>
      </div>

      {/* Export Footer */}
      <div style={{
        borderTop: '1px solid #374151',
        padding: '8px',
        display: 'flex',
        gap: '8px',
        backgroundColor: '#1a1f2e',
      }}>
        <button
          onClick={exportToMarkdown}
          style={{
            flex: 1,
            backgroundColor: '#16a34a',
            fontSize: '12px',
            padding: '8px',
            borderRadius: '4px',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
          title="Export as Markdown"
        >
          📄 MD
        </button>
        <button
          onClick={exportToGitHub}
          style={{
            flex: 1,
            backgroundColor: '#9333ea',
            fontSize: '12px',
            padding: '8px',
            borderRadius: '4px',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7e22ce'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#9333ea'}
          title="Export GitHub Issues Template"
        >
          🐙 GitHub
        </button>
        <button
          onClick={clearAllNotes}
          style={{
            flex: 1,
            backgroundColor: '#dc2626',
            fontSize: '12px',
            padding: '8px',
            borderRadius: '4px',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
          title="Clear All Notes"
        >
          🗑️ Clear
        </button>
      </div>
    </div>
  );
};

export default DevNotes;
