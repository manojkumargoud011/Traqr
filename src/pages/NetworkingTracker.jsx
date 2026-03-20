import { useState } from 'react';
import { Users, Plus, Trash2, ExternalLink, Mail, Edit2, X, Save, Linkedin } from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { formatDate } from '../utils/helpers';

const STATUS_OPTS = ['Not Contacted', 'Contacted', 'Warm', 'Meeting Scheduled', 'Referred Me'];
const STATUS_COLORS = {
  'Not Contacted': 'bg-ink-100 dark:bg-ink-800 text-ink-500',
  'Contacted': 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  'Warm': 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  'Meeting Scheduled': 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
  'Referred Me': 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
};

const EMPTY = { name: '', company: '', role: '', linkedin: '', email: '', notes: '', lastContact: '', status: 'Not Contacted' };

function ContactForm({ initial = EMPTY, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="card p-5 space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Name *</label>
          <input className="input" placeholder="Full name" value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label className="label">Company</label>
          <input className="input" placeholder="e.g. Stripe" value={form.company} onChange={set('company')} />
        </div>
        <div>
          <label className="label">Their Role</label>
          <input className="input" placeholder="e.g. Engineering Manager" value={form.role} onChange={set('role')} />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input cursor-pointer" value={form.status} onChange={set('status')}>
            {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">LinkedIn URL</label>
          <input className="input" placeholder="linkedin.com/in/..." value={form.linkedin} onChange={set('linkedin')} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" placeholder="name@company.com" type="email" value={form.email} onChange={set('email')} />
        </div>
        <div>
          <label className="label">Last Contact Date</label>
          <input className="input" type="date" value={form.lastContact} onChange={set('lastContact')} />
        </div>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea className="input resize-none" placeholder="How you met, conversation topics, what they offered..." rows={2} value={form.notes} onChange={set('notes')} />
      </div>
      <div className="flex justify-end gap-3">
        <button className="btn-secondary" onClick={onCancel}><X className="w-4 h-4" /> Cancel</button>
        <button className="btn-primary" onClick={() => form.name.trim() && onSave(form)}>
          <Save className="w-4 h-4" /> Save Contact
        </button>
      </div>
    </div>
  );
}

function ContactCard({ contact, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return <ContactForm initial={contact} onSave={d => { onUpdate(contact.id, d); setEditing(false); }} onCancel={() => setEditing(false)} />;
  }

  return (
    <div className="card p-5 hover:shadow-md transition-shadow duration-200 animate-fade-in">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ backgroundColor: `hsl(${contact.name.split('').reduce((a,c)=>a+c.charCodeAt(0),0)%360},45%,45%)` }}
        >
          {contact.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-ink-900 dark:text-white">{contact.name}</p>
              <p className="text-xs text-ink-400 mt-0.5">{contact.role}{contact.role && contact.company ? ' at ' : ''}{contact.company}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${STATUS_COLORS[contact.status] || STATUS_COLORS['Not Contacted']}`}>
                {contact.status}
              </span>
            </div>
          </div>

          {contact.notes && (
            <p className="text-xs text-ink-500 dark:text-ink-400 mt-2 leading-relaxed line-clamp-2">{contact.notes}</p>
          )}

          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {contact.linkedin && (
              <a href={`https://${contact.linkedin.replace('https://', '')}`} target="_blank" rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
                <Linkedin className="w-3 h-3" /> LinkedIn
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="text-xs text-ink-400 flex items-center gap-1 hover:text-ink-700 dark:hover:text-ink-200">
                <Mail className="w-3 h-3" /> {contact.email}
              </a>
            )}
            {contact.lastContact && (
              <span className="text-xs text-ink-400">Last contact: {formatDate(contact.lastContact)}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => setEditing(true)} className="btn-icon"><Edit2 className="w-3.5 h-3.5" /></button>
          <button onClick={() => onDelete(contact.id)} className="btn-icon hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </div>
  );
}

export default function NetworkingTracker() {
  const { contacts, addContact, updateContact, deleteContact } = useJobs();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !search || c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q);
    const matchStatus = !filterStatus || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-900 dark:text-white">Networking</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">Track recruiters, referrals & connections</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Add Contact
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STATUS_OPTS.map(s => (
          <div key={s} className={`card p-3 text-center cursor-pointer transition-all ${filterStatus === s ? 'ring-2 ring-amber-400' : ''}`} onClick={() => setFilterStatus(p => p === s ? '' : s)}>
            <p className="text-2xl font-bold font-display text-ink-900 dark:text-white">{contacts.filter(c => c.status === s).length}</p>
            <p className="text-xs text-ink-400 mt-0.5">{s}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <ContactForm onSave={d => { addContact(d); setShowForm(false); }} onCancel={() => setShowForm(false)} />
      )}

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 text-sm">🔍</span>
        <input className="input pl-9" placeholder="Search by name or company..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Contacts */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="w-10 h-10 text-ink-300 dark:text-ink-600 mx-auto mb-3" />
          <p className="font-semibold text-ink-500">No contacts yet</p>
          <p className="text-sm text-ink-400 mt-1">Add recruiters, referrals, and connections to track your network</p>
          <button className="btn-primary mt-4" onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Add Contact</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <ContactCard key={c.id} contact={c} onDelete={deleteContact} onUpdate={updateContact} />
          ))}
        </div>
      )}
    </div>
  );
}