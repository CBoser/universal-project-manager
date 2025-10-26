// ============================================
// Universal Project Manager - CSV Import Utility
// ============================================

import type { Task } from '../types';

/**
 * Detect delimiter (comma or tab)
 */
function detectDelimiter(csvText: string): string {
  // Take first few non-empty lines
  const lines = csvText.split('\n').filter(l => l.trim()).slice(0, 5);

  let commaCount = 0;
  let tabCount = 0;

  for (const line of lines) {
    commaCount += (line.match(/,/g) || []).length;
    tabCount += (line.match(/\t/g) || []).length;
  }

  // Return tab if more tabs than commas, otherwise comma
  return tabCount > commaCount ? '\t' : ',';
}

/**
 * Parse CSV file and convert to tasks
 */
export function parseCSV(csvText: string): Task[] {
  // Remove BOM (Byte Order Mark) if present
  const cleanText = csvText.replace(/^\uFEFF/, '');
  const lines = cleanText.split('\n').map(line => line.trim());
  const tasks: Task[] = [];

  // Detect delimiter (comma or tab)
  const delimiter = detectDelimiter(cleanText);
  console.log('Detected CSV delimiter:', delimiter === '\t' ? 'TAB' : 'COMMA');

  // Find header row (should contain "Task" column)
  let headerIndex = 0;
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    if (lines[i].toLowerCase().includes('task')) {
      headerIndex = i;
      break;
    }
  }

  // Parse header to get column indices
  const header = parseCSVLine(lines[headerIndex], delimiter);
  console.log('CSV Header columns:', header);

  const columnMap = {
    task: findColumnIndex(header, ['task', 'name', 'title']),
    phase: findColumnIndex(header, ['phase', 'stage']),
    category: findColumnIndex(header, ['category', 'type']),
    estHours: findColumnIndex(header, ['estimated hours', 'est hours', 'estimate']),
    actualHours: findColumnIndex(header, ['actual hours', 'actual']),
    status: findColumnIndex(header, ['status', 'state']),
    notes: findColumnIndex(header, ['notes', 'note', 'description']),
  };

  console.log('Column mapping results:');

  // Validate that we found the required columns
  if (columnMap.task < 0) {
    console.error('ERROR: Could not find Task column in CSV. Please ensure your CSV has a column named "Task", "Name", or "Title"');
    throw new Error('CSV must have a Task/Name/Title column');
  }

  // Parse data rows
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const values = parseCSVLine(line, delimiter);
    if (values.length < 2) continue; // Skip empty or invalid rows

    // Get values, handling -1 (not found) column indices
    const taskValue = values[columnMap.task] || '';
    const phaseValue = columnMap.phase >= 0 ? values[columnMap.phase] : '';
    const categoryValue = columnMap.category >= 0 ? values[columnMap.category] : '';
    const estHoursValue = columnMap.estHours >= 0 ? values[columnMap.estHours] : '';
    const actualHoursValue = columnMap.actualHours >= 0 ? values[columnMap.actualHours] : '';
    const statusValue = columnMap.status >= 0 ? values[columnMap.status] : '';
    // const notesValue = columnMap.notes >= 0 ? values[columnMap.notes] : '';  // Reserved for future use

    const parsedEstHours = parseFloat(estHoursValue);
    // const parsedActualHours = parseFloat(actualHoursValue);  // Reserved for future use

    console.log(`Row ${i}:`, {
      task: taskValue,
      phase: phaseValue,
      category: categoryValue,
      estHours: estHoursValue,
      actualHours: actualHoursValue,
      status: statusValue,
    });

    // Skip rows where task is empty
    if (!taskValue.trim()) {
      console.log(`  Skipping row ${i}: empty task`);
      continue;
    }

    const task: Task = {
      id: `import_${Date.now()}_${i}`,
      task: taskValue,
      phase: (phaseValue || 'imported').toLowerCase().replace(/\s+/g, '_'),
      phaseTitle: phaseValue || 'Imported',
      category: categoryValue || 'Other',
      baseEstHours: parsedEstHours || 0,
      adjustedEstHours: parsedEstHours || 0,
    };

    tasks.push(task);
  }

  console.log(`Imported ${tasks.length} tasks`);
  return tasks;
}

/**
 * Parse a single CSV line handling quoted fields and custom delimiter
 */
function parseCSVLine(line: string, delimiter: string = ','): string[] {
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
    } else if (char === delimiter && !inQuotes) {
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
 * Prioritizes exact matches, then partial matches
 */
function findColumnIndex(header: string[], possibleNames: string[]): number {
  const normalizedHeader = header.map(h => h.toLowerCase().trim());

  // First pass: exact matches
  for (let i = 0; i < normalizedHeader.length; i++) {
    if (possibleNames.some(name => normalizedHeader[i] === name)) {
      console.log(`  Found exact match for "${possibleNames[0]}" at index ${i}: "${header[i]}"`);
      return i;
    }
  }

  // Second pass: partial matches
  for (let i = 0; i < normalizedHeader.length; i++) {
    if (possibleNames.some(name => normalizedHeader[i].includes(name))) {
      console.log(`  Found partial match for "${possibleNames[0]}" at index ${i}: "${header[i]}"`);
      return i;
    }
  }

  console.log(`  No match found for "${possibleNames[0]}"`);
  return -1; // Return -1 if not found
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

  // Detect delimiter
  const delimiter = detectDelimiter(cleanText);

  // Find header row (search first 10 lines, same as parseCSV)
  let headerFound = false;
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const header = parseCSVLine(lines[i], delimiter);
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
