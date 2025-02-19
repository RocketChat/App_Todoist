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
import { ILabel } from '../../interfaces/labels';

export async function labels(
  app: TodoistApp,
  modify: IModify,
  context: SlashCommandContext
): Promise<void> {
  const logger = app.getLogger();
  const user = context.getSender();
  const room = context.getRoom();
  const labelService = app.getLabelService();

  try {
    const labels = await labelService.fetch(user);
    if (labels.length === 0) {
      const message = `No labels found for the user.`;
      await sendNotification({ modify, user, room, message });
      return;
    }
    const builder = modify.getCreator().startMessage().setRoom(room);
    const blocks = (await Promise.all(labels.map(createLabelSection))).reduce(
      (acc, val) => acc.concat(val),
      []
    ) as LayoutBlock[];

    builder.setBlocks(blocks);
    await modify.getNotifier().notifyUser(user, builder.getMessage());
  } catch (error) {
    logger.error(`Error fetching labels: ${error.message}`);
    const msg = modify
      .getCreator()
      .startMessage()
      .setText(`❗️ Unable to retrieve labels! \n Error: ${error.message}`)
      .setRoom(room);
    await modify.getNotifier().notifyUser(user, msg.getMessage());
  }
}

async function createLabelSection(label: ILabel): Promise<LayoutBlock[]> {
  const labelNameBlock = getSectionBlock(label.name);
  const labelContextBlock = getContextBlock(
    `Color: ${String(label.color).charAt(0).toUpperCase() + String(label.color).slice(1)} | ` +
      `Order: ${label.order} | Favorite: ${label.is_favorite ? 'Yes' : 'No'}`
  );

  const shareButton = getButton({
    labelText: BlockActionEnum.SHARE_LABEL_BUTTON,
    blockId: BlockActionEnum.LABEL_ACTIONS_BLOCK,
    actionId: BlockActionEnum.SHARE_LABEL_ACTION_ID,
    value: label.id,
    style: 'primary',
  });

  const deleteButton = getButton({
    labelText: BlockActionEnum.DELETE_LABEL_BUTTON,
    blockId: BlockActionEnum.LABEL_ACTIONS_BLOCK,
    actionId: BlockActionEnum.DELETE_LABEL_ACTION_ID,
    value: label.id,
    style: 'danger',
  });

  const actionBlock = getActionsBlock(BlockActionEnum.LABEL_ACTIONS_BLOCK, [
    shareButton,
    deleteButton,
  ]);

  return [labelNameBlock, labelContextBlock, actionBlock];
}
