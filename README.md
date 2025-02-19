# Todoist Integration for Rocket.Chat

The Todoist App for Rocket.Chat  provides a seamless integration between Todoist and Rocket.Chat and improves collaboration between teams.
The application allows users to create and manage thier projects and tasks, create new tasks, edit and delete their tasks, sections, comments & labels and do much more right from Rocket.Chat.


## 🚀 Features

- Quick and easy setup
- Login to Todoist with one click using built-in OAuth2 mechanism
- Retrieve and manage tasks right from Rocket.Chat channels
- Create new tasks from Rocket.Chat and make channel of task assignees
- Edit the tasks right in Rocket.Chat and share them with other channel members


## 🔧 Installation steps

 1. Install Rocket.Chat apps CLI: https://developer.rocket.chat/docs/apps-engine-cli
 
 2. Clone this repo and Change Directory:
 ```bash
 git clone https://github.com/RocketChat/App_Todoist.git && cd App_Todoist/
 ```

 3. Install the required packages from `package.json`:
```bash
npm install
```

 4. Deploy Rocket.Chat app:
```bash
rc-apps deploy --url <deployment_url> --username <user_username> --password <user_password>
```
    Where:
    - `<deployment_url>` is your local server URL (if you are running in another port, change the 3000 to the appropriate port)
    - `<user_username>` is the username of your admin user.
    - `<user_password>` is the password of your admin user.

    For more info refer [this](https://developer.rocket.chat/apps-engine/getting-started/rocket.chat-app-engine-cli) guide

## 📲 Setup guide

### Create an app on Todoist:

1. Click on your avatar on Todoist and click on Settings

2. Navigate to Integrations tab, select Developer and click on Build integrations

3. Click on Create an new app, enter desired app name and click on Create app

4. Now in Oauth redirect URL enter your app's todoist-app-callback url (generally in format https://subdomain.domain.tld/api/apps/public/app-id/todoist-app-callback)

5. Copy the Client ID and Client Secret from this page and click on Save settings

### Configure the Todoist app on your server:

1. Navigate to Administration->Apps

2. Select the Installed tab

3. Click on Todoist, and go to Settings tab

4. Enter your generated Client ID and Client Secret and click on Save changes button

### Start using the app:

Start the authorization by using `/todoist auth` slash command.

