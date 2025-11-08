import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { Loader } from '../components/loader';

interface UserForm {
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  password?: string;
  routeIds: number[];
}

export default function Agents() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<UserForm>({
    defaultValues: { routeIds: [] }
  });

  const EDGE_FUNCTION_URL = 'https://cxvokxwjbvjmazowwuvu.supabase.co/functions/v1/admin-users';

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token || ''}`,
  });

  // --- Fetch users from edge function ---
  const fetchUsers = async () => {
    try {
      const res = await fetch(EDGE_FUNCTION_URL, { method: 'GET', headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      alert(t('agents.errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  // --- Fetch routes from Supabase ---
  const fetchRoutes = async () => {
    const { data } = await supabase.from('routes').select('*');
    setRoutes(data || []);
  };

  // Get route name with proper translation
  const getRouteName = (route: any) => {
    if (!route) return '';

    const routeName = route.name || '';

    // Try exact match first (e.g., "Metal Prices", "Dashboard")
    if (routeName && t(`routes.${routeName}`, { defaultValue: '' })) {
      return t(`routes.${routeName}`);
    }

    // Try without spaces and lowercase (e.g., "Metal Prices" -> "metalprices")
    const noSpaces = routeName.toLowerCase().replace(/\s+/g, '');
    if (noSpaces && t(`routes.${noSpaces}`, { defaultValue: '' })) {
      return t(`routes.${noSpaces}`);
    }

    // Try camelCase version (e.g., "Metal Prices" -> "metalPrices")
    const camelCase = routeName
      .split(' ')
      .map((word: string, idx: number) =>
        idx === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join('');
    if (camelCase && t(`routes.${camelCase}`, { defaultValue: '' })) {
      return t(`routes.${camelCase}`);
    }

    // Try with dashes (e.g., "Metal Prices" -> "metal-prices")
    const dashed = routeName.toLowerCase().replace(/\s+/g, '-');
    if (dashed && t(`routes.${dashed}`, { defaultValue: '' })) {
      return t(`routes.${dashed}`);
    }

    // Try sidebar translations as fallback
    if (noSpaces && t(`sidebar.${noSpaces}`, { defaultValue: '' })) {
      return t(`sidebar.${noSpaces}`);
    }

    if (camelCase && t(`sidebar.${camelCase}`, { defaultValue: '' })) {
      return t(`sidebar.${camelCase}`);
    }

    // Last fallback to route.name
    return routeName;
  };

  useEffect(() => {
    if (session) {
      fetchUsers();
      fetchRoutes();
    }
  }, [session]);

  const openModal = (user?: any) => {
    setEditingUserId(user?.id || null);
    setEditingUser(user || null);
    if (user) {
      reset({
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        routeIds: user.user_routes?.map((r: any) => r.route_id) || [],
      });
    } else {
      reset({ email: '', full_name: '', role: 'user', password: '', routeIds: [] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setEditingUserId(null);
    reset();
  };

  const onSubmit = async (data: UserForm) => {
    try {
      setSubmitting(true);

      // Only include routeIds if role is 'user'
      const payload: any = editingUser
        ? { ...data, id: editingUser.id, routeIds: data.role === 'user' ? data.routeIds : [] }
        : { ...data, routeIds: data.role === 'user' ? data.routeIds : [] };

      // Remove `id` for new users
      if (!editingUser) delete payload.id;

      const res = await fetch(EDGE_FUNCTION_URL, {
        method: editingUser ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || t('agents.errors.saveFailed'));
      }

      await fetchUsers();
      closeModal();
      alert(editingUser ? t('agents.success.updated') : t('agents.success.created'));
    } catch (err) {
      console.error('Error saving user:', err);
      alert(`${t('agents.errors.error')}: ${err instanceof Error ? err.message : t('agents.errors.saveFailed')}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('agents.deleteConfirm'))) return;

    try {
      setDeletingUserId(id);
      const res = await fetch(EDGE_FUNCTION_URL, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error(t('agents.errors.deleteFailed'));
      await fetchUsers();
      alert(t('agents.success.deleted'));
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(t('agents.errors.deleteFailed'));
    } finally {
      setDeletingUserId(null);
    }
  };

  const watchedRole = watch('role');
  const isRTL = i18n.language === 'ar';

  if (loading) return <Loader />;

  return (
    <div className={`${isRTL ? 'lg:pr-64' : 'lg:pl-64'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <main className="py-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-500">{t('agents.title')}</h1>
              <p className="mt-2 text-sm text-gray-700">{t('agents.description')}</p>
            </div>
            <Button
              icon={<Plus className="h-4 w-4" />}
              onClick={() => openModal()}
              disabled={submitting || !!deletingUserId}
            >
              {t('agents.addButton')}
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableHead className='rtl:text-right'>{t('agents.table.email')}</TableHead>
              <TableHead className='rtl:text-right'>{t('agents.table.fullName')}</TableHead>
              <TableHead className='rtl:text-right'>{t('agents.table.role')}</TableHead>
              <TableHead className='rtl:text-right'>{t('common.actions')}</TableHead>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.full_name || '-'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {t(`agents.roles.${user.role}`)}
                    </span>
                  </TableCell>
                  <TableCell className="space-x-2 rtl:space-x-reverse">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit />}
                      onClick={() => openModal(user)}
                      loading={editingUserId === user.id}
                      disabled={!!deletingUserId || submitting}
                    >
                      {t('common.edit')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 />}
                      onClick={() => handleDelete(user.id)}
                      loading={deletingUserId === user.id}
                      disabled={!!editingUserId || submitting}
                    >
                      {t('common.delete')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {users.length === 0 && (
            <div className="text-center py-12">
              <h3 className="mt-2 text-sm font-medium text-gray-900">{t('agents.empty.title')}</h3>
              <p className="mt-1 text-sm text-gray-500">{t('agents.empty.description')}</p>
              <Button
                className="mt-6"
                onClick={() => openModal()}
                disabled={submitting || !!deletingUserId}
              >
                {t('agents.addButton')}
              </Button>
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingUser ? t('agents.modal.editTitle') : t('agents.modal.addTitle')}
        maxWidth="lg"
        isRTL={isRTL}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <Input
            label={t('agents.form.email.label')}
            {...register('email', { required: t('agents.form.email.required') })}
            error={errors.email?.message}
            type="email"
            disabled={submitting}
          />
          <Input
            label={t('agents.form.fullName.label')}
            {...register('full_name')}
            error={errors.full_name?.message}
            disabled={submitting}
          />
          {!editingUser && (
            <Input
              label={t('agents.form.password.label')}
              type="password"
              {...register('password', { required: t('agents.form.password.required') })}
              error={errors.password?.message}
              disabled={submitting}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('agents.form.role.label')}</label>
            <select
              {...register('role')}
              className="border rounded p-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              <option value="admin">{t('agents.roles.admin')}</option>
              <option value="user">{t('agents.roles.user')}</option>
            </select>
          </div>

          {watchedRole === 'user' && (
            <div className="mt-2 border p-4 rounded space-y-2">
              <p className="font-semibold mb-2">{t('agents.form.routes.label')}</p>
              {routes.length === 0 ? (
                <p className="text-sm text-gray-500">{t('agents.form.routes.empty')}</p>
              ) : (
                routes.map(route => (
                  <label key={route.id} className="flex items-center space-x-2 rtl:space-x-reverse">
                    <input
                      type="checkbox"
                      value={route.id}
                      {...register('routeIds')}
                      className="rounded disabled:cursor-not-allowed"
                      disabled={submitting}
                    />
                    <span className={submitting ? 'text-gray-400' : ''}>{getRouteName(route)}</span>
                  </label>
                ))
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4">
            <Button
              variant="secondary"
              onClick={closeModal}
              disabled={submitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              loading={submitting}
              disabled={submitting}
            >
              {editingUser ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
