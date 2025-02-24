'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CustomerIssue } from '@/types/schema';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function CustomerIssuesPage() {
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<CustomerIssue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<CustomerIssue | null>(null);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchIssues();
  }, []);

  async function fetchIssues() {
    try {
      const issuesQuery = query(
        collection(db, 'customerIssues'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(issuesQuery);
      const issuesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CustomerIssue[];

      setIssues(issuesData);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Failed to load customer issues');
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (issueId: string, newStatus: CustomerIssue['status']) => {
    try {
      await updateDoc(doc(db, 'customerIssues', issueId), {
        status: newStatus,
        updatedAt: new Date()
      });

      setIssues(issues.map(issue => 
        issue.id === issueId 
          ? { ...issue, status: newStatus, updatedAt: new Date() as any }
          : issue
      ));

      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue || !response || submitting) return;

    try {
      setSubmitting(true);
      await updateDoc(doc(db, 'customerIssues', selectedIssue.id), {
        adminResponse: response,
        status: 'resolved',
        updatedAt: new Date()
      });

      setIssues(issues.map(issue => 
        issue.id === selectedIssue.id 
          ? { 
              ...issue, 
              adminResponse: response, 
              status: 'resolved', 
              updatedAt: new Date() as any 
            }
          : issue
      ));

      setSelectedIssue(null);
      setResponse('');
      toast.success('Response submitted successfully');
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Customer Issues</h1>

      {issues.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No customer issues found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {issues.map((issue) => (
            <div key={issue.id} className="bg-white rounded-lg shadow-sm p-6 mb-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium">From: {issue.customerName}</h3>
                  <p className="text-gray-600 mt-2">{issue.description}</p>
                </div>
                <select
                  value={issue.status}
                  onChange={(e) => handleStatusChange(issue.id, e.target.value as CustomerIssue['status'])}
                  className="ml-4 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div className="text-sm text-gray-500">
                <p>Created: {new Date(issue.createdAt.seconds * 1000).toLocaleString()}</p>
                <p>Last Updated: {issue.updatedAt ? new Date(issue.updatedAt.seconds * 1000).toLocaleString() : 'Never'}</p>
              </div>
              {issue.response && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <p className="font-medium">Response:</p>
                  <p className="text-gray-600">{issue.response}</p>
                </div>
              )}
              {issue.status !== 'resolved' && (
                <div className="mt-4">
                  <button
                    onClick={() => handleAddResponse(issue.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Add Response
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Response Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Respond to Issue
            </h3>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">{selectedIssue.subject}</p>
              <p className="mt-1 text-sm text-gray-500">{selectedIssue.message}</p>
            </div>

            <form onSubmit={handleSubmitResponse}>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Type your response..."
                required
              />

              <div className="mt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedIssue(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Response'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 