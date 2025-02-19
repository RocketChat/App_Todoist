import { IAppAccessors, IAppInstallationContext, IConfigurationExtend, IHttp, ILogger, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { IAuthData, IOAuth2Client, IOAuth2ClientOptions } from '@rocket.chat/apps-engine/definition/oauth2/IOAuth2';
import { createOAuth2Client } from '@rocket.chat/apps-engine/definition/oauth2/OAuth2';
import { UIActionButtonContext } from '@rocket.chat/apps-engine/definition/ui';
import { IUIKitResponse, UIKitActionButtonInteractionContext, UIKitBlockInteractionContext, UIKitViewSubmitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { TodoistCommand } from './src/commands/TodoistCommand';
import { BlockActionEnum } from './src/enums/BlockAction';
import { ExecuteActionButtonHandler } from './src/handlers/ExecuteActionButtonHandler';
import { ExecuteBlockActionHandler } from './src/handlers/ExecuteBlockActionHandler';
import { ExecuteViewSubmitHandler } from './src/handlers/ExecuteViewSubmitHandler';
import { HttpHelper } from './src/helpers/http';
import { isUserHighHierarchy, sendDirectMessage } from './src/helpers/message';
import { LabelService } from './src/services/LabelService';
import { TaskService } from './src/services/TaskService';
import { ProjectService } from './src/services/ProjectService';
import { SectionService } from './src/services/SectionService';
import { SharedLabelService } from './src/services/SharedLabelService';
import { CommentService } from './src/services/CommentService';

export class TodoistApp extends App {
    public botUser: IUser;
    public readonly botUsername: string = 'todoist-app.bot';
    private readonly oauth2ClientInstance: IOAuth2Client;
    private httpHelperInstance: HttpHelper;
    private labelService: LabelService;
    private taskService: TaskService;
    private projectService: ProjectService;
    private sectionService: SectionService;
    private sharedLabelService: SharedLabelService;
    private commentService: CommentService;

    private oauth2Config: IOAuth2ClientOptions = {
      alias: 'todoist-app',
      accessTokenUri: 'https://todoist.com/oauth/access_token',
      authUri: 'https://todoist.com/oauth/authorize',
      refreshTokenUri: 'https://todoist.com/oauth/access_token',
      revokeTokenUri: 'https://todoist.com/oauth/access_token',
      authorizationCallback: this.authorizationCallback.bind(this),
      defaultScopes: ["task:add,data:read,data:read_write,data:delete"]
    };

    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
        this.oauth2ClientInstance = createOAuth2Client(this, this.oauth2Config);
    }

    private async authorizationCallback(token: IAuthData, user: IUser, read: IRead, modify: IModify, http: IHttp, persistence: IPersistence) {
        const text = `The authentication process has succeeded! :tada:`;
        await sendDirectMessage({ read: read, modify: modify, user: user, message: text, persistence: persistence });

    }

    public async onInstall(context: IAppInstallationContext, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify): Promise<void> {
        const user = context.user;
        const quickReminder = 'Quick reminder: Let your team members know about the Todoist App, so everyone will be able to manage their tasks.\n';
        const text = `Welcome to the Todoist Rocket.Chat App!\n` + `To start managing your projects, tasks, etc. ` + `You first need to complete the app's setup and then authorize your Todoist account.\n` + `To do so, type  \`/todoist auth\`\n` + `${isUserHighHierarchy(user) ? quickReminder : ''}`;
        await sendDirectMessage({ read: read, modify: modify, user: user, message: text, persistence: persistence });
    }

    public getOauth2ClientInstance(): IOAuth2Client {
        return this.oauth2ClientInstance;
    }

    public getLabelService(): LabelService {
        if (!this.labelService) {
        this.labelService = new LabelService(this);
        }
        return this.labelService;
    }

    public getTaskService(): TaskService {
        if (!this.taskService) {
        this.taskService = new TaskService(this);
        }
        return this.taskService;
    }

    public getProjectService(): ProjectService {
        if (!this.projectService) {
        this.projectService = new ProjectService(this);
        }
        return this.projectService;
    }

    public getSectionService(): SectionService {
        if (!this.sectionService) {
            this.sectionService = new SectionService(this);
        }
        return this.sectionService;
    }
    
    public getSharedLabelService(): SharedLabelService {
        if (!this.sharedLabelService) {
            this.sharedLabelService = new SharedLabelService(this);
        }
        return this.sharedLabelService;
    }
    
    public getCommentService(): CommentService {
        if (!this.commentService) {
            this.commentService = new CommentService(this);
        }
        return this.commentService;
    }

    public getHttpHelperInstance(): HttpHelper {
        if (!this.httpHelperInstance) {
            this.httpHelperInstance = new HttpHelper(this, this.getAccessors().http);
        }
        return this.httpHelperInstance;
    }

    public async executeBlockActionHandler(context: UIKitBlockInteractionContext, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify): Promise<IUIKitResponse> {
        const handler = new ExecuteBlockActionHandler(this, modify);
        return handler.run(context);
    }

    public async executeViewSubmitHandler(context: UIKitViewSubmitInteractionContext, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify): Promise<IUIKitResponse> {
        const handler = new ExecuteViewSubmitHandler(this, read, modify);
        return handler.run(context);
      }

    public async executeActionButtonHandler(context: UIKitActionButtonInteractionContext, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify): Promise<IUIKitResponse> {
        const handler = new ExecuteActionButtonHandler(this, modify);
        return handler.run(context);
    }

    public async extendConfiguration(configuration: IConfigurationExtend): Promise<void> {    
        await Promise.all([this.getOauth2ClientInstance().setup(configuration), configuration.slashCommands.provideSlashCommand(new TodoistCommand(this))]);
        configuration.ui.registerButton({
			actionId: BlockActionEnum.CREATE_TASK_FROM_MESSAGE_BUTTON_ACTION_ID,
			labelI18n: BlockActionEnum.CREATE_TASK_FROM_MESSAGE_BUTTON,
			context: UIActionButtonContext.MESSAGE_ACTION,
		});
    }
}