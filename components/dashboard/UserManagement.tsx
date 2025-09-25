import { useState } from 'react';
import { Modal, Button, Input, Select, Card } from '../ui';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  provider: 'credentials' | 'google';
  status?: string;
  lastLogin?: string;
}

interface UserManagementProps {
  users: User[];
  onAddUser: (user: Omit<User, '_id'>) => Promise<void>;
  onEditUser: (user: User) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
}

export default function UserManagement({ 
  users, 
  onAddUser, 
  onEditUser, 
  onDeleteUser 
}: UserManagementProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'user' as 'user' | 'admin',
    provider: 'credentials' as 'credentials' | 'google',
    status: 'Active'
  });

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await onEditUser({ ...userForm, _id: editingUser._id });
      } else {
        await onAddUser(userForm);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      role: 'user',
      provider: 'credentials',
      status: 'Active'
    });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      provider: user.provider,
      status: user.status || 'Active'
    });
    setShowModal(true);
  };

  const roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' }
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Inactive', label: 'Inactive' }
  ];

  return (
    <Card title="User Management">
      <div className="mb-6">
        <Button onClick={() => setShowModal(true)}>
          Add New User
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-slate-900">{user.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    user.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : user.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.lastLogin}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-blue-600 hover:text-blue-900 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteUser(user._id)}
                    className="text-red-600 hover:text-red-900 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingUser ? 'Edit User' : 'Add New User'}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={userForm.name}
            onChange={(e) => setUserForm({...userForm, name: e.target.value})}
            placeholder="Enter full name"
          />
          
          <Input
            label="Email Address"
            type="email"
            value={userForm.email}
            onChange={(e) => setUserForm({...userForm, email: e.target.value})}
            placeholder="Enter email address"
          />
          
          <Select
            label="Role"
            value={userForm.role}
            onChange={(e) => setUserForm({...userForm, role: e.target.value as 'user' | 'admin'})}
            options={roleOptions}
          />
          
          <Select
            label="Status"
            value={userForm.status}
            onChange={(e) => setUserForm({...userForm, status: e.target.value})}
            options={statusOptions}
          />
        </div>

        <div className="flex space-x-4 pt-6">
          <Button variant="secondary" onClick={resetForm} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            {editingUser ? 'Update User' : 'Add User'}
          </Button>
        </div>
      </Modal>
    </Card>
  );
}