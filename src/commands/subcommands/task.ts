import { IModify } from '@rocket.chat/apps-engine/definition/accessors';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';

import { createTaskModal } from '../../modals/createTaskModal';

export async function task(modify: IModify, context: SlashCommandContext): Promise<void> {
  const user = context.getSender();
  const room = context.getRoom();
  const triggerId = context.getTriggerId();

  const modal = await createTaskModal({ projectId: undefined, roomId: room.id });

  if (triggerId) {
    await modify.getUiController().openSurfaceView(modal, { triggerId }, user);
  } else {
    const msg = modify.getCreator().startMessage().setText(`❗️ Invalid Trigger ID`).setRoom(room);
    await modify.getNotifier().notifyUser(user, msg.getMessage());
  }
}
