import { Modal, Button, Select } from '../ui';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: string;
  setReportType: (type: string) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export default function ReportModal({
  isOpen,
  onClose,
  reportType,
  setReportType,
  dateRange,
  setDateRange,
  onGenerate,
  isGenerating
}: ReportModalProps) {
  const reportOptions = [
    { value: 'user-activity', label: 'User Activity Report' },
    { value: 'task-summary', label: 'Task Summary Report' },
    { value: 'file-usage', label: 'File Usage Report' },
    { value: 'system-overview', label: 'System Overview Report' }
  ];

  const dateRangeOptions = [
    { value: 'last-7-days', label: 'Last 7 Days' },
    { value: 'last-30-days', label: 'Last 30 Days' },
    { value: 'last-90-days', label: 'Last 90 Days' },
    { value: 'custom', label: 'Custom Range' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Report"
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        <Select
          label="Report Type"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          options={reportOptions}
        />
        
        <Select
          label="Date Range"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          options={dateRangeOptions}
        />
      </div>

      <div className="flex space-x-4 pt-6">
        <Button 
          variant="secondary" 
          onClick={onClose} 
          className="flex-1"
          disabled={isGenerating}
        >
          Cancel
        </Button>
        <Button 
          onClick={onGenerate} 
          className="flex-1"
          disabled={!reportType || isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Report'}
        </Button>
      </div>
    </Modal>
  );
}