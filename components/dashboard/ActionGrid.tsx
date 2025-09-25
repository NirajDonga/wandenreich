import { Button, Card } from '../ui';

interface ActionItem {
  title: string;
  description: string;
  onClick: () => void;
  buttonText: string;
  icon?: string;
  featured?: boolean;
}

interface ActionGridProps {
  actions: ActionItem[];
}

export default function ActionGrid({ actions }: ActionGridProps) {
  // Default actions if none provided
  const defaultActions: ActionItem[] = [
    {
      title: 'Report Generation',
      description: 'Generate comprehensive reports for users, tasks, and system analytics.',
      onClick: () => {},
      buttonText: 'Generate Report'
    },
    {
      title: 'User Management',
      description: 'Manage user accounts, roles, and permissions in your system.',
      onClick: () => {},
      buttonText: 'Manage Users'
    },
    {
      title: 'Settings',
      description: 'Configure system settings, preferences, and security options.',
      onClick: () => {},
      buttonText: 'Open Settings'
    },
    {
      title: 'Data Analytics',
      description: 'View detailed analytics and insights about your system performance.',
      onClick: () => {},
      buttonText: 'View Analytics'
    },
    {
      title: 'File Manager',
      description: 'Upload, organize, and manage your files and documents.',
      onClick: () => {},
      buttonText: 'Manage Files'
    },
    {
      title: 'Task Manager',
      description: 'Create, assign, and track tasks and project progress.',
      onClick: () => {},
      buttonText: 'Manage Tasks'
    }
  ];

  const displayActions = actions.length > 0 ? actions : defaultActions;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {displayActions.map((action, index) => (
        <div 
          key={index} 
          className={`${action.featured ? 'relative' : ''}`}
        >
          {action.featured && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold z-10">
              NEW!
            </div>
          )}
          <div className={`bg-white rounded-xl shadow-sm border ${action.featured ? 'border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50' : 'border-slate-200'} p-6`}>
            <div className="flex items-center gap-2 mb-3">
              {action.icon && <span className="text-2xl">{action.icon}</span>}
              <h3 className="text-lg font-semibold text-slate-900">{action.title}</h3>
            </div>
            <p className="text-slate-600 mb-4">
              {action.description}
            </p>
            <Button 
              onClick={action.onClick} 
              className={`w-full ${action.featured ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' : ''}`}
            >
              {action.buttonText}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}