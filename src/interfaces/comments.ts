export interface IComment {
  content: string;
  id: string;
  posted_at: string;
  project_id: any;
  task_id: string;
  attachment: ICommentAttachment;
}

export interface ICommentAttachment {
  file_name: string;
  file_type: string;
  file_url: string;
  resource_type: string;
}
