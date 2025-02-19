import { IModify } from '@rocket.chat/apps-engine/definition/accessors';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
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
import { ITask } from '../../interfaces/tasks';

export async function tasks(
  app: TodoistApp,
  modify: IModify,
  context: SlashCommandContext
): Promise<void> {
  const logger = app.getLogger();
  const user = context.getSender();
  const room = context.getRoom();
  const taskService = app.getTaskService();

  try {
    const tasks = await taskService.fetch(user);
    if (tasks.length === 0) {
      const message = `No tasks found for the user.`;
      await sendNotification({ modify, user, room, message });
      return;
    }
    const builder = modify.getCreator().startMessage().setRoom(room);
    const blocks = (await Promise.all(tasks.map(createTaskSection))).reduce(
      (acc, val) => acc.concat(val),
      []
    ) as LayoutBlock[];

    builder.setBlocks(blocks);
    await modify.getNotifier().notifyUser(user, builder.getMessage());
  } catch (error) {
    logger.error(`Error fetching tasks: ${error.message}`);
    const msg = modify
      .getCreator()
      .startMessage()
      .setText(`❗️ Unable to retrieve tasks! \n Error: ${error.message}`)
      .setRoom(room);
    await modify.getNotifier().notifyUser(user, msg.getMessage());
  }
}

async function createTaskSection(task: ITask): Promise<LayoutBlock[]> {
  const dueInfo = task.due ? `Due: ${task.due.string || task.due.date}` : 'No due date';

  const taskNameBlock = getSectionBlock(task.content);
  const taskContextBlock = getContextBlock(
    `${dueInfo} | Priority: ${task.priority} | Labels: ${task.labels.join(', ')}`
  );

  const viewButton = getButton({
    labelText: BlockActionEnum.VIEW_TASK_BUTTON,
    blockId: BlockActionEnum.TASK_ACTIONS_BLOCK,
    actionId: BlockActionEnum.VIEW_TASK_ACTION_ID,
    value: `${task.url}`,
    style: 'success',
    url: `${task.url}`,
  });

  const shareButton = getButton({
    labelText: BlockActionEnum.SHARE_TASK_BUTTON,
    blockId: BlockActionEnum.TASK_ACTIONS_BLOCK,
    actionId: BlockActionEnum.SHARE_TASK_ACTION_ID,
    value: `${task.id}`,
    style: 'primary',
  });

  const getCommentsButton = getButton({
    labelText: BlockActionEnum.GET_COMMENTS_BUTTON,
    blockId: BlockActionEnum.TASK_ACTIONS_BLOCK,
    actionId: BlockActionEnum.GET_COMMENTS_ACTION_ID,
    value: `${task.id}`,
  });

  const deleteButton = getButton({
    labelText: BlockActionEnum.DELETE_TASK_BUTTON,
    blockId: BlockActionEnum.TASK_ACTIONS_BLOCK,
    actionId: BlockActionEnum.DELETE_TASK_ACTION_ID,
    value: `${task.id}`,
    style: 'danger',
  });

  const actionBlock = getActionsBlock(BlockActionEnum.TASK_ACTIONS_BLOCK, [
    viewButton,
    shareButton,
    getCommentsButton,
    deleteButton,
  ]);

  return [taskNameBlock, taskContextBlock, actionBlock];
}
