declare module '@fitsee/user-tasks' {
  export enum UserTasksEvents {
    STARTED = 'user-tasks:task-started',
    STOPPED = 'user-tasks:task-stopped',
    TASK_COMPLETE = 'user-tasks:task-complete',
    TASK_FAILED = 'user-tasks:task-failed',
    ERROR = 'user-tasks:error',
  }

  export interface PoseTaskDefinition {
    startPoseIndex: number;
    endPoseIndex: number;
    repeats: number;
    timeWindow: number;
    leeway: number;
    name: string;
  }

  export interface PoseTask {
    definition: PoseTaskDefinition;
    poses: any[];
    [key: string]: any;
  }

  export interface PoseTaskSerialized extends PoseTaskDefinition {
    poses: any[];
    [key: string]: any;
  }

  export interface UserTasksConfig {
    canvasElement: HTMLCanvasElement;
    videoElement: HTMLVideoElement;
    initializeVideo: boolean;
    videoRotation: number;
  }

  export type EventHandler = (payload: any) => void;

  export interface EventOptions {
    [key: string]: any;
  }

  export interface EventNamesContainer {
    [key: string]: string;
  }

  export interface Observable {
    [key: string]: any;
  }

  export class UserTasks {
    constructor(config: UserTasksConfig);

    get isInitialized(): boolean;

    initialize(): void;

    monitor(task: PoseTask): void;

    stop(): void;

    deserializeTask(serialized: PoseTaskSerialized): PoseTask;

    subscribe(nameOrContainer: string | EventNamesContainer, handler?: EventHandler): Observable;

    unsubscribe(
      nameOrContainer?: string | EventNamesContainer,
      handler?: EventHandler | null
    ): Observable;

    dispatch(eventName: string, options?: EventOptions): Observable;

    dispose(): void;
  }
}
