import { IUIKitSurfaceViewParam } from '@rocket.chat/apps-engine/definition/accessors';
import { UIKitSurfaceType } from '@rocket.chat/apps-engine/definition/uikit';

import { ModalsEnum } from '../enums/Modals';
import { getButton, getSectionBlock } from '../helpers/blockBuilder';

export async function deleteConfirmationModal({
  itemId,
  actionId,
  roomId,
}: {
  itemId: string;
  actionId: string;
  roomId: string;
}): Promise<IUIKitSurfaceViewParam> {
  const itemType = actionId.split('delete-')[1];
  const modalKey = `DELETE_${itemType.toUpperCase()}` as keyof typeof ModalsEnum;
  const viewId = ModalsEnum[modalKey] + `#${roomId}`;

  const confirmationMessage = getSectionBlock(`Are you sure you want to delete the ${itemType}?`);

  const [closeButton, submitButton] = await Promise.all([
    getButton({
      labelText: 'Cancel',
      style: 'secondary',
    }),
    getButton({
      labelText: ModalsEnum.DELETE_CONFIRMATION_SUBMIT_BUTTON_LABEL,
      actionId,
      value: itemId,
      style: 'danger',
    }),
  ]);

  return {
    id: viewId,
    type: UIKitSurfaceType.MODAL,
    title: {
      type: 'plain_text',
      text: ModalsEnum.DELETE_CONFIRMATION_MODAL_NAME,
    },
    close: closeButton,
    submit: submitButton,
    blocks: [confirmationMessage],
  };
}
