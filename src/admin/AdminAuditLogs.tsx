import React, { useState, useEffect } from 'react';
import { ShieldAlert, Terminal } from 'lucide-react';
import { AuditLog } from '../types.ts';
import { apiRequest } from '../services/api.ts';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<AuditLog[]>('/admin/audit-logs').then((res) => {
      if (res.success && res.data) setLogs(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
          Regulatory Compliance & Security
        </span>
        <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white mt-1">
          Immutable System Audit Logs ({logs.length})
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Cryptographically signed records of all administrative actions, stock adjustments, and order state transitions.
        </p>
      </div>

      <div className="bg-neutral-950 rounded-2xl border border-neutral-800 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-neutral-900/80 text-neutral-400 uppercase tracking-wider border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Timestamp (UTC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850 text-neutral-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-900/40">
                  <td className="py-3 px-4 text-neutral-500">#{log.id}</td>
                  <td className="py-3 px-4 font-bold text-amber-400">{log.user_email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-white font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-neutral-400">
                    {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ''}
                  </td>
                  <td className="py-3 px-4 text-[11px] text-neutral-300 max-w-xs truncate">
                    {log.details || '—'}
                  </td>
                  <td className="py-3 px-4 text-neutral-500">{log.ip_address}</td>
                  <td className="py-3 px-4 text-neutral-400">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
