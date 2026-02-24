/**
 * Marketing Infrastructure Test Page
 *
 * Test page for verifying the marketing infrastructure implementation.
 * Access at: http://localhost:3000/test-marketing
 */

'use client';

import { useState } from 'react';
import { useCampaigns } from '@/lib/features/crm/marketing';
import { CAMPAIGN_STATUSES, ATTRIBUTION_MODELS } from '@/lib/features/crm/marketing';
import type { Campaign } from '@/lib/features/crm/marketing';

export default function TestMarketingPage() {
  const [brandId] = useState('test-brand-123');
  const { campaigns, loading, error, createCampaign, updateCampaign, deleteCampaign } = useCampaigns(brandId);
  const [testResult, setTestResult] = useState<string>('');

  const handleCreateTestCampaign = async () => {
    try {
      setTestResult('Creating campaign...');

      const newCampaign = await createCampaign({
        name: 'Test Campaign ' + Date.now(),
        type: 'email',
        subject: 'Test Email Subject',
        previewText: 'This is a test email preview',
        content: {
          fromName: 'Test Brand',
          fromEmail: 'test@example.com',
          sections: [],
        },
        recipientType: 'all',
        recipientCount: 100,
      });

      setTestResult(`✅ Campaign created successfully! ID: ${newCampaign.id}`);
    } catch (err) {
      setTestResult(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleUpdateCampaign = async (campaignId: string) => {
    try {
      setTestResult('Updating campaign...');

      await updateCampaign(campaignId, {
        status: 'active',
        name: 'Updated Campaign Name',
      });

      setTestResult(`✅ Campaign updated successfully!`);
    } catch (err) {
      setTestResult(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    try {
      setTestResult('Deleting campaign...');

      await deleteCampaign(campaignId);

      setTestResult(`✅ Campaign deleted successfully!`);
    } catch (err) {
      setTestResult(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Marketing Infrastructure Test Page
          </h1>
          <p className="text-gray-600">
            Test the marketing infrastructure implementation
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Test Brand ID:</strong> {brandId}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>Status:</strong> {loading ? '⏳ Loading...' : '✅ Ready'}
            </p>
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2">Test Result:</h2>
            <p className="font-mono text-sm">{testResult}</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold">Error:</h3>
            <p className="text-red-700">{error.message}</p>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-3">
            <button
              onClick={handleCreateTestCampaign}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Test Campaign
            </button>
          </div>
        </div>

        {/* Constants Test */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Constants Test</h2>

          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-2">Campaign Statuses:</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CAMPAIGN_STATUSES).map(([key, value]) => (
                <span
                  key={key}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {value.label}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Attribution Models:</h3>
            <div className="space-y-2">
              {ATTRIBUTION_MODELS.map((model) => (
                <div key={model.id} className="p-2 bg-gray-50 rounded">
                  <span className="font-medium">{model.name}</span>
                  {model.isDefault && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                  <p className="text-sm text-gray-600">{model.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">
            Campaigns ({campaigns.length})
          </h2>

          {loading && (
            <div className="text-center py-8 text-gray-500">
              Loading campaigns...
            </div>
          )}

          {!loading && campaigns.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No campaigns yet. Create one to get started!
            </div>
          )}

          {!loading && campaigns.length > 0 && (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{campaign.name}</h3>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Type:</span> {campaign.type}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Status:</span>{' '}
                          <span className={`px-2 py-1 rounded text-xs ${
                            campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                            campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {CAMPAIGN_STATUSES[campaign.status].label}
                          </span>
                        </p>
                        {campaign.subject && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Subject:</span> {campaign.subject}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Recipients:</span> {campaign.recipientCount}
                        </p>
                        <p className="text-xs text-gray-400">
                          Created: {new Date(campaign.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col space-y-2">
                      <button
                        onClick={() => handleUpdateCampaign(campaign.id)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Metrics:</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{campaign.metrics.sent}</p>
                        <p className="text-xs text-gray-600">Sent</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{campaign.metrics.openRate.toFixed(1)}%</p>
                        <p className="text-xs text-gray-600">Open Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{campaign.metrics.clickRate.toFixed(1)}%</p>
                        <p className="text-xs text-gray-600">Click Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">${campaign.metrics.revenue.toFixed(2)}</p>
                        <p className="text-xs text-gray-600">Revenue</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
