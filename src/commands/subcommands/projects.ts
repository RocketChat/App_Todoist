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
import { IProject } from '../../interfaces/projects';

export async function projects(
  app: TodoistApp,
  modify: IModify,
  context: SlashCommandContext
): Promise<void> {
  const logger = app.getLogger();
  const user = context.getSender();
  const room = context.getRoom();
  const projectService = app.getProjectService();

  try {
    const projects = await projectService.fetch(user);
    if (projects.length === 0) {
      const message = `No projects found for the user.`;
      await sendNotification({ modify, user, room, message });
      return;
    }
    const builder = modify.getCreator().startMessage().setRoom(room);
    const blocks = (await Promise.all(projects.map(createProjectSection))).reduce(
      (acc, val) => acc.concat(val),
      []
    ) as LayoutBlock[];

    builder.setBlocks(blocks);
    await modify.getNotifier().notifyUser(user, builder.getMessage());
  } catch (error) {
    logger.error(`Error fetching projects: ${error.message}`);
    const msg = modify
      .getCreator()
      .startMessage()
      .setText(`❗️ Unable to retrieve projects! \n Error: ${error.message}`)
      .setRoom(room);
    await modify.getNotifier().notifyUser(user, msg.getMessage());
  }
}

async function createProjectSection(project: IProject): Promise<LayoutBlock[]> {
  const projectNameSectionBlock = getSectionBlock(project.name);
  const projectDescriptionContextBlock = getContextBlock(
    `Color: ${String(project.color).charAt(0).toUpperCase() + String(project.color).slice(1)} | ` +
      `Favourite: ${project.is_favorite ? 'Yes' : 'No'}`
  );

  const viewProjectButton = getButton({
    labelText: BlockActionEnum.VIEW_PROJECT_BUTTON,
    blockId: BlockActionEnum.PROJECT_ACTIONS_BLOCK,
    actionId: BlockActionEnum.VIEW_PROJECT_ACTION_ID,
    value: `${project.url}`,
    style: 'success',
    url: `${project.url}`,
  });

  const shareProjectButton = getButton({
    labelText: BlockActionEnum.SHARE_PROJECT_BUTTON,
    blockId: BlockActionEnum.PROJECT_ACTIONS_BLOCK,
    actionId: BlockActionEnum.SHARE_PROJECT_ACTION_ID,
    value: `${project.id}`,
    style: 'primary',
  });

  const createTaskInProjectButton = getButton({
    labelText: BlockActionEnum.CREATE_TASK_IN_PROJECT_BUTTON,
    blockId: BlockActionEnum.PROJECT_ACTIONS_BLOCK,
    actionId: BlockActionEnum.CREATE_TASK_IN_PROJECT_BUTTON_ACTION_ID,
    value: `${project.id}`,
  });

  const getCommentsButton = getButton({
    labelText: BlockActionEnum.GET_COMMENTS_BUTTON,
    blockId: BlockActionEnum.PROJECT_ACTIONS_BLOCK,
    actionId: BlockActionEnum.GET_COMMENTS_ACTION_ID,
    value: `${project.id}`,
  });

  const projectActionBlock = getActionsBlock(BlockActionEnum.PROJECT_ACTIONS_BLOCK, [
    viewProjectButton,
    shareProjectButton,
    createTaskInProjectButton,
    getCommentsButton,
  ]);

  return [projectNameSectionBlock, projectDescriptionContextBlock, projectActionBlock];
}
