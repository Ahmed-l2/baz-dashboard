import React, { useState, useEffect } from 'react';
import {
  Trash2, Ban, Shield, Mail, Phone, Wallet, Key, Calendar, Clock, Eye,
  Info, Users as UsersIcon, UserCheck, UserX, ShieldAlert, ChevronLeft,
  ChevronRight, Plus, ImageIcon, Edit
} from 'lucide-react';
import i18n from '../i18n';
import { useTranslation } from 'react-i18next';

interface ClerkUser {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  image_url?: string;
  banned: boolean;
  locked: boolean;
  password_enabled: boolean;
  two_factor_enabled: boolean;
  totp_enabled: boolean;
  delete_self_enabled: boolean;
  create_organization_enabled: boolean;
  last_sign_in_at: number | null;
  last_active_at: number | null;
  created_at: number;
  email_addresses?: Array<{
    email_address: string;
    verification?: { status: string };
  }>;
  phone_numbers?: Array<{
    phone_number: string;
    verification?: { status: string };
  }>;
  web3_wallets?: Array<{
    web3_wallet: string;
    verification?: { status: string };
  }>;
  external_accounts?: Array<{
    provider: string;
    verification?: { status: string };
  }>;
  passkeys?: Array<any>;
  public_metadata?: {
    role?: string;
    department?: string;
  };
}

interface StatsData {
  total: number;
  active: number;
  banned: number;
  locked: number;
  highSecurity: number;
  online: number;
}

