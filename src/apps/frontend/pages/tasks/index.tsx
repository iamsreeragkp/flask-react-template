import React, { useEffect, useState } from 'react';
import { TaskService } from 'frontend/services';
import { Task, PaginatedTasksResponse } from 'frontend/types';
import { getAccessTokenFromStorage } from 'frontend/utils/storage-util';
import {
  Modal,
  AddTaskForm,
  EditTaskForm,
  TaskCard,
  ConfirmationModal,
} from 'frontend/components';

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreTasks, setHasMoreTasks] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const taskService = new TaskService();

  const fetchTasks = async (page: number = 1, append: boolean = false) => {
    const userAccessToken = getAccessTokenFromStorage();
    if (!userAccessToken) return;

    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const response = await taskService.getAllTasks(userAccessToken, {
        page,
        size: 4,
      });

      const paginatedResponse = response.data as PaginatedTasksResponse;

      if (append) {
        setTasks((prevTasks) => [...prevTasks, ...paginatedResponse.items]);
      } else {
        setTasks(paginatedResponse.items);
      }

      // Check if there are more tasks to load
      // and based on this logic show more button is shown
      const totalPages = paginatedResponse.total_pages;

      setHasMoreTasks(page < totalPages);
      setCurrentPage(page);
    } catch (err) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) {
    // TODO: Add loading component here..
    return <div>Loading tasks...</div>;
  }

  if (error) {
    // FIXME: handle the error gracefully here..
    return <div>Error: {error}</div>;
  }

  const handleAddTask = () => {
    setIsAddModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    const userAccessToken = getAccessTokenFromStorage();
    if (!userAccessToken) return;

    try {
      await taskService.deleteTask(userAccessToken, taskToDelete.id);
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
      fetchTasks(1, false);
    } catch (error) {
      //FIXME: handle the error gracefully here..
      setError('Failed to delete task. Please try again.');
    }
  };

  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedTask(null);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  const handleTaskCreated = () => {
    setIsAddModalOpen(false);
    // This is refetching the entire task list after creation of a new task
    //FIXME: Ideal behaviour would be to optimistically update the cache here..
    fetchTasks(1, false);
  };

  const handleTaskUpdated = () => {
    setIsEditModalOpen(false);
    setSelectedTask(null);
    // This is refetching the entire task list after updation task
    //FIXME: Ideal behaviour would be to optimistically update the cache here..
    fetchTasks(1, false);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMoreTasks) {
      fetchTasks(currentPage + 1, true);
    }
  };

  const handleTaskCreationError = () => {
    // FIXME: handle the error gracefully here..
    setError('Failed to create task. Please try again.');
  };

  return (
    <div className="p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <button
          onClick={handleAddTask}
          className="
            bg-primary 
            hover:bg-primary/90 
            text-white 
            font-medium 
            px-6 
            py-3 
            rounded-lg 
            transition-colors 
            duration-200 
            shadow-sm 
            hover:shadow-md
          "
        >
          Add Task
        </button>
      </div>

      <div className="fflex flex-col min-h-0">
        {tasks.length === 0 ? (
          // TODO: Replace this with a proper empty state component..
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-500 text-lg">No tasks found.</div>
              <div className="text-gray-400 text-sm mt-2">
                Click "Add Task" to create your first task.
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="overflow-y-auto pr-2 ">
              <div className="space-y-4">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => {
                      // TODO: Add task detail view functionality
                    }}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            </div>

            {hasMoreTasks && (
              <div className="flex justify-center pt-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="
                    bg-white
                    border
                    border-gray-300
                    hover:border-primary
                    text-gray-700
                    hover:text-primary
                    font-medium
                    px-8
                    py-3
                    rounded-lg
                    transition-all
                    duration-200
                    shadow-sm
                    hover:shadow-md
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  {loadingMore ? 'Loading...' : 'Show More'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={handleAddModalClose}
          title="Create New Task"
          size="md"
        >
          <AddTaskForm
            onSuccess={handleTaskCreated}
            onError={handleTaskCreationError}
          />
        </Modal>
      )}

      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          title="Edit Task"
          size="md"
        >
          {selectedTask && (
            <EditTaskForm
              task={selectedTask}
              onSuccess={handleTaskUpdated}
              onError={handleTaskCreationError}
            />
          )}
        </Modal>
      )}

      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteModalClose}
          onConfirm={handleConfirmDelete}
          title="Delete Task"
          message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};
