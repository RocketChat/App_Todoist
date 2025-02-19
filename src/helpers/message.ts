import { IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IRoom, RoomType } from '@rocket.chat/apps-engine/definition/rooms';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { LayoutBlock } from '@rocket.chat/ui-kit';

import { NotificationParams, getNotificationsStatus } from './notification';

interface GetDirectParams {
  read: IRead;
  modify: IModify;
  appUser: IUser;
  username: string;
}

interface SendMessageParams {
  modify: IModify;
  room: IRoom;
  message: string;
  sender?: IUser;
  blocks?: Array<LayoutBlock>;
}

interface SendNotificationParams {
  modify: IModify;
  user: IUser;
  room: IRoom;
  message: string;
  blocks?: Array<LayoutBlock>;
}

interface SendDirectMessageParams {
  read: IRead;
  modify: IModify;
  user: IUser;
  message?: string;
  persistence: IPersistence;
  blocks?: LayoutBlock[];
}

const HIGH_HIERARCHY_ROLES = ['admin', 'owner', 'moderator'] as const;

/**
 * Gets a direct message room between bot and another user, creating if it doesn't exist
 */
export async function getDirect({
  read,
  modify,
  appUser,
  username,
}: GetDirectParams): Promise<IRoom | undefined> {
  const usernames = [appUser.username, username];

  try {
    const room = await read.getRoomReader().getDirectByUsernames(usernames);
    if (room) {
      return room;
    }

    const newRoom = modify
      .getCreator()
      .startRoom()
      .setType(RoomType.DIRECT_MESSAGE)
      .setCreator(appUser)
      .setMembersToBeAddedByUsernames(usernames);

    const roomId = await modify.getCreator().finish(newRoom);
    return await read.getRoomReader().getById(roomId);
  } catch (error) {
    return undefined;
  }
}

export async function sendMessage({
  modify,
  room,
  message,
  sender,
  blocks,
}: SendMessageParams): Promise<string> {
  const msg = modify
    .getCreator()
    .startMessage()
    .setRoom(room)
    .setGroupable(false)
    .setParseUrls(false)
    .setText(message);

  if (sender) {
    msg.setSender(sender);
  }

  if (blocks) {
    msg.setBlocks(blocks);
  }

  return await modify.getCreator().finish(msg);
}

export async function shouldSendMessage(params: NotificationParams): Promise<boolean> {
  const notificationStatus = await getNotificationsStatus(params);
  return notificationStatus?.status ?? true;
}

export async function sendNotification({
  modify,
  user,
  room,
  message,
  blocks,
}: SendNotificationParams): Promise<void> {
  const msg = modify.getCreator().startMessage().setRoom(room).setText(message);

  if (blocks) {
    msg.setBlocks(blocks);
  }

  return modify.getNotifier().notifyUser(user, msg.getMessage());
}

export async function sendDirectMessage({
  read,
  modify,
  user,
  message = '',
  persistence,
  blocks,
}: SendDirectMessageParams): Promise<string> {
  const appUser = (await read.getUserReader().getAppUser()) as IUser;

  const targetRoom = await getDirect({
    read,
    modify,
    appUser,
    username: user.username,
  });

  if (!targetRoom) {
    throw new Error('Failed to get or create direct message room');
  }

  const shouldSend = await shouldSendMessage({ read, persistence, user });

  if (!shouldSend) {
    return '';
  }

  return await sendMessage({
    modify,
    room: targetRoom,
    sender: appUser,
    message,
    blocks,
  });
}

export function isUserHighHierarchy(user: IUser): boolean {
  return user.roles.some((role) =>
    HIGH_HIERARCHY_ROLES.includes(role as (typeof HIGH_HIERARCHY_ROLES)[number])
  );
}
