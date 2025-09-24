import React from 'react';

import {
  Button,
  FormControl,
  Input,
  VerticalStackLayout,
} from 'frontend/components';
import { ButtonType } from 'frontend/types/button';
import { AsyncError } from 'frontend/types';
import useAddTaskForm from './add-task-form.hook';

interface AddTaskFormProps {
  onSuccess: () => void;
  onError: (error: AsyncError) => void;
}

type TaskFormFields = 'title' | 'description';

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onSuccess, onError }) => {
  const { formik, isLoading } = useAddTaskForm({
    onSuccess,
    onError,
  });

  const getFormikError = (field: TaskFormFields) =>
    formik.touched[field] ? formik.errors[field] : '';

  return (
    <form onSubmit={formik.handleSubmit}>
      <VerticalStackLayout gap={4}>
        <FormControl label="Title" error={getFormikError('title')}>
          <Input
            data-testid="task-title"
            disabled={isLoading}
            error={getFormikError('title')}
            name="title"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            placeholder="Enter task title"
            value={formik.values.title}
          />
        </FormControl>

        <FormControl label="Description" error={getFormikError('description')}>
          <textarea
            className="w-full rounded-lg border border-stroke bg-white p-4 outline-none focus:border-primary focus-visible:shadow-none resize-none"
            data-testid="task-description"
            disabled={isLoading}
            name="description"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            placeholder="Enter task description"
            rows={4}
            value={formik.values.description}
            style={{
              borderColor: getFormikError('description')
                ? '#ef4444'
                : undefined,
            }}
          />
        </FormControl>

        <div className="flex gap-3 justify-end">
          <Button
            type={ButtonType.SUBMIT}
            disabled={isLoading}
            isLoading={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </VerticalStackLayout>
    </form>
  );
};

export default AddTaskForm;
