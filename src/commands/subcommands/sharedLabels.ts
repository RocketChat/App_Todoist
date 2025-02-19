import { IModify } from '@rocket.chat/apps-engine/definition/accessors';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { LayoutBlock } from '@rocket.chat/ui-kit';

import { TodoistApp } from '../../../TodoistApp';
import { BlockActionEnum } from '../../enums/BlockAction';
import { getActionsBlock, getButton, getSectionBlock } from '../../helpers/blockBuilder';
import { sendNotification } from '../../helpers/message';
import { ILabel } from '../../interfaces/labels';

export async function sharedLabels(
  app: TodoistApp,
  modify: IModify,
  context: SlashCommandContext
): Promise<void> {
  const logger = app.getLogger();
  const user = context.getSender();
  const room = context.getRoom();
  const sharedLabelService = app.getSharedLabelService();

  try {
    const labels = await sharedLabelService.fetch(user);

    if (labels.length === 0) {
      const message = `No shared labels found for the user.`;
      await sendNotification({ modify, user, room, message });
      return;
    }
    const builder = modify.getCreator().startMessage().setRoom(room);
    const blocks = (await Promise.all(labels.map(createSharedLabelSection))).reduce(
      (acc, val) => acc.concat(val),
      []
    ) as LayoutBlock[];

    builder.setBlocks(blocks);
    await modify.getNotifier().notifyUser(user, builder.getMessage());
  } catch (error) {
    logger.error(`Error fetching shared labels: ${error.message}`);
    const msg = modify
      .getCreator()
      .startMessage()
      .setText(`❗️ Unable to retrieve shared labels! \n Error: ${error.message}`)
      .setRoom(room);
    await modify.getNotifier().notifyUser(user, msg.getMessage());
  }
}

async function createSharedLabelSection(label: ILabel): Promise<LayoutBlock[]> {
  const labelNameBlock = getSectionBlock(label.name);

  const renameButton = getButton({
    labelText: BlockActionEnum.RENAME_SHARED_LABEL_BUTTON,
    blockId: BlockActionEnum.SHARED_LABEL_ACTIONS_BLOCK,
    actionId: BlockActionEnum.RENAME_SHARED_LABEL_ACTION_ID,
    value: label.name,
  });

  const removeButton = getButton({
    labelText: BlockActionEnum.REMOVE_SHARED_LABEL_BUTTON,
    blockId: BlockActionEnum.SHARED_LABEL_ACTIONS_BLOCK,
    actionId: BlockActionEnum.REMOVE_SHARED_LABEL_ACTION_ID,
    value: label.name,
    style: 'danger',
  });

  const convertButton = getButton({
    labelText: BlockActionEnum.CONVERT_TO_PERSONAL_LABEL_BUTTON,
    blockId: BlockActionEnum.SHARED_LABEL_ACTIONS_BLOCK,
    actionId: BlockActionEnum.CONVERT_TO_PERSONAL_LABEL_ACTION_ID,
    value: label.name,
    style: 'primary',
  });

  const actionBlock = getActionsBlock(BlockActionEnum.SHARED_LABEL_ACTIONS_BLOCK, [
    renameButton,
    removeButton,
    convertButton,
  ]);

  return [labelNameBlock, actionBlock];
}
