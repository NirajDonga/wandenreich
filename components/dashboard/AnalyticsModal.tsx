import { Modal, Button } from '../ui';

interface ChartData {
  labels: string[];
  data: number[];
}

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chartData: ChartData | null;
  onGenerateChart: () => void;
  isGeneratingChart: boolean;
}

export default function AnalyticsModal({
  isOpen,
  onClose,
  chartData,
  onGenerateChart,
  isGeneratingChart
}: AnalyticsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Data Analytics"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold text-slate-800">System Overview</h4>
          <Button 
            onClick={onGenerateChart}
            disabled={isGeneratingChart}
            size="sm"
          >
            {isGeneratingChart ? 'Generating...' : 'Generate Chart'}
          </Button>
        </div>
        
        {chartData && (
          <div className="bg-slate-50 rounded-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {chartData.labels.map((label: string, index: number) => (
                <div key={label} className="bg-white rounded-lg p-4">
                  <p className="text-2xl font-bold text-slate-900">{chartData.data[index]}</p>
                  <p className="text-sm text-slate-600">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 rounded-lg p-4">
            <h5 className="font-semibold text-slate-800 mb-2">User Activity</h5>
            <p className="text-slate-600 text-sm">Track user engagement and activity patterns</p>
            <div className="mt-3 bg-white rounded p-3">
              <div className="flex justify-between text-sm">
                <span>Active Users:</span>
                <span className="font-medium">245</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>Daily Logins:</span>
                <span className="font-medium">189</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>Avg. Session:</span>
                <span className="font-medium">24 min</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4">
            <h5 className="font-semibold text-slate-800 mb-2">Task Completion</h5>
            <p className="text-slate-600 text-sm">Monitor task progress and completion rates</p>
            <div className="mt-3 bg-white rounded p-3">
              <div className="flex justify-between text-sm">
                <span>Completed Today:</span>
                <span className="font-medium text-green-600">23</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>In Progress:</span>
                <span className="font-medium text-blue-600">15</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>Completion Rate:</span>
                <span className="font-medium">87%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4">
            <h5 className="font-semibold text-slate-800 mb-2">File Storage</h5>
            <p className="text-slate-600 text-sm">Storage usage and file management metrics</p>
            <div className="mt-3 bg-white rounded p-3">
              <div className="flex justify-between text-sm">
                <span>Storage Used:</span>
                <span className="font-medium">2.4 GB</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>Files Uploaded Today:</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>Storage Limit:</span>
                <span className="font-medium">10 GB</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4">
            <h5 className="font-semibold text-slate-800 mb-2">System Performance</h5>
            <p className="text-slate-600 text-sm">Real-time system health and performance</p>
            <div className="mt-3 bg-white rounded p-3">
              <div className="flex justify-between text-sm">
                <span>CPU Usage:</span>
                <span className="font-medium text-green-600">34%</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>Memory Usage:</span>
                <span className="font-medium text-yellow-600">67%</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>Uptime:</span>
                <span className="font-medium">99.9%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}