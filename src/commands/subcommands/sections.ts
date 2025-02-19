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
import { ISection } from '../../interfaces/sections';

export async function sections(
  app: TodoistApp,
  modify: IModify,
  context: SlashCommandContext
): Promise<void> {
  const logger = app.getLogger();
  const user = context.getSender();
  const room = context.getRoom();
  const sectionService = app.getSectionService();

  try {
    const sections = await sectionService.fetch(user);
    if (sections.length === 0) {
      const message = `No projects found for the user.`;
      await sendNotification({ modify, user, room, message });
      return;
    }
    const builder = modify.getCreator().startMessage().setRoom(room);
    const blocks = (await Promise.all(sections.map(createSectionBlock))).reduce(
      (acc, val) => acc.concat(val),
      []
    ) as LayoutBlock[];

    builder.setBlocks(blocks);
    await modify.getNotifier().notifyUser(user, builder.getMessage());
  } catch (error) {
    logger.error(`Error fetching sections: ${error.message}`);
    const msg = modify
      .getCreator()
      .startMessage()
      .setText(`❗️ Unable to retrieve sections! \n Error: ${error.message}`)
      .setRoom(room);
    await modify.getNotifier().notifyUser(user, msg.getMessage());
  }
}

async function createSectionBlock(section: ISection): Promise<LayoutBlock[]> {
  const sectionNameBlock = getSectionBlock(section.name);
  const sectionContextBlock = getContextBlock(
    `Project ID: ${section.project_id} | Order: ${section.order}`
  );

  const shareButton = getButton({
    labelText: BlockActionEnum.SHARE_SECTION_BUTTON,
    blockId: BlockActionEnum.SECTION_ACTIONS_BLOCK,
    actionId: BlockActionEnum.SHARE_SECTION_ACTION_ID,
    value: `${section.id}`,
    style: 'primary',
  });

  const deleteButton = getButton({
    labelText: BlockActionEnum.DELETE_SECTION_BUTTON,
    blockId: BlockActionEnum.SECTION_ACTIONS_BLOCK,
    actionId: BlockActionEnum.DELETE_SECTION_ACTION_ID,
    value: `${section.id}`,
    style: 'danger',
  });

  const actionBlock = getActionsBlock(BlockActionEnum.SECTION_ACTIONS_BLOCK, [
    shareButton,
    deleteButton,
  ]);

  return [sectionNameBlock, sectionContextBlock, actionBlock];
}
