import { Button } from '../ui';

interface DashboardHeaderProps {
  userName?: string;
  userInitial?: string;
  onSignOut: () => void;
}

export default function DashboardHeader({ 
  userName, 
  userInitial, 
  onSignOut 
}: DashboardHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-slate-900">Business Management</h1>
            <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              Inventory System
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {userInitial || 'U'}
                </span>
              </div>
              <span className="text-slate-700 font-medium">{userName || 'User'}</span>
            </div>
            
            <Button 
              variant="secondary" 
              size="sm"
              onClick={onSignOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}