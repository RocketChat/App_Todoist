import { UIKitViewSubmitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';

export interface IViewSubmitHandler {
  run(
    context: UIKitViewSubmitInteractionContext
  ): Promise<{ success: boolean } | { error: { [key: string]: string } }>;
}
