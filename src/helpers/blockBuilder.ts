import {
  ActionsBlock,
  ButtonElement,
  ContextBlock,
  DividerBlock,
  InputBlock,
  Option,
  PlainTextInputElement,
  SectionBlock,
  StaticSelectElement,
  ToggleSwitchElement,
  UsersSelectElement,
} from '@rocket.chat/ui-kit';

import { AppEnum } from '../enums/App';

interface BaseElementParams {
  blockId?: string;
  actionId?: string;
  appId?: string;
}

interface ButtonParams extends BaseElementParams {
  labelText: string;
  value?: string;
  style?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
  url?: string;
}

type InputElementType =
  | 'channels_select'
  | 'conversations_select'
  | 'datepicker'
  | 'linear_scale'
  | 'multi_channels_select'
  | 'multi_conversations_select'
  | 'multi_static_select'
  | 'multi_users_select'
  | 'plain_text_input'
  | 'static_select'
  | 'users_select'
  | 'checkbox'
  | 'radio_button'
  | 'time_picker'
  | 'toggle_switch';

interface InputParams extends BaseElementParams {
  labelText: string;
  placeholderText?: string;
  type?: InputElementType;
  options?: {
    initialValue?: string;
    multiline?: boolean;
    initialDate?: string;
    options?: Array<{ text: string; value: string }>;
    minValue?: number;
    maxValue?: number;
  };
}

interface DateInputParams extends BaseElementParams {
  labelText: string;
  placeholderText?: string;
  initialDate?: string;
}

interface StaticSelectParams extends BaseElementParams {
  placeholderText: string;
  options: Array<Option>;
  initialValue?: Option['value'];
}

interface ToggleParams extends BaseElementParams {
  labelText: string;
  options: Array<{ text: string; value: string }>;
}

export function getInputBox({
  labelText,
  placeholderText = '',
  blockId = '',
  actionId = '',
  type = 'plain_text_input',
  options = {},
}: InputParams): InputBlock {
  const baseElement = {
    placeholder: {
      type: 'plain_text' as const,
      text: placeholderText,
    },
    appId: AppEnum.APP_ID,
    blockId,
    actionId,
  };

  let element: InputBlock['element'];

  switch (type) {
    case 'plain_text_input':
      element = {
        ...baseElement,
        type,
        initialValue: options?.initialValue,
        multiline: options?.multiline,
      } as PlainTextInputElement;
      break;

    case 'users_select':
      element = {
        ...baseElement,
        type,
      } as UsersSelectElement;
      break;

    default:
      element = {
        ...baseElement,
        type,
      } as InputBlock['element'];
  }

  return {
    type: 'input',
    label: {
      type: 'plain_text',
      text: labelText,
    },
    element,
  };
}

export function getInputBoxDate({
  labelText,
  placeholderText = '',
  blockId = '',
  actionId = '',
  initialDate,
}: DateInputParams): InputBlock {
  return {
    type: 'input',
    label: {
      type: 'plain_text',
      text: labelText,
    },
    element: {
      type: 'datepicker',
      placeholder: {
        type: 'plain_text',
        text: placeholderText,
      },
      appId: AppEnum.APP_ID,
      blockId,
      actionId,
      initialDate,
    },
  };
}

export function getButton({
  labelText,
  blockId = '',
  actionId = '',
  value,
  style,
  url,
}: ButtonParams): ButtonElement {
  return {
    type: 'button',
    text: {
      type: 'plain_text',
      text: labelText,
    },
    appId: AppEnum.APP_ID,
    blockId,
    actionId,
    url,
    value,
    style,
  };
}

export function getSectionBlock(labelText: string, accessory?: any): SectionBlock {
  return {
    type: 'section',
    text: {
      type: 'plain_text',
      text: labelText,
    },
    accessory,
  };
}

export function getDividerBlock(): DividerBlock {
  return {
    type: 'divider',
  };
}

export function getContextBlock(elementText: string): ContextBlock {
  return {
    type: 'context',
    elements: [
      {
        type: 'plain_text',
        text: elementText,
      },
    ],
  };
}

export function getStaticSelectElement({
  placeholderText,
  options,
  blockId = '',
  actionId = '',
  initialValue,
}: StaticSelectParams): StaticSelectElement {
  return {
    type: 'static_select',
    placeholder: {
      type: 'plain_text',
      text: placeholderText,
    },
    options,
    appId: AppEnum.APP_ID,
    blockId,
    actionId,
    initialValue,
  };
}

export function getOptions(text: string, value: string): Option {
  return {
    text: { type: 'plain_text', text },
    value,
  };
}

export function getActionsBlock(
  blockId: string,
  elements: Array<ButtonElement | StaticSelectElement | ToggleSwitchElement>
): ActionsBlock {
  return {
    type: 'actions',
    blockId,
    elements,
  };
}

export function createToggleButton({
  labelText,
  blockId = '',
  actionId = '',
  options,
}: ToggleParams): InputBlock {
  return {
    type: 'input',
    label: {
      type: 'plain_text',
      text: labelText,
    },
    element: {
      type: 'toggle_switch',
      options: options.map((opt) => ({
        text: { type: 'plain_text', text: opt.text },
        value: opt.value,
      })),
      initialOptions: [],
      appId: AppEnum.APP_ID,
      blockId,
      actionId,
    } as ToggleSwitchElement,
  };
}
