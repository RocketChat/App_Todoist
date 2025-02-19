import { IHttpResponse } from '@rocket.chat/apps-engine/definition/accessors';
import { IUser } from '@rocket.chat/apps-engine/definition/users';

import { TodoistApp } from '../../TodoistApp';
import { getSharedLabelsUrl } from '../helpers/const';
import { ILabel } from '../interfaces/labels';

export class SharedLabelService {
  constructor(private app: TodoistApp) {}

  public async fetch(user: IUser): Promise<ILabel[]> {
    try {
      const response: IHttpResponse = await this.app
        .getHttpHelperInstance()
        .get(user, getSharedLabelsUrl(true));

      if (response.statusCode !== 200) {
        throw new Error(`Failed to fetch labels: ${response.content}`);
      }

      const labels: ILabel[] = response.data;
      this.validate(labels);
      return labels;
    } catch (error) {
      this.app.getLogger().error(`Error in SharedLabelService.fetchLabels: ${error.message}`);
      throw new Error('Could not retrieve shared labels. Please try again later.');
    }
  }

  public async delete(user: IUser, labelId: string): Promise<void> {
    try {
      const response: IHttpResponse = await this.app
        .getHttpHelperInstance()
        .delete(user, `${getSharedLabelsUrl(true)}/${labelId}`);
      if (response.statusCode !== 200) {
        throw new Error(`Failed to delete shared label: ${response.content}`);
      }
    } catch (error) {
      this.app.getLogger().error(`Error in SharedLabelService.deleteSharedLabel: ${error.message}`);
      throw new Error('Could not delete shared label. Please try again later.');
    }
  }

  private validate(labels: ILabel[]): void {
    labels.forEach((label) => {
      if (!label.id || !label.name || !label.color) {
        throw new Error(`Invalid label structure: ${JSON.stringify(label)}`);
      }
    });
  }
}
