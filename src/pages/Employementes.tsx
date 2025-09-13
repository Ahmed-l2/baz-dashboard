import { useState } from 'react';
import { Users, Eye, Trash2, Mail, Phone, Briefcase, ChevronDown, ChevronRight } from 'lucide-react';
import { useEmploymentApplications, useDeleteEmploymentApplication } from '../hooks/useEmploymentApplications';
import Button from '../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Loader } from '../components/loader';

export default function EmploymentApplications() {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const { data: applications, isLoading } = useEmploymentApplications();
  const deleteMutation = useDeleteEmploymentApplication();

  const toggleRow = (applicationId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(applicationId)) {
      newExpanded.delete(applicationId);
    } else {
      newExpanded.add(applicationId);
    }
    setExpandedRows(newExpanded);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
    <div className="lg:pl-64">
      <main className="py-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-500">
                Employment Applications
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                Manage job applications and candidate information
              </p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableHead>Applicant Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Field of Work</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="relative"><span className="sr-only">Actions</span></TableHead>
            </TableHeader>
            <TableBody>
              {applications?.map((application) => (
                <>
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">{application.full_name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{application.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{application.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {application.field_of_work}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(application.created_at)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={expandedRows.has(application.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        onClick={() => toggleRow(application.id)}
                      >
                        {expandedRows.has(application.id) ? 'Hide' : 'View'}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                     
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={() => handleDelete(application.id)}
                        loading={deleteMutation.isPending}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedRows.has(application.id) && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-gray-50 border-t-0">
                        <div className="py-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Application Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Full Name
                              </label>
                              <p className="mt-1 text-sm text-gray-900">{application.full_name}</p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Field of Work
                              </label>
                              <p className="mt-1 text-sm text-gray-900">{application.field_of_work}</p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Email Address
                              </label>
                              <p className="mt-1 text-sm text-gray-900">
                                <a href={`mailto:${application.email}`} className="text-blue-600 hover:text-blue-800">
                                  {application.email}
                                </a>
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Phone Number
                              </label>
                              <p className="mt-1 text-sm text-gray-900">
                                <a href={`tel:${application.phone}`} className="text-blue-600 hover:text-blue-800">
                                  {application.phone}
                                </a>
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Application Date
                              </label>
                              <p className="mt-1 text-sm text-gray-900">{formatDate(application.created_at)}</p>
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications</h3>
              <p className="mt-1 text-sm text-gray-500">
                No employment applications have been submitted yet.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}