export default function Users() {
  const [users, setUsers] = useState<ClerkUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const { t } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    active: 0,
    banned: 0,
    locked: 0,
    highSecurity: 0,
    online: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ClerkUser | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'ban' | 'delete'; user: ClerkUser } | null>(null);

  const limit = 10;

  const getSecurityScore = (user: ClerkUser): number => {
    let score = 0;
    if (user.password_enabled) score += 1;
    if (user.two_factor_enabled) score += 2;
    if (user.totp_enabled) score += 1;
    if (user.passkeys && user.passkeys.length > 0) score += 2;
    return score;
  };

  // Fetch stats
  useEffect(() => {
    const fetchStats = async (): Promise<void> => {
      try {
        setStatsLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-all-users?limit=250&order_by=-created_at`
        );

        if (!response.ok) throw new Error(`Failed to fetch stats: ${response.status}`);

        const data = await response.json();
        let allUsers: ClerkUser[] = [];

        if (Array.isArray(data)) {
          allUsers = data;
        } else if (data && typeof data === 'object') {
          allUsers = data.users || data.data || [];
        }

        setStats({
          total: allUsers.length,
          active: allUsers.filter(u => !u.banned && !u.locked).length,
          banned: allUsers.filter(u => u.banned).length,
          locked: allUsers.filter(u => u.locked).length,
          highSecurity: allUsers.filter(u => getSecurityScore(u) >= 5).length,
          online: 0,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async (): Promise<void> => {
      try {
        setLoading(true);
        const offset = (currentPage - 1) * limit;
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-all-users?limit=${limit}&offset=${offset}&order_by=-created_at`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch users: ${response.status}`);

        const data = await response.json();
        let usersArray: ClerkUser[] = [];
        let totalCountValue = 0;
        let hasMoreValue = false;

        if (Array.isArray(data)) {
          usersArray = data;
          totalCountValue = data.length;
          hasMoreValue = data.length === limit;
        } else if (data && typeof data === 'object') {
          usersArray = data.users || data.data || [];
          totalCountValue = data.total_count || data.total || stats.total || usersArray.length;
          hasMoreValue = data.has_more || data.next_page || usersArray.length === limit;
        }

        setUsers(usersArray);
        setTotalCount(totalCountValue);
        setHasMore(hasMoreValue);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, stats.total]);

  // Active status check
  useEffect(() => {
    const checkActiveStatus = () => {
      if (!users.length) return;
      const currentTime = Date.now();
      const activeUserIds = new Set<string>();

      users.forEach(user => {
        if (user.last_active_at && (currentTime - user.last_active_at) <= 300000) {
          activeUserIds.add(user.id);
        }
      });

      setActiveUsers(activeUserIds);
      setStats(prev => ({ ...prev, online: activeUserIds.size }));
    };

    checkActiveStatus();
    const interval = setInterval(checkActiveStatus, 30000);
    return () => clearInterval(interval);
  }, [users]);

  const formatDate = (timestamp: number | null): string => {
    if (!timestamp) return t('users.never', 'Never');
    return new Date(timestamp).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBanUser = async (user: ClerkUser) => {
    const action = user.banned ? 'unlock' : 'lock';

    // Optimistic update
    setUsers(users.map(u => u.id === user.id ? { ...u, banned: !u.banned } : u));
    setStats(prev => ({
      ...prev,
      banned: user.banned ? prev.banned - 1 : prev.banned + 1,
      active: user.banned ? prev.active + 1 : prev.active - 1
    }));

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-actions?id=${user.id}&action=${action}`,
        { method: "POST" }
      );
      if (!response.ok) throw new Error(`Failed to ${action} user`);
    } catch (error) {
      // Revert on error
      setUsers(users.map(u => u.id === user.id ? { ...u, banned: user.banned } : u));
      setStats(prev => ({
        ...prev,
        banned: user.banned ? prev.banned + 1 : prev.banned - 1,
        active: user.banned ? prev.active - 1 : prev.active + 1
      }));
    }
    setConfirmAction(null);
  };

  const handleDeleteUser = async (user: ClerkUser) => {
    const originalUsers = [...users];
    setUsers(users.filter(u => u.id !== user.id));
    setTotalCount(prev => prev - 1);
    setStats(prev => ({
      ...prev,
      total: prev.total - 1,
      active: !user.banned && !user.locked ? prev.active - 1 : prev.active,
      banned: user.banned ? prev.banned - 1 : prev.banned,
      locked: user.locked ? prev.locked - 1 : prev.locked,
    }));

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-actions?id=${user.id}&action=delete`,
        { method: "POST" }
      );
      if (!response.ok) throw new Error('Failed to delete user');
    } catch (error) {
      setUsers(originalUsers);
      setTotalCount(prev => prev + 1);
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        active: !user.banned && !user.locked ? prev.active + 1 : prev.active,
        banned: user.banned ? prev.banned + 1 : prev.banned,
        locked: user.locked ? prev.locked + 1 : prev.locked,
      }));
    }
    setConfirmAction(null);
  };

  const getStatusBadge = (user: ClerkUser) => {
    if (user.banned) return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">{t('users.status.banned')}</span>;
    if (user.locked) return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{t('users.status.locked')}</span>;
    if (activeUsers.has(user.id)) return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{t('users.status.online')}</span>;
    return null;
  };

  const getSecurityBadge = (score: number) => {
    if (score >= 5) return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{t('users.security.high')}</span>;
    if (score >= 3) return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">{t('users.security.medium')}</span>;
    return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">{t('users.security.low')}</span>;
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;
  const canGoPrevious = currentPage > 1;
  const canGoNext = hasMore || currentPage < totalPages;

  if (loading && !users.length) {
    return (
      <div className={`py-10 ${isRTL ? 'lg:pr-64' : 'lg:pl-64'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="px-4 sm:px-6 lg:px-8 flex justify-center items-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-700">{t('users.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`py-10 ${isRTL ? 'lg:pr-64' : 'lg:pl-64'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-red-600">{t('users.error.title')}</h3>
            <p className="mt-2 text-sm text-gray-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              {t('users.error.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`py-10 ${isRTL ? 'lg:pr-64' : 'lg:pl-64'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-500">
              {t('users.title')}
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              {t('users.description')}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[
            { title: t('users.stats.total'), value: stats.total, icon: UsersIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
            { title: t('users.stats.active'), value: stats.active, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-100' },
            { title: t('users.stats.online'), value: stats.online, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-100' },
            { title: t('users.stats.banned'), value: stats.banned, icon: UserX, color: 'text-red-600', bg: 'bg-red-100' },
            { title: t('users.stats.locked'), value: stats.locked, icon: ShieldAlert, color: 'text-orange-600', bg: 'bg-orange-100' },
          ].map((stat, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {statsLoading && <div className="animate-pulse text-xs text-gray-400">{t('users.updating')}</div>}
                </div>
                <div className={`p-3 ${stat.bg} rounded-full`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{t('users.table.title')}</h2>
            <p className="mt-1 text-sm text-gray-700">
              {t('users.table.description', { count: users.length, total: stats.total })}
            </p>
          </div>

          <div className="overflow-x-auto">
            {users.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                      {t('users.table.headers.user')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                      {t('users.table.headers.status')}
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                      {t('users.table.headers.lastActivity')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                      {t('users.table.headers.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              {user.image_url ? (
                                <img src={user.image_url} alt="" className="w-12 h-12 rounded-full" />
                              ) : (
                                <span className="text-gray-700 font-medium">
                                  {user.first_name?.[0]}{user.last_name?.[0]}
                                </span>
                              )}
                            </div>
                            {activeUsers.has(user.id) && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.first_name || t('users.unknown')} {user.last_name || ''}
                            </div>
                            <div className="text-sm text-gray-700">
                              {user.email_addresses?.[0]?.email_address || t('users.noEmail')}
                            </div>
                            {user.public_metadata?.role && (
                              <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                {user.public_metadata.role}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(user.last_active_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className={`flex justify-end space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          <button
                            onClick={() => { setSelectedUser(user); setIsModalOpen(true); }}
                            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                          >
                            <Eye className="w-4 h-4" />
                            {t('users.table.view')}
                          </button>
                          <button
                            onClick={() => setConfirmAction({ type: 'ban', user })}
                            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                          >
                            <Ban className="w-4 h-4" />
                            {user.banned ? t('users.table.unban') : t('users.table.ban')}
                          </button>
                          <button
                            onClick={() => setConfirmAction({ type: 'delete', user })}
                            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                          >
                            <Trash2 className="w-4 h-4" />
                            {t('users.table.delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">{t('users.table.empty.title')}</h3>
                <p className="mt-1 text-sm text-gray-500">{t('users.table.empty.description')}</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {users.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  {t('users.pagination.showing', {
                    from: ((currentPage - 1) * limit) + 1,
                    to: Math.min(currentPage * limit, totalCount),
                    total: stats.total
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    disabled={!canGoPrevious}
                    className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                    {t('users.previous')}
                  </button>
                  <span className="text-sm text-gray-700 mx-2">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!canGoNext}
                    className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    {t('users.next')}
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="px-6 py-4 border-b border-gray-200">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h3 className={`text-lg font-semibold text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>{t('users.details.title')}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    {selectedUser.image_url ? (
                      <img src={selectedUser.image_url} alt="" className="w-16 h-16 rounded-full" />
                    ) : (
                      <span className="text-gray-700 text-2xl font-medium">
                        {selectedUser.first_name?.[0]}{selectedUser.last_name?.[0]}
                      </span>
                    )}
                  </div>
                  {activeUsers.has(selectedUser.id) && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                  )}
                </div>
                <div>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <h4 className={`text-xl font-semibold text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {selectedUser.first_name || t('users.unknown')} {selectedUser.last_name || ''}
                    </h4>
                    {getStatusBadge(selectedUser)}
                  </div>
                  <p className={`text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>{selectedUser.email_addresses?.[0]?.email_address || t('users.noEmail')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div>
                  <h5 className={`font-semibold text-gray-900 mb-3 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''} ${isRTL ? 'text-right' : 'text-left'}`}>
                    <Mail className="w-4 h-4" />
                    {t('users.details.contact')}
                  </h5>
                  <div className="space-y-2">
                    {selectedUser.email_addresses?.map((email, idx) => (
                      <div key={idx} className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className={`text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>{email.email_address}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          email.verification?.status === 'verified'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {email.verification?.status === 'verified' ? t('users.details.verified') : t('users.details.unverified')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security Information */}
                <div>
                  <h5 className={`font-semibold text-gray-900 mb-3 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''} ${isRTL ? 'text-right' : 'text-left'}`}>
                    <Shield className="w-4 h-4" />
                    {t('users.details.security')}
                  </h5>
                  <div className="space-y-2">
                    <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>{t('users.details.securityLevel')}</span>
                      {getSecurityBadge(getSecurityScore(selectedUser))}
                    </div>
                    <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>{t('users.details.passwordEnabled')}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        selectedUser.password_enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedUser.password_enabled ? t('users.yes') : t('users.no')}
                      </span>
                    </div>
                    <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>{t('users.details.twoFactor')}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        selectedUser.two_factor_enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedUser.two_factor_enabled ? t('users.yes') : t('users.no')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Activity Information */}
                <div className="lg:col-span-2">
                  <h5 className={`font-semibold text-gray-900 mb-3 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''} ${isRTL ? 'text-right' : 'text-left'}`}>
                    <Clock className="w-4 h-4" />
                    {t('users.details.activity')}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'} block`}>{t('users.details.lastSignIn')}</span>
                      <p className={`text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>{formatDate(selectedUser.last_sign_in_at)}</p>
                    </div>
                    <div>
                      <span className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'} block`}>{t('users.details.lastActivity')}</span>
                      <p className={`text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>{formatDate(selectedUser.last_active_at)}</p>
                    </div>
                    <div>
                      <span className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'} block`}>{t('users.details.memberSince')}</span>
                      <p className={`text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>{formatDate(selectedUser.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold text-gray-900 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {confirmAction.type === 'ban'
                  ? (confirmAction.user.banned
                      ? t('users.dialogs.unban.title')
                      : t('users.dialogs.ban.title')
                    )
                  : t('users.dialogs.delete.title')
                }
              </h3>
              <p className={`text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {confirmAction.type === 'ban'
                  ? (confirmAction.user.banned
                      ? t('users.dialogs.unban.description', { name: confirmAction.user.first_name || t('users.unknown') })
                      : t('users.dialogs.ban.description', { name: confirmAction.user.first_name || t('users.unknown') })
                    )
                  : t('users.dialogs.delete.description', { name: confirmAction.user.first_name || t('users.unknown') })
                }
              </p>
              <div className={`mt-6 flex space-x-3 ${isRTL ? 'justify-start flex-row-reverse space-x-reverse' : 'justify-end'}`}>
                <button
                  onClick={() => setConfirmAction(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {t('users.dialogs.cancel')}
                </button>
                <button
                  onClick={() => {
                    if (confirmAction.type === 'ban') {
                      handleBanUser(confirmAction.user);
                    } else {
                      handleDeleteUser(confirmAction.user);
                    }
                  }}
                  className={`px-4 py-2 text-white rounded-md ${
                    confirmAction.type === 'delete'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {confirmAction.type === 'ban'
                    ? (confirmAction.user.banned ? t('users.table.unban') : t('users.table.ban'))
                    : t('users.table.delete')
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
