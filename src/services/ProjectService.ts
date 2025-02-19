import { IUser } from '@rocket.chat/apps-engine/definition/users';

import { TodoistApp } from '../../TodoistApp';
import { getProjectUrl, getProjectsUrl } from '../helpers/const';
import { IProject } from '../interfaces/projects';

export class ProjectService {
  constructor(private readonly app: TodoistApp) {}

  public async fetch(user: IUser, projectId?: string): Promise<IProject[]> {
    try {
      const url = projectId ? getProjectUrl(projectId) : getProjectsUrl();
      const response = await this.app.getHttpHelperInstance().get(user, url);

      if (response.statusCode !== 200) {
        throw new Error(`Failed to fetch projects: ${response.content}`);
      }

      const projects: IProject[] = Array.isArray(response.data) ? response.data : [response.data];
      this.validateProjects(projects);
      return projects;
    } catch (error) {
      this.app.getLogger().error(`Error in ProjectService.fetch: ${error.message}`);
      throw new Error('Could not retrieve projects. Please try again later.');
    }
  }

  private validateProjects(projects: IProject[]): void {
    projects.forEach((project) => {
      if (!project.id || !project.name) {
        throw new Error(`Invalid project structure: ${JSON.stringify(project)}`);
      }
    });
  }
}
