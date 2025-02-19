import { IModify } from '@rocket.chat/apps-engine/definition/accessors';
import {
  IUIKitResponse,
  UIKitBlockInteractionContext,
} from '@rocket.chat/apps-engine/definition/uikit';

import { TodoistApp } from '../../TodoistApp';
import { BlockActionEnum } from '../enums/BlockAction';
import { sendMessage } from '../helpers/message';
import { createTaskModal } from '../modals/createTaskModal';
import { deleteConfirmationModal } from '../modals/deleteConfirmationModal';
import { getComments } from './subhandlers/getComments';

export class ExecuteBlockActionHandler {
  constructor(
    private readonly app: TodoistApp,
    private readonly modify: IModify
  ) {}

  public async run(context: UIKitBlockInteractionContext): Promise<IUIKitResponse> {
    const data = context.getInteractionData();
    const { actionId, user, triggerId, room, value } = data;
    const logger = this.app.getLogger();
    if (!room) {
      logger.error('Room data not present in context.');
      return context.getInteractionResponder().errorResponse();
    }
    if (!value) {
      logger.error('Value is missing in context.');
      return context.getInteractionResponder().errorResponse();
    }

    const projectService = this.app.getProjectService();
    const taskService = this.app.getTaskService();
    const sectionService = this.app.getSectionService();
    const commentService = this.app.getCommentService();
    let message: string;
    try {
      switch (actionId) {
        case BlockActionEnum.CREATE_TASK_IN_PROJECT_BUTTON_ACTION_ID:
          const createTaskFromProjectModal = await createTaskModal({
            projectId: data.value,
            roomId: room.id,
          });
          await this.modify
            .getUiController()
            .openSurfaceView(createTaskFromProjectModal, data, user);
          return context.getInteractionResponder().successResponse();
        case BlockActionEnum.SHARE_PROJECT_ACTION_ID:
          const [project] = await projectService.fetch(user, value);
          message = `[${project.name}](${project.url}) | Comments: ${project.comment_count} | Color: ${project.color} | Favourite: ${project.is_favorite ? 'Yes' : 'No'}`;
          await sendMessage({ modify: this.modify, room, message });
          return context.getInteractionResponder().successResponse();
        case BlockActionEnum.SHARE_TASK_ACTION_ID:
          const [task] = await taskService.fetch(user, value);
          const dueInfo = task.due ? `Due: ${task.due.string || task.due.date}` : 'No due date';
          message = `[${task.content}](${task.url}) | ${dueInfo} | Priority: ${task.priority} | Labels: ${task.labels.join(', ')} | Comments: ${task.comment_count}`;
          await sendMessage({ modify: this.modify, room, message });
          return context.getInteractionResponder().successResponse();
        case BlockActionEnum.SHARE_SECTION_ACTION_ID:
          const [section] = await sectionService.fetch(user, value);
          message = `Section: ${section.name} | Project ID: ${section.project_id} | Order: ${section.order}`;
          await sendMessage({ modify: this.modify, room, message });
          return context.getInteractionResponder().successResponse();
        case BlockActionEnum.SHARE_COMMENT_ACTION_ID:
          const [comment] = await commentService.fetch(user, value);
          const attachment = comment.attachment
            ? `| Attachment: [${comment.attachment.file_name}](${comment.attachment.file_url})`
            : '';
          message = `${comment.content} | Posted: ${new Date(comment.posted_at).toLocaleString()} ${attachment}`;
          await sendMessage({ modify: this.modify, room, message });
          return context.getInteractionResponder().successResponse();
        case BlockActionEnum.GET_COMMENTS_ACTION_ID:
          await getComments(this.app, this.modify, context);
        case BlockActionEnum.DELETE_TASK_ACTION_ID:
        case BlockActionEnum.DELETE_SECTION_ACTION_ID:
        case BlockActionEnum.DELETE_LABEL_ACTION_ID:
        case BlockActionEnum.DELETE_COMMENT_ACTION_ID:
          const modal = await deleteConfirmationModal({ itemId: value, actionId, roomId: room.id });
          await this.modify.getUiController().openSurfaceView(modal, data, user);
          return context.getInteractionResponder().successResponse();
        default:
          logger.warn(`Invalid Action ID: ${actionId} received.`);
          return context.getInteractionResponder().errorResponse();
      }
    } catch (error) {
      logger.error(error.message);
      return context.getInteractionResponder().viewErrorResponse({
        viewId: actionId,
        errors: error?.message,
      });
    }
  }
}
