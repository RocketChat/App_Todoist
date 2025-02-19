import { IHttpResponse } from '@rocket.chat/apps-engine/definition/accessors';
import { IUser } from '@rocket.chat/apps-engine/definition/users';

import { TodoistApp } from '../../TodoistApp';
import { getTaskUrl, getTasksUrl } from '../helpers/const';
import { ITask } from '../interfaces/tasks';

export class TaskService {
  constructor(private app: TodoistApp) {}

  public async fetch(user: IUser, taskId?: string): Promise<ITask[]> {
    try {
      const url = taskId ? getTaskUrl(taskId) : getTasksUrl();
      const response: IHttpResponse = await this.app.getHttpHelperInstance().get(user, url);
      if (response.statusCode !== 200) {
        throw new Error(`Failed to fetch tasks: ${response.content}`);
      }
      const tasks: ITask[] = Array.isArray(response.data) ? response.data : [response.data];
      this.validate(tasks);
      return tasks;
    } catch (error) {
      this.app.getLogger().error(`Error in TaskService.fetchTasks: ${error.message}`);
      throw new Error('Could not retrieve tasks. Please try again later.');
    }
  }

  public async create(user: IUser, taskData: ITask): Promise<ITask> {
    try {
      const response: IHttpResponse = await this.app
        .getHttpHelperInstance()
        .post(user, getTasksUrl(), { data: taskData });
      if (response.statusCode !== 200) {
        throw new Error(`Failed to create task: ${response.content}`);
      }
      return response.data;
    } catch (error) {
      this.app.getLogger().error(`Error in TaskService.createTask: ${error.message}`);
      throw new Error('Could not create task. Please try again later.');
    }
  }

  public async update(user: IUser, taskId: string, taskData: ITask): Promise<ITask> {
    try {
      const response: IHttpResponse = await this.app
        .getHttpHelperInstance()
        .put(user, `${getTasksUrl()}/${taskId}`, taskData);
      if (response.statusCode !== 200) {
        throw new Error(`Failed to update task: ${response.content}`);
      }
      return response.data;
    } catch (error) {
      this.app.getLogger().error(`Error in TaskService.updateTask: ${error.message}`);
      throw new Error('Could not update task. Please try again later.');
    }
  }

  public async delete(user: IUser, taskId: string): Promise<void> {
    try {
      const response: IHttpResponse = await this.app
        .getHttpHelperInstance()
        .delete(user, getTaskUrl(taskId));
      if (response.statusCode !== 204) {
        throw new Error(`Failed to delete task: ${response.content}`);
      }
    } catch (error) {
      this.app.getLogger().error(`Error in TaskService.deleteTask: ${error.message}`);
      throw new Error('Could not delete task. Please try again later.');
    }
  }

  private validate(tasks: ITask[]): void {
    tasks.forEach((task) => {
      if (!task.id || !task.content) {
        throw new Error(`Invalid task structure: ${JSON.stringify(task)}`);
      }
    });
  }
}
