import React from 'react';
import { Task } from 'frontend/types';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onEdit,
  onDelete,
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.action-button')) {
      return;
    }
    onClick?.(task);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(task);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(task);
  };

  return (
    <div
      className={`bg-white 
        border 
        border-gray-200 
        rounded-lg 
        shadow-sm 
        hover:shadow-md 
        transition-shadow 
        duration-200 
        p-6 
        cursor-pointer
        w-full
        ${onClick ? 'hover:border-primary' : ''}
      `}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-3 pr-4">
          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>

          <p className="text-gray-600 text-sm">{task.description}</p>
        </div>

        {/* action-button to check nearby click. */}

        <div className="flex space-x-2 action-button">
          <button
            onClick={handleEdit}
            className="
              p-2 
              text-gray-400 
              hover:text-blue-600 
              hover:bg-blue-50 
              rounded-lg 
              transition-colors 
              duration-200
            "
            title="Edit task"
          >
            <img
              className="fill-current opacity-50 h-6 w-6"
              src="/assets/img/icon/edit.svg"
              alt="edit icon"
            />
          </button>

          <button
            onClick={handleDelete}
            className="
              p-2 
              text-gray-400 
              hover:text-red-600 
              hover:bg-red-50 
              rounded-lg 
              transition-colors 
              duration-200
            "
            title="Delete task"
          >
            <img
              className="fill-current opacity-50 h-6 w-6"
              src="/assets/img/icon/delete.svg"
              alt="delete icon"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
