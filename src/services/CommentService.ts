import { IUser } from '@rocket.chat/apps-engine/definition/users';

import { TodoistApp } from '../../TodoistApp';
import { getCommentUrl, getCommentsUrl } from '../helpers/const';
import { IComment } from '../interfaces/comments';

export class CommentService {
  constructor(private app: TodoistApp) {}

  public async fetch(
    user: IUser,
    commentId?: string,
    taskId?: string,
    projecId?: string
  ): Promise<IComment[]> {
    try {
      const url = commentId ? getCommentUrl(commentId) : getCommentsUrl(taskId, projecId);
      const response = await this.app.getHttpHelperInstance().get(user, url);
      if (response.statusCode !== 200) {
        throw new Error(`Failed to fetch comments: ${response.content}`);
      }
      const comments: IComment[] = Array.isArray(response.data) ? response.data : [response.data];
      this.validate(comments);
      return comments;
    } catch (error) {
      this.app.getLogger().error(`Error in CommentService.fetchComments: ${error.message}`);
      throw new Error('Could not retrieve comments. Please try again later.');
    }
  }

  public async create(user: IUser, commentData: IComment): Promise<IComment> {
    try {
      const response = await this.app
        .getHttpHelperInstance()
        .post(user, getCommentsUrl(), commentData);
      if (response.statusCode !== 200) {
        throw new Error(`Failed to create comment: ${response.content}`);
      }
      return response.data;
    } catch (error) {
      this.app.getLogger().error(`Error in CommentService.createComment: ${error.message}`);
      throw new Error('Could not create comment. Please try again later.');
    }
  }

  public async delete(user: IUser, commentId: string): Promise<void> {
    try {
      const response = await this.app
        .getHttpHelperInstance()
        .delete(user, `${getCommentsUrl()}/${commentId}`);
      if (response.statusCode !== 204) {
        throw new Error(`Failed to delete comment: ${response.content}`);
      }
    } catch (error) {
      this.app.getLogger().error(`Error in CommentService.deleteComment: ${error.message}`);
      throw new Error('Could not delete comment. Please try again later.');
    }
  }

  private validate(comments: IComment[]): void {
    comments.forEach((comment) => {
      if (!comment.id || !comment.content) {
        throw new Error(`Invalid comment structure: ${JSON.stringify(comment)}`);
      }
    });
  }
}
