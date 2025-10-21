import { EmailMessage, EmailSearchParams } from '../types/communication.types';

export const filterEmails = (emails: EmailMessage[], params: EmailSearchParams): EmailMessage[] => {
  return emails.filter((email) => {
    if (params.folder && email.folder !== params.folder) {
      return false;
    }

    if (params.unreadOnly && !email.unread) {
      return false;
    }

    if (params.starredOnly && !email.starred) {
      return false;
    }

    if (params.from && email.from !== params.from) {
      return false;
    }

    if (params.tagIds?.length) {
      const tagIds = email.tags?.map((tag) => tag.id) ?? [];
      if (!params.tagIds.every((tag) => tagIds.includes(tag))) {
        return false;
      }
    }

    if (params.query) {
      const query = params.query.toLowerCase();
      const content = `${email.subject} ${email.preview} ${email.body}`.toLowerCase();
      if (!content.includes(query)) {
        return false;
      }
    }

    return true;
  });
};

export const groupEmailsByDate = (emails: EmailMessage[]): Record<string, EmailMessage[]> => {
  return emails.reduce<Record<string, EmailMessage[]>>((acc, email) => {
    const date = new Date(email.date).toLocaleDateString();
    acc[date] = acc[date] ? [...acc[date], email] : [email];
    return acc;
  }, {});
};

export const formatAttachmentSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};
