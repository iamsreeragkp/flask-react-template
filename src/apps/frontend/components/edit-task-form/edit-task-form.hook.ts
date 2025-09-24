import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';

import { TaskService } from 'frontend/services';
import { AsyncError, Task } from 'frontend/types';
import { getAccessTokenFromStorage } from 'frontend/utils/storage-util';

interface EditTaskFormProps {
  task: Task;
  onSuccess: () => void;
  onError: (error: AsyncError) => void;
}

const useEditTaskForm = ({ task, onSuccess, onError }: EditTaskFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const taskService = new TaskService();

  const formik = useFormik({
    initialValues: {
      title: task.title,
      description: task.description,
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title must be less than 100 characters')
        .required('Title is required'),
      description: Yup.string()
        .min(10, 'Description must be at least 10 characters')
        .max(500, 'Description must be less than 500 characters')
        .required('Description is required'),
    }),
    onSubmit: async (values) => {
      const userAccessToken = getAccessTokenFromStorage();
      if (!userAccessToken) {
        onError({ message: 'Please re-login to edit tasks' } as AsyncError);
        return;
      }

      setIsLoading(true);
      try {
        await taskService.updateTask(
          userAccessToken,
          task.id,
          values.title,
          values.description,
        );
        onSuccess();
      } catch (error) {
        onError(error as AsyncError);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return {
    formik,
    isLoading,
  };
};

export default useEditTaskForm;
