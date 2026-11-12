// Preview-only delegated event listeners for demo CSV export.
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-preview-export]');
  if (!button || typeof window.exportDemoTable !== 'function') return;
  const tableId = button.dataset.previewExport;
  const fileName = tableId === 'recTable' ? 'Recruitment_Demo.csv' : 'Payroll_Demo.csv';
  window.exportDemoTable(tableId, fileName);
});
