import { IUser } from '@rocket.chat/apps-engine/definition/users';

import { TodoistApp } from '../../TodoistApp';
import { getSectionUrl, getSectionsUrl } from '../helpers/const';
import { ISection } from '../interfaces/sections';

export class SectionService {
  constructor(private app: TodoistApp) {}

  public async fetch(user: IUser, sectionId?: string): Promise<ISection[]> {
    try {
      const url = sectionId ? getSectionUrl(sectionId) : getSectionsUrl();
      const response = await this.app.getHttpHelperInstance().get(user, url);

      if (response.statusCode !== 200) {
        throw new Error(`Failed to fetch sections: ${response.content}`);
      }

      const sections: ISection[] = Array.isArray(response.data) ? response.data : [response.data];
      this.validate(sections);
      return sections;
    } catch (error) {
      this.app.getLogger().error(`Error in SectionService.fetchSections: ${error.message}`);
      throw new Error('Could not retrieve sections. Please try again later.');
    }
  }

  public async delete(user: IUser, sectionId: string): Promise<void> {
    try {
      const response = await this.app
        .getHttpHelperInstance()
        .delete(user, `${getSectionsUrl()}/${sectionId}`);
      if (response.statusCode !== 204) {
        throw new Error(`Failed to delete section: ${response.content}`);
      }
    } catch (error) {
      this.app.getLogger().error(`Error in SectionService.deleteSection: ${error.message}`);
      throw new Error('Could not delete section. Please try again later.');
    }
  }

  private validate(sections: ISection[]): void {
    sections.forEach((section) => {
      if (!section.id || !section.name) {
        throw new Error(`Invalid section structure: ${JSON.stringify(section)}`);
      }
    });
  }
}
