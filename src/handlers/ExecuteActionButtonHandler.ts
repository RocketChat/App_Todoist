import { IModify } from '@rocket.chat/apps-engine/definition/accessors';
import {
  IUIKitResponse,
  UIKitActionButtonInteractionContext,
} from '@rocket.chat/apps-engine/definition/uikit';

import { TodoistApp } from '../../TodoistApp';
import { BlockActionEnum } from '../enums/BlockAction';
import { createTaskModal } from '../modals/createTaskModal';

export class ExecuteActionButtonHandler {
  constructor(
    public readonly app: TodoistApp,
    public readonly modify: IModify
  ) {}

  public async run(context: UIKitActionButtonInteractionContext): Promise<IUIKitResponse> {
    const data = context.getInteractionData();
    const { actionId, user, triggerId, room, message } = data;
    const logger = this.app.getLogger();
    if (!room) {
      logger.warn('Room data not present in context.');
      return context.getInteractionResponder().errorResponse();
    }

    try {
      switch (actionId) {
        case BlockActionEnum.CREATE_TASK_FROM_MESSAGE_BUTTON_ACTION_ID:
          const createTaskFromMessageModal = await createTaskModal({
            descriptionText: message?.text,
            projectId: undefined,
            roomId: room.id,
          });
          await this.modify
            .getUiController()
            .openSurfaceView(createTaskFromMessageModal, data, user);
          return context.getInteractionResponder().successResponse();
        default:
          break;
      }
    } catch (error) {
      logger.error(error);
      return context.getInteractionResponder().viewErrorResponse({
        viewId: actionId,
        errors: error,
      });
    }

    return context.getInteractionResponder().successResponse();
  }
}
