import { Modal, Button, Input, Select } from '../ui';

interface SettingsForm {
  companyName: string;
  theme: string;
  notifications: boolean;
  autoBackup: boolean;
  language: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settingsForm: SettingsForm;
  setSettingsForm: (form: SettingsForm) => void;
  onSave: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settingsForm,
  setSettingsForm,
  onSave
}: SettingsModalProps) {
  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="System Settings"
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        <Input
          label="Company Name"
          value={settingsForm.companyName}
          onChange={(e) => setSettingsForm({...settingsForm, companyName: e.target.value})}
        />
        
        <Select
          label="Theme"
          value={settingsForm.theme}
          onChange={(e) => setSettingsForm({...settingsForm, theme: e.target.value})}
          options={themeOptions}
        />
        
        <Select
          label="Language"
          value={settingsForm.language}
          onChange={(e) => setSettingsForm({...settingsForm, language: e.target.value})}
          options={languageOptions}
        />
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settingsForm.notifications}
              onChange={(e) => setSettingsForm({...settingsForm, notifications: e.target.checked})}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-slate-700">Enable Notifications</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settingsForm.autoBackup}
              onChange={(e) => setSettingsForm({...settingsForm, autoBackup: e.target.checked})}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-slate-700">Enable Auto Backup</span>
          </label>
        </div>
      </div>

      <div className="flex space-x-4 pt-6">
        <Button 
          variant="secondary" 
          onClick={onClose} 
          className="flex-1"
        >
          Cancel
        </Button>
        <Button onClick={onSave} className="flex-1">
          Save Settings
        </Button>
      </div>
    </Modal>
  );
}