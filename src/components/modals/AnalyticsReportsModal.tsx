// ============================================
// Universal Project Manager - Analytics & Reports Modal
// ============================================

import { theme } from '../../config/theme';
import Modal from '../Modal';
import type { Task, TaskState, ProjectMeta } from '../../types';

interface AnalyticsReportsModalProps {
  show: boolean;
  onClose: () => void;
  tasks: Task[];
  taskStates: { [key: string]: TaskState };
  projectMeta: ProjectMeta;
  phases: { [key: string]: string };
  phaseColors: { [key: string]: string };
}

interface PhaseReport {
  phase: string;
  totalTasks: number;
  completed: number;
  completionPercent: number;
  estimatedHours: number;
  actualHours: number;
  variance: number;
}

interface TimeVarianceItem {
  task: string;
  phase: string;
  estimated: number;
  actual: number;
  variance: number;
  variancePercent: number;
}

interface CategoryData {
  totalTasks: number;
  completed: number;
  estimatedHours: number;
  actualHours: number;
}

interface UpcomingTask {
  task: string;
  phase: string;
  category: string;
  estimatedHours: number;
  status: string;
}

export default function AnalyticsReportsModal({
  show,
  onClose,
  tasks,
  taskStates,
  projectMeta,
  phases,
  phaseColors: _phaseColors,
}: AnalyticsReportsModalProps) {

  const generateReports = () => {
    const reports = {
      phaseTimeline: [] as PhaseReport[],
      timeVariance: [] as TimeVarianceItem[],
      categoryBreakdown: {} as { [key: string]: CategoryData },
      upcomingTasks: [] as UpcomingTask[],
      atRiskTasks: [] as UpcomingTask[],
    };

    // Phase Timeline Report
    Object.entries(phases).forEach(([phaseId, phaseTitle]) => {
      const phaseTasks = tasks.filter(t => t.phase === phaseId);
      let phaseEstTotal = 0;
      let phaseActualTotal = 0;
      let completed = 0;

      phaseTasks.forEach(task => {
        const state = taskStates[task.id] || {};
        phaseEstTotal += parseFloat(String(state.estHours || task.adjustedEstHours)) || 0;
        phaseActualTotal += parseFloat(state.actualHours || '0') || 0;
        if (state.status === 'complete') completed++;
      });

      if (phaseTasks.length > 0) {
        reports.phaseTimeline.push({
          phase: phaseTitle,
          totalTasks: phaseTasks.length,
          completed,
          completionPercent: phaseTasks.length > 0 ? Math.round((completed / phaseTasks.length) * 100) : 0,
          estimatedHours: parseFloat(phaseEstTotal.toFixed(1)),
          actualHours: parseFloat(phaseActualTotal.toFixed(1)),
          variance: parseFloat((phaseActualTotal - phaseEstTotal).toFixed(1)),
        });
      }
    });

    // Time Variance Report
    tasks.forEach(task => {
      const state = taskStates[task.id] || {};
      const estHours = parseFloat(String(state.estHours || task.adjustedEstHours)) || 0;
      const actualHours = parseFloat(state.actualHours || '0') || 0;

      if (actualHours > 0 && estHours > 0) {
        const variance = actualHours - estHours;
        if (Math.abs(variance) > 0.1) {
          reports.timeVariance.push({
            task: task.task,
            phase: task.phaseTitle,
            estimated: estHours,
            actual: actualHours,
            variance: parseFloat(variance.toFixed(1)),
            variancePercent: parseFloat(((variance / estHours) * 100).toFixed(1)),
          });
        }
      }
    });

    // Sort by absolute variance (worst first)
    reports.timeVariance.sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));

    // Category Breakdown
    const categories = [...new Set(tasks.map(t => t.category))];
    categories.forEach(category => {
      const catTasks = tasks.filter(t => t.category === category);
      let catEstTotal = 0;
      let catActualTotal = 0;
      let completed = 0;

      catTasks.forEach(task => {
        const state = taskStates[task.id] || {};
        catEstTotal += parseFloat(String(state.estHours || task.adjustedEstHours)) || 0;
        catActualTotal += parseFloat(state.actualHours || '0') || 0;
        if (state.status === 'complete') completed++;
      });

      reports.categoryBreakdown[category] = {
        totalTasks: catTasks.length,
        completed,
        estimatedHours: parseFloat(catEstTotal.toFixed(1)),
        actualHours: parseFloat(catActualTotal.toFixed(1)),
      };
    });

    // Upcoming & In-Progress Tasks
    tasks.forEach(task => {
      const state = taskStates[task.id] || {};
      if (state.status === 'pending' || state.status === 'in-progress') {
        const upcomingTask = {
          task: task.task,
          phase: task.phaseTitle,
          category: task.category,
          estimatedHours: parseFloat(String(state.estHours || task.adjustedEstHours)) || 0,
          status: state.status || 'pending',
        };
        reports.upcomingTasks.push(upcomingTask);

        // At Risk Tasks (high estimates, not started)
        if (upcomingTask.estimatedHours >= 10 && upcomingTask.status === 'pending') {
          reports.atRiskTasks.push(upcomingTask);
        }
      }
    });

    return reports;
  };

  const exportReportsToCSV = () => {
    const reports = generateReports();
    let csv = `${projectMeta.name} - Detailed Analytics Report\n`;
    csv += `Generated: ${new Date().toLocaleString()}\n`;
    csv += `Project Lead: ${projectMeta.lead || 'N/A'}\n\n`;

    csv += '=== PHASE TIMELINE & PROGRESS ===\n';
    csv += 'Phase,Total Tasks,Completed,Completion %,Estimated Hours,Actual Hours,Variance\n';
    reports.phaseTimeline.forEach(phase => {
      csv += `"${phase.phase}",${phase.totalTasks},${phase.completed},${phase.completionPercent}%,${phase.estimatedHours},${phase.actualHours},${phase.variance}\n`;
    });

    csv += '\n=== TIME VARIANCE REPORT ===\n';
    csv += 'Task,Phase,Estimated Hours,Actual Hours,Variance,Variance %\n';
    reports.timeVariance.forEach(item => {
      csv += `"${item.task}","${item.phase}",${item.estimated},${item.actual},${item.variance},${item.variancePercent}%\n`;
    });

    csv += '\n=== CATEGORY BREAKDOWN ===\n';
    csv += 'Category,Total Tasks,Completed,Estimated Hours,Actual Hours\n';
    Object.entries(reports.categoryBreakdown).forEach(([category, data]) => {
      csv += `"${category}",${data.totalTasks},${data.completed},${data.estimatedHours},${data.actualHours}\n`;
    });

    if (reports.atRiskTasks.length > 0) {
      csv += '\n=== AT RISK TASKS ===\n';
      csv += 'Task,Phase,Category,Estimated Hours,Status\n';
      reports.atRiskTasks.forEach(task => {
        csv += `"${task.task}","${task.phase}","${task.category}",${task.estimatedHours},${task.status}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printReports = () => {
    const reports = generateReports();
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      alert('Please allow popups to print reports');
      return;
    }

    const printContent = `
      <html>
      <head>
        <title>${projectMeta.name} - Analytics Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          h1 { color: #103A56; border-bottom: 3px solid #00A3FF; padding-bottom: 10px; }
          h2 { color: #00A3FF; margin-top: 30px; border-bottom: 2px solid #78d4ff; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #103A56; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .positive { color: #2E8B57; font-weight: bold; }
          .negative { color: #d32f2f; font-weight: bold; }
          .at-risk { background-color: #fff3cd; padding: 10px; margin: 10px 0; border-left: 4px solid #d32f2f; }
          .category-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
          .category-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: #f9f9f9; }
          .category-card h3 { margin: 0 0 10px 0; color: #103A56; font-size: 16px; }
          .category-card div { font-size: 14px; margin: 5px 0; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <h1>${projectMeta.name} - Analytics Report</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Project Lead:</strong> ${projectMeta.lead || 'N/A'}</p>
        <p><strong>Status:</strong> ${projectMeta.status}</p>

        <h2>📊 Phase Timeline & Progress</h2>
        <table>
          <tr>
            <th>Phase</th>
            <th>Tasks</th>
            <th>Completion</th>
            <th>Est. Hours</th>
            <th>Actual Hours</th>
            <th>Variance</th>
          </tr>
          ${reports.phaseTimeline.map(phase => `
            <tr>
              <td>${phase.phase}</td>
              <td>${phase.completed}/${phase.totalTasks}</td>
              <td>${phase.completionPercent}%</td>
              <td>${phase.estimatedHours}h</td>
              <td>${phase.actualHours}h</td>
              <td class="${phase.variance > 0 ? 'negative' : 'positive'}">
                ${phase.variance > 0 ? '+' : ''}${phase.variance}h
              </td>
            </tr>
          `).join('')}
        </table>

        ${reports.timeVariance.length > 0 ? `
          <h2>⚠️ Top Time Variances</h2>
          <table>
            <tr>
              <th>Task</th>
              <th>Phase</th>
              <th>Est.</th>
              <th>Actual</th>
              <th>Variance</th>
              <th>%</th>
            </tr>
            ${reports.timeVariance.slice(0, 15).map(item => `
              <tr>
                <td>${item.task}</td>
                <td>${item.phase}</td>
                <td>${item.estimated}h</td>
                <td>${item.actual}h</td>
                <td class="${item.variance > 0 ? 'negative' : 'positive'}">
                  ${item.variance > 0 ? '+' : ''}${item.variance}h
                </td>
                <td class="${item.variancePercent > 0 ? 'negative' : 'positive'}">
                  ${item.variancePercent > 0 ? '+' : ''}${item.variancePercent}%
                </td>
              </tr>
            `).join('')}
          </table>
        ` : ''}

        <h2>🏷️ Category Breakdown</h2>
        <div class="category-grid">
          ${Object.entries(reports.categoryBreakdown).map(([category, data]) => `
            <div class="category-card">
              <h3>${category}</h3>
              <div><strong>Total Tasks:</strong> ${data.totalTasks}</div>
              <div><strong>Completed:</strong> ${data.completed}</div>
              <div><strong>Est. Hours:</strong> ${data.estimatedHours}h</div>
              <div><strong>Actual Hours:</strong> ${data.actualHours}h</div>
            </div>
          `).join('')}
        </div>

        ${reports.atRiskTasks.length > 0 ? `
          <h2>🚨 At Risk Tasks</h2>
          ${reports.atRiskTasks.map(task => `
            <div class="at-risk">
              <strong>${task.task}</strong><br>
              ${task.phase} - ${task.category} - ${task.estimatedHours}h - ${task.status}
            </div>
          `).join('')}
        ` : ''}

        <div class="no-print" style="margin-top: 30px; page-break-before: always;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #00A3FF; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">🖨️ Print Report</button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 16px;">Close</button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const reports = generateReports();

  return (
    <Modal show={show} onClose={onClose} title="📈 Project Reports & Analytics" width="1200px">
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          paddingBottom: '15px',
          borderBottom: `1px solid ${theme.border}`,
        }}>
          <button
            onClick={exportReportsToCSV}
            style={{
              padding: '10px 20px',
              background: theme.accentGreen,
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
            }}
          >
            📊 Export CSV
          </button>
          <button
            onClick={printReports}
            style={{
              padding: '10px 20px',
              background: theme.brandOrange,
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
            }}
          >
            🖨️ Print Report
          </button>
        </div>

        {/* Phase Timeline Report */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: theme.accentBlue, marginBottom: '15px', fontSize: '18px' }}>
            📊 Phase Timeline & Progress
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: theme.brandNavy }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>Phase</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#fff' }}>Tasks</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#fff' }}>Completion</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>Est. Hours</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>Actual Hours</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>Variance</th>
                </tr>
              </thead>
              <tbody>
                {reports.phaseTimeline.map((phase, idx) => (
                  <tr key={idx} style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td style={{ padding: '12px', color: theme.textPrimary }}>{phase.phase}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: theme.textSecondary }}>
                      {phase.completed}/{phase.totalTasks}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        <div style={{
                          width: '80px',
                          height: '8px',
                          background: theme.bgTertiary,
                          borderRadius: '4px',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${phase.completionPercent}%`,
                            height: '100%',
                            background: theme.accentGreen,
                            borderRadius: '4px',
                          }}></div>
                        </div>
                        <span style={{ color: theme.textSecondary, fontSize: '12px' }}>
                          {phase.completionPercent}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: theme.textSecondary }}>
                      {phase.estimatedHours}h
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: theme.textSecondary }}>
                      {phase.actualHours}h
                    </td>
                    <td style={{
                      padding: '12px',
                      textAlign: 'right',
                      color: phase.variance > 0 ? theme.accentRed : theme.accentGreen,
                      fontWeight: 'bold',
                    }}>
                      {phase.variance > 0 ? '+' : ''}{phase.variance}h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Time Variance Report */}
        {reports.timeVariance.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: theme.brandOrange, marginBottom: '15px', fontSize: '18px' }}>
              ⚠️ Top Time Variances (Est vs Actual)
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: theme.brandNavy }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>Task</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>Phase</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>Est.</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>Actual</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>Variance</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.timeVariance.slice(0, 15).map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={{ padding: '12px', color: theme.textPrimary }}>{item.task}</td>
                      <td style={{ padding: '12px', color: theme.textSecondary, fontSize: '12px' }}>{item.phase}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: theme.textSecondary }}>{item.estimated}h</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: theme.textSecondary }}>{item.actual}h</td>
                      <td style={{
                        padding: '12px',
                        textAlign: 'right',
                        color: item.variance > 0 ? theme.accentRed : theme.accentGreen,
                        fontWeight: 'bold',
                      }}>
                        {item.variance > 0 ? '+' : ''}{item.variance}h
                      </td>
                      <td style={{
                        padding: '12px',
                        textAlign: 'right',
                        color: item.variancePercent > 0 ? theme.accentRed : theme.accentGreen,
                        fontWeight: 'bold',
                      }}>
                        {item.variancePercent > 0 ? '+' : ''}{item.variancePercent}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: theme.accentTeal, marginBottom: '15px', fontSize: '18px' }}>
            🏷️ Category Breakdown
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
          }}>
            {Object.entries(reports.categoryBreakdown).map(([category, data]) => (
              <div key={category} style={{
                background: theme.bgTertiary,
                padding: '15px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: theme.textPrimary, fontSize: '14px' }}>
                  {category}
                </h4>
                <div style={{ fontSize: '13px', color: theme.textSecondary, lineHeight: '1.8' }}>
                  <div><strong>Tasks:</strong> {data.completed}/{data.totalTasks}</div>
                  <div><strong>Est:</strong> {data.estimatedHours}h</div>
                  <div><strong>Actual:</strong> {data.actualHours}h</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        {reports.upcomingTasks.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: theme.accentGreen, marginBottom: '15px', fontSize: '18px' }}>
              📋 Upcoming & In-Progress Tasks ({reports.upcomingTasks.length})
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: theme.brandNavy }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>Task</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>Phase</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: '#fff' }}>Category</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>Est. Hours</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: '#fff' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.upcomingTasks.slice(0, 20).map((task, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={{ padding: '12px', color: theme.textPrimary }}>{task.task}</td>
                      <td style={{ padding: '12px', color: theme.textSecondary, fontSize: '12px' }}>{task.phase}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          background: theme.accentBlue,
                          color: '#fff',
                        }}>
                          {task.category}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: theme.textSecondary }}>
                        {task.estimatedHours}h
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          background: task.status === 'in-progress' ? theme.brandOrange : theme.bgSecondary,
                          color: '#fff',
                        }}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* At Risk Tasks */}
        {reports.atRiskTasks.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: theme.accentRed, marginBottom: '15px', fontSize: '18px' }}>
              🚨 At Risk Tasks (High Estimate, Not Started)
            </h3>
            <div style={{
              background: theme.bgTertiary,
              padding: '15px',
              borderRadius: '8px',
              border: `2px solid ${theme.accentRed}`,
            }}>
              {reports.atRiskTasks.map((task, idx) => (
                <div key={idx} style={{
                  padding: '10px',
                  borderBottom: idx < reports.atRiskTasks.length - 1 ? `1px solid ${theme.border}` : 'none',
                  color: theme.textPrimary,
                  fontSize: '14px',
                }}>
                  <strong>{task.task}</strong> - {task.phase} - {task.category} - {task.estimatedHours}h
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
