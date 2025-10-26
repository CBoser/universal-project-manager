// ============================================
// Universal Project Manager - CSV Import Utility
// ============================================

import type { Task } from '../types';

/**
 * Parse CSV file and convert to tasks
 */
export function parseCSV(csvText: string): Task[] {
  // Remove BOM (Byte Order Mark) if present
  const cleanText = csvText.replace(/^\uFEFF/, '');
  const lines = cleanText.split('\n').map(line => line.trim());
  const tasks: Task[] = [];

  // Find header row (should contain "Task" column)
  let headerIndex = 0;
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    if (lines[i].toLowerCase().includes('task')) {
      headerIndex = i;
      break;
    }
  }

  // Parse header to get column indices
  const header = parseCSVLine(lines[headerIndex]);
  const columnMap = {
    task: findColumnIndex(header, ['task', 'name', 'title']),
    phase: findColumnIndex(header, ['phase', 'stage']),
    category: findColumnIndex(header, ['category', 'type']),
    estHours: findColumnIndex(header, ['estimated hours', 'estimate', 'hours', 'est hours', 'estimated']),
  };

  // Parse data rows
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const values = parseCSVLine(line);
    if (values.length < 2) continue; // Skip empty or invalid rows

    const task: Task = {
      id: `import_${Date.now()}_${i}`,
      task: values[columnMap.task] || `Task ${i}`,
      phase: (values[columnMap.phase] || 'imported').toLowerCase().replace(/\s+/g, '_'),
      phaseTitle: values[columnMap.phase] || 'Imported',
      category: values[columnMap.category] || 'Other',
      baseEstHours: parseFloat(values[columnMap.estHours]) || 0,
      adjustedEstHours: parseFloat(values[columnMap.estHours]) || 0,
    };

    tasks.push(task);
  }

  return tasks;
}

/**
 * Parse a single CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());

  return result;
}

/**
 * Find column index by matching against possible names
 */
function findColumnIndex(header: string[], possibleNames: string[]): number {
  for (let i = 0; i < header.length; i++) {
    const col = header[i].toLowerCase().trim();
    if (possibleNames.some(name => col.includes(name))) {
      return i;
    }
  }
  return 0; // Default to first column if not found
}

/**
 * Validate CSV structure
 */
export function validateCSV(csvText: string): { valid: boolean; error?: string } {
  // Remove BOM if present
  const cleanText = csvText.replace(/^\uFEFF/, '');
  const lines = cleanText.split('\n').map(line => line.trim()).filter(line => line);

  if (lines.length < 2) {
    return { valid: false, error: 'CSV must have at least a header row and one data row' };
  }

  // Find header row (search first 10 lines, same as parseCSV)
  let headerFound = false;
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const header = parseCSVLine(lines[i]);
    if (header.some(col => col.toLowerCase().trim().includes('task'))) {
      headerFound = true;
      break;
    }
  }

  if (!headerFound) {
    return { valid: false, error: 'CSV must have a "Task" column (searched first 10 lines)' };
  }

  return { valid: true };
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
