import { supabase } from '@/lib/supabase';
import KPICard from '@/components/ui/KPICard';
import { MainLineChart, SourcePieChart, DeviceBarChart } from '@/components/charts/AnalyticsCharts';
import { Users, MousePointer2, FileText } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export const dynamic = 'force-dynamic';

async function getAnalyticsData() {
  if (!supabase) return null;

  try {
    // Basic counts
    const { count: visitorCount } = await supabase.from('visitors').select('*', { count: 'exact', head: true });
    const { count: sessionCount } = await supabase.from('sessions').select('*', { count: 'exact', head: true });
    const { count: pageViewCount } = await supabase.from('events').select('*', { count: 'exact', head: true }).eq('event_type', 'pageview');

    // Aggregate Source Data from Sessions
    const { data: sourceDataRaw } = await supabase.from('sessions').select('source');
    
    // Process sources
    const sourceMap = {};
    (sourceDataRaw || []).forEach(s => {
      const src = s.source || 'Direct';
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    });
    
    const sourceData = Object.keys(sourceMap)
      .map(key => ({ name: key, value: sourceMap[key] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Process Devices
    const { data: deviceDataRaw } = await supabase.from('sessions').select('device');
    const deviceMap = {};
    (deviceDataRaw || []).forEach(s => {
      const dev = s.device || 'Unknown';
      deviceMap[dev] = (deviceMap[dev] || 0) + 1;
    });
    const deviceData = Object.keys(deviceMap)
      .map(key => ({ name: key, value: deviceMap[key] }))
      .sort((a, b) => b.value - a.value);

    // Get Raw Events for Debug Table
    const { data: rawEvents } = await supabase.from('events').select('*').order('created_at', { ascending: false }).limit(20);

    return {
      kpis: {
        visitors: visitorCount || 0,
        sessions: sessionCount || 0,
        pageViews: pageViewCount || 0
      },
      sourceData,
      deviceData,
      rawEvents: rawEvents || [],
      // Mocking time series for the demo since full date_trunc group by in JS is complex without raw SQL function
      // If we had more time we could create a raw SQL function. Let's just group rawEvents by day in JS.
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

export default async function DashboardPage() {
  const data = await getAnalyticsData();

  if (!supabase) {
    return (
      <div className="p-8 h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Setup Required</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Please add your <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">SUPABASE_URL</code> and <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">SUPABASE_SERVICE_ROLE_KEY</code> to your .env.local file and restart the server.
          </p>
        </div>
      </div>
    );
  }

  // Generate some time-series data for the line chart based on raw events or mock if empty
  let timeSeriesData = [];
  if (data?.rawEvents.length > 0) {
    const datesMap = {};
    data.rawEvents.forEach(e => {
      const d = format(new Date(e.created_at), 'MMM dd');
      if (!datesMap[d]) datesMap[d] = { date: d, visitors: 0, sessions: 0, pageViews: 0 };
      if (e.event_type === 'pageview') datesMap[d].pageViews += 1;
      // simplification
      datesMap[d].sessions += 1; 
      datesMap[d].visitors += 1;
    });
    timeSeriesData = Object.values(datesMap).reverse();
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
        <div className="flex gap-2">
          {/* Simple date filters placeholder */}
          <select className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-sm">
            <option>Today</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard title="Unique Visitors" value={data?.kpis.visitors || 0} icon={Users} />
        <KPICard title="Total Sessions" value={data?.kpis.sessions || 0} icon={MousePointer2} />
        <KPICard title="Page Views" value={data?.kpis.pageViews || 0} icon={FileText} />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-semibold mb-6">Traffic Over Time</h3>
        <MainLineChart data={timeSeriesData} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-6">Top Traffic Sources</h3>
          <SourcePieChart data={data?.sourceData || []} />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-6">Devices</h3>
          <DeviceBarChart data={data?.deviceData || []} />
        </div>
      </div>

      {/* Debug Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <h3 className="text-lg font-semibold mb-4 text-red-500">Debugging: Raw Acquisition Info</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Raw Referrer</th>
                <th className="px-4 py-3">UTM Source</th>
                <th className="px-4 py-3">Calc Source</th>
                <th className="px-4 py-3">Calc Channel</th>
                <th className="px-4 py-3">Page Path</th>
              </tr>
            </thead>
            <tbody>
              {data?.rawEvents.map((event) => (
                <tr key={event.id} className="border-b dark:border-slate-700">
                  <td className="px-4 py-3 font-mono text-xs">{format(new Date(event.created_at), 'MM/dd HH:mm:ss')}</td>
                  <td className="px-4 py-3 truncate max-w-[150px]">{event.referrer || '-'}</td>
                  <td className="px-4 py-3">{event.utm_source || '-'}</td>
                  <td className="px-4 py-3 font-semibold">{event.source}</td>
                  <td className="px-4 py-3">{event.channel}</td>
                  <td className="px-4 py-3 truncate max-w-[150px]">{event.page_path}</td>
                </tr>
              ))}
              {data?.rawEvents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No events recorded yet. Go to Test Event to send one.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
