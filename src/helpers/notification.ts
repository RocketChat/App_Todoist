import { IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import {
  RocketChatAssociationModel,
  RocketChatAssociationRecord,
} from '@rocket.chat/apps-engine/definition/metadata/RocketChatAssociations';
import { IUser } from '@rocket.chat/apps-engine/definition/users/IUser';

export interface NotificationParams {
  read: IRead;
  persistence: IPersistence;
  user: IUser;
}

interface INotificationsStatus {
  status: boolean;
}

function createAssociations(userId: string): RocketChatAssociationRecord[] {
  return [
    new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'todoist-notifications'),
    new RocketChatAssociationRecord(RocketChatAssociationModel.USER, userId),
  ];
}

export async function getNotificationsStatus({
  read,
  user,
}: Pick<NotificationParams, 'read' | 'user'>): Promise<INotificationsStatus | undefined> {
  const associations = createAssociations(user.id);
  const [record] = await read.getPersistenceReader().readByAssociations(associations);
  return record as INotificationsStatus;
}

export async function setNotificationsStatus({
  persistence,
  user,
  status,
}: Pick<NotificationParams, 'persistence' | 'user'> & { status: boolean }): Promise<boolean> {
  const associations = createAssociations(user.id);
  await persistence.createWithAssociations({ status }, associations);
  return status;
}

export async function updateNotificationsStatus({
  read,
  persistence,
  user,
  status,
}: NotificationParams & { status: boolean }): Promise<boolean> {
  const notificationsStatus = await getNotificationsStatus({ read, user });

  if (!notificationsStatus) {
    return setNotificationsStatus({ persistence, user, status });
  }

  const associations = createAssociations(user.id);
  await persistence.updateByAssociations(associations, { status });
  return status;
}

export async function deleteNotifications({
  persistence,
  user,
}: Pick<NotificationParams, 'persistence' | 'user'>): Promise<void> {
  const associations = createAssociations(user.id);
  await persistence.removeByAssociations(associations);
}
