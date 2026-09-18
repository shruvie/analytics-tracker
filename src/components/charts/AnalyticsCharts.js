"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

export function MainLineChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-500">No data available</div>;
  }
  
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
          <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend />
          <Line type="monotone" dataKey="visitors" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="sessions" stroke="#10b981" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="pageViews" stroke="#f59e0b" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SourcePieChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-500">No data available</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: '8px' }} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DeviceBarChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-500">No data available</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
          <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px' }} />
          <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
