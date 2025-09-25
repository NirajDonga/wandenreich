import { useState } from 'react';
import { Modal, Button, Input, Select, Card } from '../ui';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  assignee: string;
  dueDate: string;
  createdAt: string;
}

interface TaskManagementProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, '_id'>) => Promise<void>;
  onEditTask: (task: Task) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onUpdateTaskStatus: (id: string, status: 'To Do' | 'In Progress' | 'Done') => Promise<void>;
}

export default function TaskManagement({ 
  tasks, 
  onAddTask, 
  onEditTask, 
  onDeleteTask,
  onUpdateTaskStatus 
}: TaskManagementProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'To Do' as 'To Do' | 'In Progress' | 'Done',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    assignee: '',
    dueDate: ''
  });

  const handleSubmit = async () => {
    try {
      const taskData = {
        ...taskForm,
        createdAt: new Date().toISOString().split('T')[0]
      };

      if (editingTask) {
        await onEditTask({ ...taskData, _id: editingTask._id });
      } else {
        await onAddTask(taskData);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingTask(null);
    setTaskForm({
      title: '',
      description: '',
      status: 'To Do',
      priority: 'Medium',
      assignee: '',
      dueDate: ''
    });
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      dueDate: task.dueDate
    });
    setShowModal(true);
  };

  const filterTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Do': return 'bg-slate-100 text-slate-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Done': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const statusOptions = [
    { value: 'To Do', label: 'To Do' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Done', label: 'Done' }
  ];

  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' }
  ];

  return (
    <Card title="Task Management">
      <div className="mb-6 flex justify-between items-center">
        <Button onClick={() => setShowModal(true)}>
          Add New Task
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
          <Button 
            variant={viewMode === 'kanban' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('kanban')}
          >
            Kanban View
          </Button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task._id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h5 className="font-semibold text-slate-800">{task.title}</h5>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mb-2">{task.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Assigned to: {task.assignee}</span>
                    <span>Due: {task.dueDate}</span>
                    <span>Created: {task.createdAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <select
                    value={task.status}
                    onChange={(e) => onUpdateTaskStatus(task._id, e.target.value as 'To Do' | 'In Progress' | 'Done')}
                    className="text-xs border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                  <button
                    onClick={() => handleEdit(task)}
                    className="text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => onDeleteTask(task._id)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['To Do', 'In Progress', 'Done'].map((status) => (
            <div key={status} className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-800">{status}</h4>
                <span className="bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded-full">
                  {filterTasksByStatus(status).length}
                </span>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filterTasksByStatus(status).map((task) => (
                  <div key={task._id} className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-slate-800 text-sm">{task.title}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs mb-3 line-clamp-2">{task.description}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{task.assignee}</span>
                      <span>{task.dueDate}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => handleEdit(task)}
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => onDeleteTask(task._id)}
                        className="text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingTask ? 'Edit Task' : 'Add New Task'}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <Input
            label="Task Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
            placeholder="Enter task title"
          />
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
              placeholder="Enter task description"
              rows={3}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              value={taskForm.status}
              onChange={(e) => setTaskForm({...taskForm, status: e.target.value as 'To Do' | 'In Progress' | 'Done'})}
              options={statusOptions}
            />
            
            <Select
              label="Priority"
              value={taskForm.priority}
              onChange={(e) => setTaskForm({...taskForm, priority: e.target.value as 'Low' | 'Medium' | 'High'})}
              options={priorityOptions}
            />
          </div>
          
          <Input
            label="Assignee"
            value={taskForm.assignee}
            onChange={(e) => setTaskForm({...taskForm, assignee: e.target.value})}
            placeholder="Enter assignee name"
          />
          
          <Input
            label="Due Date"
            type="date"
            value={taskForm.dueDate}
            onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
          />
        </div>

        <div className="flex space-x-4 pt-6">
          <Button variant="secondary" onClick={resetForm} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            {editingTask ? 'Update Task' : 'Add Task'}
          </Button>
        </div>
      </Modal>
    </Card>
  );
}