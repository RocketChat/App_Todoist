import { IModify } from '@rocket.chat/apps-engine/definition/accessors';
import {
  IUIKitResponse,
  UIKitBlockInteractionContext,
} from '@rocket.chat/apps-engine/definition/uikit';
import { LayoutBlock } from '@rocket.chat/ui-kit';

import { TodoistApp } from '../../../TodoistApp';
import { BlockActionEnum } from '../../enums/BlockAction';
import {
  getActionsBlock,
  getButton,
  getContextBlock,
  getSectionBlock,
} from '../../helpers/blockBuilder';
import { sendNotification } from '../../helpers/message';

interface IComment {
  id: string;
  content: string;
  posted_at: string;
  attachment?: {
    file_name: string;
  };
}

export async function getComments(
  app: TodoistApp,
  modify: IModify,
  context: UIKitBlockInteractionContext
): Promise<IUIKitResponse> {
  const logger = app.getLogger();
  const data = context.getInteractionData();
  const { user, room, value, blockId } = data;
  if (!room) {
    logger.error('Room info not found in context.');
    return context.getInteractionResponder().errorResponse();
  }
  const isProject = blockId.includes('project');

  const comments = await app
    .getCommentService()
    .fetch(user, undefined, isProject ? undefined : value, isProject ? value : undefined);

  if (comments.length === 0) {
    const message = `No comments found on ${isProject ? 'project' : 'task'} ${value}. Create one using the Todoist app or website.`;
    await sendNotification({ modify, user, room, message });
    return context.getInteractionResponder().errorResponse();
  }

  const builder = modify.getCreator().startMessage().setRoom(room!);
  const blocks = (
    await Promise.all(comments.map((comment: IComment) => createCommentSection(comment)))
  ).reduce((acc, val) => acc.concat(val), []) as LayoutBlock[];

  builder.setBlocks(blocks);
  await modify.getNotifier().notifyUser(user, builder.getMessage());
  return context.getInteractionResponder().successResponse();
}

async function createCommentSection(comment: IComment): Promise<LayoutBlock[]> {
  const blocks: LayoutBlock[] = [];

  const commentContentBlock = getSectionBlock(comment.content);
  const commentContextBlock = getContextBlock(
    `Posted: ${new Date(comment.posted_at).toLocaleString()}`
  );
  blocks.push(commentContentBlock, commentContextBlock);

  const shareButton = getButton({
    labelText: BlockActionEnum.SHARE_COMMENT_BUTTON,
    blockId: BlockActionEnum.COMMENT_ACTIONS_BLOCK,
    actionId: BlockActionEnum.SHARE_COMMENT_ACTION_ID,
    value: `${comment.id}`,
    style: 'primary',
  });

  const deleteButton = getButton({
    labelText: BlockActionEnum.DELETE_COMMENT_BUTTON,
    blockId: BlockActionEnum.COMMENT_ACTIONS_BLOCK,
    actionId: BlockActionEnum.DELETE_COMMENT_ACTION_ID,
    value: `${comment.id}`,
    style: 'danger',
  });

  const actionBlock = getActionsBlock(BlockActionEnum.COMMENT_ACTIONS_BLOCK, [
    shareButton,
    deleteButton,
  ]);
  blocks.push(actionBlock);

  if (comment.attachment) {
    const attachmentBlock = getSectionBlock(`📎 Attachment: ${comment.attachment.file_name}`);
    blocks.push(attachmentBlock);
  }

  return blocks;
}
