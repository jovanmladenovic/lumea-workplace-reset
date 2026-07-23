import {
  UserTasks,
  UserTasksEvents,
  type PoseTask,
  type PoseTaskSerialized,
} from '@fitsee/user-tasks';

import { INPUT_VIDEO_ROTATION } from '@/constants';

import { PoseTasks } from './PoseTasks';

export { UserTasksEvents, PoseTasks };

export interface TaskCompletePayload {
  task: PoseTask;
  [key: string]: any;
}

export interface TaskFailedPayload {
  task: PoseTask;
  reason?: string;
  [key: string]: any;
}

export interface TaskErrorPayload {
  error: Error;
  [key: string]: any;
}

export class UserTasksService {
  taskMonitor: UserTasks;

  private readyPromise: Promise<void>;
  private resolveReadyPromise: () => void;
  private currentTaskName: string | null = null;

  callbacks: Map<UserTasksEvents, (payload: any) => void> = new Map();

  constructor() {
    this.readyPromise = new Promise<void>(resolve => {
      this.resolveReadyPromise = resolve;
    });
  }

  onReady(callback?: () => void): Promise<void> {
    if (callback) {
      this.readyPromise.then(callback);
    }
    return this.readyPromise;
  }

  on(event: UserTasksEvents, callback: (payload: any) => void) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, callback);
    }
  }

  off(event: UserTasksEvents) {
    if (this.callbacks.has(event)) {
      this.callbacks.delete(event);
    }
  }

  handleEvent(event: UserTasksEvents, payload?: any) {
    console.log(event, '(', this.currentTaskName, ')');
    if (this.callbacks.has(event)) {
      this.callbacks.get(event)!(payload);
    }
  }

  monitor(task: PoseTask): void {
    this.taskMonitor.monitor(task);
  }

  stop(): void {
    this.taskMonitor.stop();
    console.log('Task monitoring stopped for', this.currentTaskName);
    this.currentTaskName = null;
  }

  deserializeTask(serialized: PoseTaskSerialized): PoseTask {
    return this.taskMonitor.deserializeTask(serialized);
  }

  init(canvasEl: HTMLCanvasElement, videoEl: HTMLVideoElement): void {
    this.taskMonitor = new UserTasks({
      canvasElement: canvasEl,
      videoElement: videoEl,
      initializeVideo: false,
      videoRotation: INPUT_VIDEO_ROTATION,
    });

    this.taskMonitor.subscribe(UserTasksEvents.TASK_COMPLETE, (payload: TaskCompletePayload) => {
      this.handleEvent(UserTasksEvents.TASK_COMPLETE, payload);
    });

    this.taskMonitor.subscribe(UserTasksEvents.TASK_FAILED, (payload: TaskFailedPayload) => {
      this.handleEvent(UserTasksEvents.TASK_FAILED, payload);
    });

    this.taskMonitor.subscribe(UserTasksEvents.ERROR, (payload: TaskErrorPayload) => {
      this.handleEvent(UserTasksEvents.ERROR, payload);
    });

    this.taskMonitor.initialize();
    this.resolveReadyPromise();
  }

  startMonitoring(task: PoseTask): void {
    this.taskMonitor.monitor(task);
  }

  // Convenience helper to ensure readiness and start monitoring a task
  async startTask(task: PoseTask, taskName: string): Promise<void> {
    await this.onReady();
    console.log('Task monitoring started for', taskName);
    this.currentTaskName = taskName;
    this.startMonitoring(task);
  }

  stopMonitoring(): void {
    this.taskMonitor.unsubscribe(UserTasksEvents.TASK_COMPLETE);
    this.taskMonitor.unsubscribe(UserTasksEvents.TASK_FAILED);
    this.taskMonitor.unsubscribe(UserTasksEvents.ERROR);

    this.callbacks.clear();
  }

  dispose(): void {
    this.stopMonitoring();
    if (this.taskMonitor) {
      this.taskMonitor.dispose();
    }
  }
}

export const userTasks = new UserTasksService();
