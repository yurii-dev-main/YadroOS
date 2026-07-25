import { useCallback, useEffect, useMemo, useState } from 'react';
import { emailService } from '../services/email.service';
import {
  ClientSummary,
  EmailMessage,
  EmailSearchParams,
  EmailTag
} from '../types/communication.types';

export const useEmails = (initialParams: EmailSearchParams = {}) => {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<EmailSearchParams>(initialParams);
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [tags, setTags] = useState<EmailTag[]>([]);

  const fetchEmails = useCallback(async (params: EmailSearchParams) => {
    setIsLoading(true);
    const data = await emailService.fetchEmails(params);
    setEmails(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchEmails(searchParams);
  }, [fetchEmails, searchParams]);

  useEffect(() => {
    emailService.fetchClients().then(setClients);
    emailService.fetchTags().then(setTags);
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(emails.map((email) => email.id));
  }, [emails]);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const updateEmail = useCallback(async (id: string, changes: Partial<EmailMessage>) => {
    const updated = await emailService.updateEmailStatus(id, changes);
    if (!updated) return;
    setEmails((prev) => prev.map((email) => (email.id === id ? updated : email)));
  }, []);

  const moveToFolder = useCallback(
    async (folder: EmailMessage['folder']) => {
      await emailService.moveToFolder(selectedIds, folder);
      setEmails((prev) =>
        prev.map((email) =>
          selectedIds.includes(email.id) ? { ...email, folder, unread: false } : email
        )
      );
      clearSelection();
    },
    [clearSelection, selectedIds]
  );

  const attachToClient = useCallback(async (emailId: string, clientId: string) => {
    const updated = await emailService.attachToClient(emailId, clientId);
    setEmails((prev) => prev.map((email) => (email.id === emailId ? updated : email)));
  }, []);

  const createClientFromEmail = useCallback(async (emailId: string) => {
    const client = await emailService.createClientFromEmail(emailId);
    setClients((prev) => [...prev, client]);
    return client;
  }, []);

  const bulkMarkRead = useCallback(async () => {
    await Promise.all(
      selectedIds.map((id) => emailService.updateEmailStatus(id, { unread: false }))
    );
    setEmails((prev) =>
      prev.map((email) => (selectedIds.includes(email.id) ? { ...email, unread: false } : email))
    );
    clearSelection();
  }, [clearSelection, selectedIds]);

  const filteredEmails = useMemo(() => emails, [emails]);

  return {
    emails: filteredEmails,
    clients,
    tags,
    searchParams,
    setSearchParams,
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    isLoading,
    moveToFolder,
    updateEmail,
    attachToClient,
    createClientFromEmail,
    bulkMarkRead,
    refresh: () => fetchEmails(searchParams)
  };
};
