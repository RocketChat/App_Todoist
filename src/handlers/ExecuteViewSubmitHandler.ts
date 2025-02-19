import { IModify, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { UIKitViewSubmitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';

import { TodoistApp } from '../../TodoistApp';
import { ModalsEnum } from '../enums/Modals';
import { sendNotification } from '../helpers/message';
import { IViewSubmitHandler } from '../interfaces/app';
import { createTask } from './subhandlers/createTask';

export class ExecuteViewSubmitHandler implements IViewSubmitHandler {
  constructor(
    private readonly app: TodoistApp,
    private readonly read: IRead,
    private readonly modify: IModify
  ) {}

  public async run(context: UIKitViewSubmitInteractionContext) {
    const logger = this.app.getLogger();
    const data = context.getInteractionData();
    let { view, room, user } = data;
    const itemId = view.submit?.value;
    if (!itemId) {
      logger.error('Surface View Submit button has no associated value!');
      return context.getInteractionResponder().errorResponse();
    }

    const [viewId, roomId] = view.id.split('#');

    if (!room) {
      logger.warn('Room data not present in context.');
      room = await this.read.getRoomReader().getById(roomId);
      if (!room) {
        logger.error(`Room with id: ${roomId} does not exist.`);
        return context.getInteractionResponder().errorResponse();
      }
    }
    const labelService = this.app.getLabelService();
    const taskService = this.app.getTaskService();
    const sectionService = this.app.getSectionService();
    const commentService = this.app.getCommentService();

    try {
      switch (viewId) {
        case ModalsEnum.CREATE_TASK:
          await createTask({ app: this.app, context, room, modify: this.modify });
          return context.getInteractionResponder().successResponse();
        case ModalsEnum.DELETE_TASK:
          await taskService.delete(user, itemId);
          await sendNotification({
            modify: this.modify,
            user,
            room,
            message: '✅ Task deleted successfully!',
          });
        case ModalsEnum.DELETE_SECTION:
          await sectionService.delete(user, itemId);
          await sendNotification({
            modify: this.modify,
            user,
            room,
            message: '✅ Section deleted successfully!',
          });
          return context.getInteractionResponder().successResponse();
        case ModalsEnum.DELETE_LABEL:
          await labelService.delete(user, itemId);
          await sendNotification({
            modify: this.modify,
            user,
            room,
            message: '✅ Label deleted successfully!',
          });
          return context.getInteractionResponder().successResponse();
        case ModalsEnum.DELETE_COMMENT:
          await commentService.delete(user, itemId);
          await sendNotification({
            modify: this.modify,
            user,
            room,
            message: '✅ Comment deleted successfully!',
          });
          return context.getInteractionResponder().successResponse();
        default:
          logger.warn(`Invalid ${viewId} received in context.`);
          return context.getInteractionResponder().errorResponse();
      }
    } catch (error) {
      logger.error(error);
      await sendNotification({
        modify: this.modify,
        user,
        room,
        message: `❗️ Unable to process your request! \nError: ${error.message}`,
      });
      return context.getInteractionResponder().viewErrorResponse({
        viewId: data.view.id,
        errors: error.message,
      });
    }
  }
}
