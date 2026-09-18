"use client";

import { useState } from 'react';

export default function TestEventPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const [formData, setFormData] = useState({
    visitor_id: 'test_visitor_' + Math.floor(Math.random() * 1000000),
    session_id: 'test_session_' + Math.floor(Math.random() * 1000000),
    event_type: 'pageview',
    page_url: 'https://mywebsite.com/home',
    page_path: '/home',
    referrer: 'https://google.com/search?q=test',
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    device: 'Desktop',
    browser: 'Chrome',
    operating_system: 'Windows'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          utms: {
            utm_source: formData.utm_source,
            utm_medium: formData.utm_medium,
            utm_campaign: formData.utm_campaign,
          }
        }),
      });
      
      const data = await response.json();
      setResult({ status: response.status, data });
    } catch (error) {
      setResult({ status: 'error', data: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Send Test Event</h1>
      
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Visitor ID</label>
              <input type="text" name="visitor_id" value={formData.visitor_id} onChange={handleChange} className="w-full rounded-md border p-2 dark:bg-slate-700 dark:border-slate-600" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Session ID</label>
              <input type="text" name="session_id" value={formData.session_id} onChange={handleChange} className="w-full rounded-md border p-2 dark:bg-slate-700 dark:border-slate-600" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Event Type</label>
              <input type="text" name="event_type" value={formData.event_type} onChange={handleChange} className="w-full rounded-md border p-2 dark:bg-slate-700 dark:border-slate-600" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Referrer</label>
              <input type="text" name="referrer" value={formData.referrer} onChange={handleChange} className="w-full rounded-md border p-2 dark:bg-slate-700 dark:border-slate-600" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">UTM Source</label>
              <input type="text" name="utm_source" value={formData.utm_source} onChange={handleChange} className="w-full rounded-md border p-2 dark:bg-slate-700 dark:border-slate-600" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">UTM Medium</label>
              <input type="text" name="utm_medium" value={formData.utm_medium} onChange={handleChange} className="w-full rounded-md border p-2 dark:bg-slate-700 dark:border-slate-600" />
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Sending...' : 'Send Event'}
          </button>
        </form>

        {result && (
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold mb-2">Response: {result.status}</h3>
            <pre className="text-xs overflow-auto">{JSON.stringify(result.data, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
