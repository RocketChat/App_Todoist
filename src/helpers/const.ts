const ApiBaseUrl: string = 'https://api.todoist.com/rest/v2';

const ApiEndpoint = {
  Projects: 'projects',
  Sections: 'sections',
  Tasks: 'tasks',
  Comments: 'comments',
  Project: (projectId: string) => `projects/${projectId}`,
  Section: (sectionId: string) => `sections/${sectionId}`,
  Task: (taskId: string, subCommand?: 'close' | 'reopen') =>
    `tasks/${taskId}${subCommand ? `/${subCommand}` : ''}`,
  Comment: (commentId: string) => `comments/${commentId}`,
  CollaboratorsOf: (projectId: string) => `projects/${projectId}/collaborators`,
  Labels: 'labels',
  SharedLabels: 'labels/shared',
  Label: (labelId: string) => `labels/${labelId}`,
  RenameSharedLabel: 'labels/shared/rename',
  RemoveSharedLabel: 'labels/shared/remove',
};

export const getProjectsUrl = () => {
  return `${ApiBaseUrl}/${ApiEndpoint.Projects}`;
};

export const getSectionsUrl = () => {
  return `${ApiBaseUrl}/${ApiEndpoint.Sections}`;
};

export const getTasksUrl = () => {
  return `${ApiBaseUrl}/${ApiEndpoint.Tasks}`;
};

export const getCommentsUrl = (taskId?: string, projectId?: string) => {
  return `${ApiBaseUrl}/${ApiEndpoint.Comments}${projectId ? `?project_id=${projectId}` : `?task_id=${taskId}`}`;
};

export const getCollaboratorsOfProject = (projectId: string) => {
  return `${ApiBaseUrl}/${ApiEndpoint.CollaboratorsOf(projectId)}`;
};

export const getProjectUrl = (projectId: string) => {
  return `${ApiBaseUrl}/${ApiEndpoint.Project(projectId)}`;
};

export const getSectionUrl = (sectionId: string) => {
  return `${ApiBaseUrl}/${ApiEndpoint.Section(sectionId)}`;
};

export const getTaskUrl = (taskId: string) => {
  return `${ApiBaseUrl}/${ApiEndpoint.Task(taskId)}`;
};

export const getCommentUrl = (commentId: string) => {
  return `${ApiBaseUrl}/${ApiEndpoint.Comment(commentId)}`;
};

export const getLabelsUrl = () => {
  return `${ApiBaseUrl}/${ApiEndpoint.Labels}`;
};

export const getSharedLabelsUrl = (omitPersonal: boolean = false) => {
  return `${ApiBaseUrl}/${ApiEndpoint.SharedLabels}${omitPersonal ? '?omit_personal=true' : ''}`;
};

export const getLabelUrl = (labelId: string) => {
  return `${ApiBaseUrl}/${ApiEndpoint.Label(labelId)}`;
};

export const renameSharedLabelUrl = () => {
  return `${ApiBaseUrl}/${ApiEndpoint.RenameSharedLabel}`;
};

export const removeSharedLabelUrl = () => {
  return `${ApiBaseUrl}/${ApiEndpoint.RemoveSharedLabel}`;
};
