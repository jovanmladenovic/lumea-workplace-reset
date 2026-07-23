import { onBeforeUnmount, ref } from 'vue';
import { Timestamp } from 'firebase/firestore';

import type { PoseTask, PoseTaskSerialized } from '@fitsee/user-tasks';
import { BASE_ANIMATION_DURATION } from '@/constants';
import { userTasks, faceRecognition, UserTasksEvents } from '@/services';
import { TaskData } from '@/types';

import { useSessionData } from './useSessionData';

export function useTaskMonitoring() {
  const { sessionData, updateSession } = useSessionData();
  const currentTask = ref<TaskData | null>(null);

  const startTaskMonitoring = async (taskConfig: PoseTaskSerialized) => {
    try {
      const task: PoseTask = userTasks.deserializeTask(taskConfig);

      task.timeWindow = (task.timeWindow * BASE_ANIMATION_DURATION) / 1000; // Compensate for animation speed
      faceRecognition.pauseMonitoring();
      // Start monitoring the task
      await userTasks.startTask(task, taskConfig.name);

      userTasks.on(UserTasksEvents.TASK_COMPLETE, () => {
        if (currentTask.value) {
          currentTask.value.passed = true;
        }
      });

      userTasks.on(UserTasksEvents.TASK_FAILED, () => {
        if (currentTask.value) {
          currentTask.value.passed = false;
        }
      });

      userTasks.on(UserTasksEvents.ERROR, error => {
        console.warn('Task monitoring error (ignoring):', error);
      });

      currentTask.value = {
        name: taskConfig.name,
        startedAt: Timestamp.now(),
      };
    } catch (error) {
      console.error('Failed to start task monitoring:', error);
    }
  };

  const cleanupTaskMonitoring = () => {
    userTasks.stop();
    faceRecognition.resumeMonitoring();

    const task = {
      ...currentTask.value,
      endedAt: Timestamp.now(),
    };

    updateSession({
      tasks: [...(sessionData.value?.tasks || []), task],
    });

    currentTask.value = null;
  };

  onBeforeUnmount(() => {
    cleanupTaskMonitoring();
  });

  return {
    startTaskMonitoring,
  };
}
