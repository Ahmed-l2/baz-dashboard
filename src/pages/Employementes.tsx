import { useState } from 'react';
import { Users, Trash2, Mail, Phone, Briefcase, ChevronDown, ChevronRight, Send } from 'lucide-react';
import { useEmploymentApplications, useDeleteEmploymentApplication } from '../hooks/useEmploymentApplications';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Loader } from '../components/loader';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import i18n from '../i18n';
import toast from 'react-hot-toast';

export default function EmploymentApplications() {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailLanguage, setEmailLanguage] = useState('en');
  const [isSending, setIsSending] = useState(false);
  const { t } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { data: applications, isLoading } = useEmploymentApplications();
  const deleteMutation = useDeleteEmploymentApplication();

  const toggleRow = (applicationId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(applicationId)) {
      newExpanded.delete(applicationId);
    } else {
      newExpanded.add(applicationId);
    }
    setExpandedRows(newExpanded);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('employmentApplications.confirmDelete'))) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleForwardClick = (application: any) => {
    setSelectedApplication(application);
    setRecipientEmail('');
    setEmailLanguage(isRTL ? 'ar' : 'en');
    setForwardModalOpen(true);
  };

  const handleSendEmail = async () => {
    if (!recipientEmail || !selectedApplication) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      toast.error(t('employmentApplications.forwardModal.error'));
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-application-email`,
        {
          method: 'POST',
          headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
            },
          body: JSON.stringify({
            application: selectedApplication,
            recipientEmail,
            language: emailLanguage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send email');
      }

      toast.success(t('employmentApplications.forwardModal.success'));
      setForwardModalOpen(false);
      setRecipientEmail('');
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(t('employmentApplications.forwardModal.error'));
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const locale = isRTL ? 'ar-EG' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
     <Loader />
    );
  }

  return (
    <div className={` ${isRTL ? 'lg:pr-64' : 'lg:pl-64'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <main className="py-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className={`text-3xl font-bold leading-tight tracking-tight text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('employmentApplications.title')}
              </h1>
              <p className={`mt-2 text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('employmentApplications.description')}
              </p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                {t('employmentApplications.table.applicantName')}
              </TableHead>
              <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                {t('employmentApplications.table.contact')}
              </TableHead>
              <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                {t('employmentApplications.table.fieldOfWork')}
              </TableHead>
              <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                {t('employmentApplications.table.appliedDate')}
              </TableHead>
              <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                {t('employmentApplications.table.details')}
              </TableHead>
              <TableHead className="relative">
                <span className="sr-only">{t('employmentApplications.table.actions')}</span>
              </TableHead>
            </TableHeader>
            <TableBody>
              {applications?.map((application) => (
                <>
                  <TableRow key={application.id}>
                    <TableCell className={`font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                      {application.full_name}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{application.email}</span>
                        </div>
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{application.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                        <Briefcase className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {application.field_of_work}
                      </span>
                    </TableCell>
                    <TableCell className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {formatDate(application.created_at)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={expandedRows.has(application.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        onClick={() => toggleRow(application.id)}
                      >
                        {expandedRows.has(application.id) ? t('employmentApplications.actions.hide') : t('employmentApplications.actions.view')}
                      </Button>
                    </TableCell>
                    <TableCell className={`${isRTL ? 'text-left' : 'text-right'}`}>
                      <div className={`flex ${isRTL ? 'flex-row' : 'flex-row-reverse'} gap-2 justify-end`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Send className="h-4 w-4" />}
                          onClick={() => handleForwardClick(application)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          {t('employmentApplications.actions.forward')}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 className="h-4 w-4" />}
                          onClick={() => handleDelete(application.id)}
                          loading={deleteMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {t('employmentApplications.actions.delete')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedRows.has(application.id) && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-gray-50 border-t-0">
                        <div className="py-4">
                          <h4 className={`text-sm font-medium text-gray-900 mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {t('employmentApplications.details.title')}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={`block text-xs font-medium text-gray-500 uppercase tracking-wide ${isRTL ? 'text-right' : 'text-left'}`}>
                                {t('employmentApplications.details.fullName')}
                              </label>
                              <p className={`mt-1 text-sm text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                                {application.full_name}
                              </p>
                            </div>
                            <div>
                              <label className={`block text-xs font-medium text-gray-500 uppercase tracking-wide ${isRTL ? 'text-right' : 'text-left'}`}>
                                {t('employmentApplications.details.fieldOfWork')}
                              </label>
                              <p className={`mt-1 text-sm text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                                {application.field_of_work}
                              </p>
                            </div>
                            <div>
                              <label className={`block text-xs font-medium text-gray-500 uppercase tracking-wide ${isRTL ? 'text-right' : 'text-left'}`}>
                                {t('employmentApplications.details.emailAddress')}
                              </label>
                              <p className={`mt-1 text-sm text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                                <a href={`mailto:${application.email}`} className="text-blue-600 hover:text-blue-800">
                                  {application.email}
                                </a>
                              </p>
                            </div>
                            <div>
                              <label className={`block text-xs font-medium text-gray-500 uppercase tracking-wide ${isRTL ? 'text-right' : 'text-left'}`}>
                                {t('employmentApplications.details.phoneNumber')}
                              </label>
                              <p className={`mt-1 text-sm text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                                <a href={`tel:${application.phone}`} className="text-blue-600 hover:text-blue-800">
                                  {application.phone}
                                </a>
                              </p>
                            </div>
                            <div>
                              <label className={`block text-xs font-medium text-gray-500 uppercase tracking-wide ${isRTL ? 'text-right' : 'text-left'}`}>
                                {t('employmentApplications.details.applicationDate')}
                              </label>
                              <p className={`mt-1 text-sm text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                                {formatDate(application.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>

          {applications?.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {t('employmentApplications.empty.title')}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('employmentApplications.empty.description')}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Forward Email Modal */}
      <Modal
        isOpen={forwardModalOpen}
        onClose={() => setForwardModalOpen(false)}
        title={t('employmentApplications.forwardModal.title')}
        isRTL={isRTL}
      >
        <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <p className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('employmentApplications.forwardModal.description')}
          </p>

          {selectedApplication && (
            <div className={`bg-blue-50 p-4 rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}>
              <p className="text-sm font-medium text-blue-900">
                {selectedApplication.full_name}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {selectedApplication.field_of_work} • {selectedApplication.email}
              </p>
            </div>
          )}

          <div>
            <Input
              label={t('employmentApplications.forwardModal.recipientLabel')}
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder={t('employmentApplications.forwardModal.recipientPlaceholder')}
              required
              isRTL={isRTL}
            />
          </div>

          <div>
            <Select
              label={t('employmentApplications.forwardModal.languageLabel')}
              value={emailLanguage}
              onChange={(e) => setEmailLanguage(e.target.value)}
              options={[
                { value: 'en', label: 'English' },
                { value: 'ar', label: 'العربية' }
              ]}
            />
            <p className={`mt-1 text-xs text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('employmentApplications.forwardModal.languageHint')}
            </p>
          </div>

          <div className={`flex gap-3 pt-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <Button
              variant="secondary"
              onClick={() => setForwardModalOpen(false)}
              disabled={isSending}
            >
              {t('employmentApplications.forwardModal.cancel')}
            </Button>
            <Button
              onClick={handleSendEmail}
              loading={isSending}
              disabled={!recipientEmail || isSending}
              className="bg-blue-600 hover:bg-blue-700"
              icon={<Send className="h-4 w-4" />}
            >
              {isSending
                ? t('employmentApplications.forwardModal.sending')
                : t('employmentApplications.forwardModal.sendButton')
              }
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
