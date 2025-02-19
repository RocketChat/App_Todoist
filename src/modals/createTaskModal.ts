import { IUIKitSurfaceViewParam } from '@rocket.chat/apps-engine/definition/accessors';
import { UIKitSurfaceType } from '@rocket.chat/apps-engine/definition/uikit';
import { LayoutBlock } from '@rocket.chat/ui-kit';

import { ModalsEnum } from '../enums/Modals';
import {
  getActionsBlock,
  getButton,
  getInputBox,
  getInputBoxDate,
  getOptions,
  getStaticSelectElement,
} from '../helpers/blockBuilder';

export async function createTaskModal({
  roomId,
  projectId,
  descriptionText,
}: {
  roomId: string;
  projectId?: string;
  descriptionText?: string;
}): Promise<IUIKitSurfaceViewParam> {
  const viewId = ModalsEnum.CREATE_TASK + `#${roomId}`;

  const blocks = (
    await Promise.all([createProjectSection(projectId), createTaskDetailsSection(descriptionText)])
  ).reduce((acc, val) => acc.concat(val), []) as LayoutBlock[];

  const [closeButton, submitButton] = await Promise.all([
    getButton({
      labelText: 'Cancel',
      style: 'secondary',
    }),
    getButton({
      labelText: ModalsEnum.CREATE_TASK_MODAL_SUBMIT_BUTTON_LABEL,
      style: 'success',
      value: 'submit',
    }),
  ]);

  return {
    id: viewId,
    type: UIKitSurfaceType.MODAL,
    title: {
      type: 'plain_text',
      text: ModalsEnum.CREATE_TASK_MODAL_NAME,
    },
    close: closeButton,
    submit: submitButton,
    blocks,
  };
}

async function createProjectSection(projectId?: string): Promise<LayoutBlock[]> {
  if (!projectId) {
    return [];
  }

  const projectIdInputBox = getInputBox({
    labelText: ModalsEnum.PROJECT_ID_INPUT_LABEL,
    placeholderText: ModalsEnum.PROJECT_ID_INPUT_LABEL_DEFAULT,
    blockId: ModalsEnum.PROJECT_ID_BLOCK,
    actionId: ModalsEnum.PROJECT_ID_INPUT,
    type: 'plain_text_input',
    options: { initialValue: projectId },
  });

  return [projectIdInputBox];
}

async function createTaskDetailsSection(descriptionText?: string): Promise<LayoutBlock[]> {
  const [taskNameInputbox, taskPriorityActionBlock, taskDescriptionInputBox, taskDueDateInputBox] =
    await Promise.all([
      getInputBox({
        labelText: ModalsEnum.TASK_NAME_INPUT_LABEL,
        placeholderText: ModalsEnum.TASK_NAME_INPUT_LABEL_DEFAULT,
        blockId: ModalsEnum.TASK_NAME_BLOCK,
        actionId: ModalsEnum.TASK_NAME_INPUT,
      }),
      createPrioritySection(),
      getInputBox({
        labelText: ModalsEnum.TASK_DESCRIPTION_INPUT_LABEL,
        placeholderText: ModalsEnum.TASK_DESCRIPTION_INPUT_LABEL_DEFAULT,
        blockId: ModalsEnum.TASK_DESCRIPTION_BLOCK,
        actionId: ModalsEnum.TASK_DESCRIPTION_INPUT,
        options: {
          initialValue: descriptionText ?? '',
          multiline: true,
        },
      }),
      getInputBoxDate({
        labelText: ModalsEnum.TASK_DUE_DATE_INPUT_LABEL,
        placeholderText: '',
        blockId: ModalsEnum.TASK_DUE_DATE_BLOCK,
        actionId: ModalsEnum.TASK_DUE_DATE_INPUT,
      }),
    ]);

  return [taskNameInputbox, taskPriorityActionBlock, taskDescriptionInputBox, taskDueDateInputBox];
}

async function createPrioritySection(): Promise<LayoutBlock> {
  const [option1, option2, option3, option4] = await Promise.all([
    getOptions('Urgent', '4'),
    getOptions('High', '3'),
    getOptions('Normal', '2'),
    getOptions('Low', '1'),
  ]);

  const taskPrioritySelectElement = getStaticSelectElement({
    placeholderText: ModalsEnum.TASK_PRIORITY_PLACEHOLDER,
    options: [option1, option2, option3, option4],
    blockId: ModalsEnum.TASK_PRIORITY_BLOCK,
    actionId: ModalsEnum.TASK_PRIORITY_ACTION_ID,
    initialValue: 'Normal',
  });

  return getActionsBlock(ModalsEnum.TASK_PRIORITY_BLOCK, [taskPrioritySelectElement]);
}
