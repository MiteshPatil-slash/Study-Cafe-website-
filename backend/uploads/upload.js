import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/theme';
import { DUMMY_COLLEGES } from '../data/dummyData';

const RESOURCE_TYPES = [
  { key: 'note',  label: '📄 Notes',   desc: 'PDF study material' },
  { key: 'paper', label: '📝 Paper',   desc: 'Previous year exam' },
  { key: 'video', label: '🎬 Video',   desc: 'YouTube lecture link' },
  { key: 'doubt', label: '🙋 Session', desc: 'Schedule live doubt session' },
];

const SUBJECTS = ['CS', 'IT', 'Mechanical', 'Electronics', 'Civil', 'Chemical', 'MATH', 'Physics'];

const DEFAULT_FORM = {
  type: 'note', title: '', subject: 'CS', college: 1,
  ytLink: '', tags: '', date: '', time: '',
  seats: '', duration: '', exam: '',
};

export default function Upload() {
  const { user, addResource, dark, toast } = useApp();
  const css = getTheme(dark);

  const [form, setForm]           = useState(DEFAULT_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors]       = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragging, setDragging]   = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // ── Handle file selected from input or drop ──
  const handleFile = (file) => {
    if (!file) return;
    const allowed = ['pdf', 'ppt', 'pptx', 'doc', 'docx'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      toast('Only PDF, PPT, DOC files are allowed', 'error');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast('File size must be under 50 MB', 'error');
      return;
    }
    setSelectedFile(file);
    toast(`File ready: ${file.name} ✅`);
  };

  // ── Drag handlers ──
  const onDragOver  = (e) => { e.preventDefault(); e.stopPropagation(); setDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setDragging(false); };
  const onDrop      = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // ── Validate ──
  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if ((form.type === 'note' || form.type === 'paper') && !selectedFile)
      e.file = 'Please select a file to upload';
    if (form.type === 'video' && !form.ytLink.trim())
      e.ytLink = 'YouTube link is required';
    if (form.type === 'doubt') {
      if (!form.date)  e.date  = 'Date is required';
      if (!form.time)  e.time  = 'Time is required';
      if (!form.seats || isNaN(form.seats)) e.seats = 'Seats required (number)';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit to backend ──
  const handleSubmit = async () => {
    if (!validate()) return;
    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      formData.append('type',      form.type);
      formData.append('title',     form.title);
      formData.append('subject',   form.subject);
      formData.append('college',   form.college);
      formData.append('tags',      form.tags);
      formData.append('exam',      form.exam);
      formData.append('ytLink',    form.ytLink);
      formData.append('date',      form.date);
      formData.append('time',      form.time);
      formData.append('seats',     form.seats);
      formData.append('duration',  form.duration);
      formData.append('status',    'upcoming');
      formData.append('thumbnail', '🎬');

      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await fetch('http://localhost:5000/api/resources', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast(data.message || 'Upload failed', 'error');
        setUploading(false);
        return;
      }

      // Update local state too
      addResource({
        ...form,
        college:    Number(form.college),
        uploadedBy: user.name,
        tags:       form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        seats:      form.seats ? Number(form.seats) : undefined,
        registered: 0,
        status:     form.type === 'doubt' ? 'upcoming' : undefined,
        thumbnail:  form.type === 'video' ? '🎬' : undefined,
        fileUrl:    data.fileUrl || '',
      });

      setForm(DEFAULT_FORM);
      setSelectedFile(null);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);

    } catch (err) {
      console.error(err);
      toast('Cannot connect to server. Is backend running?', 'error');
    }

    setUploading(false);
  };

  // ── Remove selected file ──
  const removeFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
  };

  return (
    <div className="fade-in" style={{ maxWidth: 660 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-1px', color: dark ? '#fff' : '#0f0f23', marginBottom: 6 }}>
          Upload Resource
        </h1>
        <p style={{ color: dark ? '#64748b' : '#94a3b8' }}>
          Share your knowledge with students across colleges
        </p>
      </div>

      {/* Success banner */}
      {submitted && (
        <div style={{
          marginBottom: 20, padding: '16px 20px', borderRadius: 14,
          background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 20 }}>🎉</span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#34d399' }}>Resource uploaded successfully!</p>
            <p style={{ fontSize: 12, color: dark ? '#64748b' : '#94a3b8', marginTop: 2 }}>
              Students can now discover your content.
            </p>
          </div>
        </div>
      )}

      <div style={{ ...css.card, padding: 36, borderRadius: 22 }}>

        {/* Resource type */}
        <div style={{ marginBottom: 26 }}>
          <label style={css.label}>Resource Type</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {RESOURCE_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => { set('type', t.key); setSelectedFile(null); setErrors({}); }}
                style={{
                  padding: '14px 16px', borderRadius: 13, cursor: 'pointer', textAlign: 'left',
                  border: `2px solid ${form.type === t.key ? '#6366f1' : (dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)')}`,
                  background: form.type === t.key ? 'rgba(99,102,241,0.1)' : 'transparent',
                  transition: 'all 0.15s', fontFamily: 'inherit',
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 700, color: dark ? '#f1f5f9' : '#0f0f23', marginBottom: 3 }}>
                  {t.label}
                </div>
                <div style={{ fontSize: 12, color: dark ? '#64748b' : '#94a3b8' }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <FormField label="Title *" error={errors.title}>
          <input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Data Structures — Complete Notes"
            style={{ ...css.input, borderColor: errors.title ? '#ef4444' : undefined }}
          />
        </FormField>

        {/* Subject + College */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <FormField label="Subject">
            <select value={form.subject} onChange={(e) => set('subject', e.target.value)} style={css.input}>
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </FormField>
          <FormField label="College">
            <select value={form.college} onChange={(e) => set('college', e.target.value)} style={css.input}>
              {DUMMY_COLLEGES.map((c) => <option key={c.id} value={c.id}>{c.short}</option>)}
            </select>
          </FormField>
        </div>

        {/* Paper exam type */}
        {form.type === 'paper' && (
          <FormField label="Exam Type">
            <select value={form.exam} onChange={(e) => set('exam', e.target.value)} style={css.input}>
              <option value="">Select exam type</option>
              <option value="Mid Sem">Mid Sem</option>
              <option value="End Sem">End Sem</option>
              <option value="Unit Test">Unit Test</option>
              <option value="Prelim">Prelim</option>
            </select>
          </FormField>
        )}

        {/* Video YouTube link */}
        {form.type === 'video' && (
          <FormField label="YouTube Link *" error={errors.ytLink}>
            <input
              value={form.ytLink}
              onChange={(e) => set('ytLink', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              style={{ ...css.input, borderColor: errors.ytLink ? '#ef4444' : undefined }}
            />
          </FormField>
        )}

        {/* Doubt session fields */}
        {form.type === 'doubt' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <FormField label="Session Date *" error={errors.date}>
                <input type="date" value={form.date}
                  onChange={(e) => set('date', e.target.value)}
                  style={{ ...css.input, borderColor: errors.date ? '#ef4444' : undefined }} />
              </FormField>
              <FormField label="Time *" error={errors.time}>
                <input type="time" value={form.time}
                  onChange={(e) => set('time', e.target.value)}
                  style={{ ...css.input, borderColor: errors.time ? '#ef4444' : undefined }} />
              </FormField>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <FormField label="Max Seats *" error={errors.seats}>
                <input type="number" value={form.seats}
                  onChange={(e) => set('seats', e.target.value)}
                  placeholder="e.g. 50"
                  style={{ ...css.input, borderColor: errors.seats ? '#ef4444' : undefined }} />
              </FormField>
              <FormField label="Duration">
                <input value={form.duration}
                  onChange={(e) => set('duration', e.target.value)}
                  placeholder="e.g. 90 min" style={css.input} />
              </FormField>
            </div>
          </>
        )}

        {/* Tags */}
        {(form.type === 'note' || form.type === 'paper') && (
          <FormField label="Tags (comma separated)">
            <input
              value={form.tags}
              onChange={(e) => set('tags', e.target.value)}
              placeholder="e.g. Trees, Graphs, Dynamic Programming"
              style={css.input}
            />
          </FormField>
        )}

        {/* ── FILE UPLOAD ZONE ── */}
        {(form.type === 'note' || form.type === 'paper') && (
          <FormField label="Upload File *" error={errors.file}>

            {/* The REAL file input — visible as a proper button */}
            <input
              type="file"
              accept=".pdf,.ppt,.pptx,.doc,.docx"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                border: `1px solid ${errors.file ? '#ef4444' : dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                background: dark ? '#0a0f1e' : '#f8f9ff',
                color: dark ? '#f1f5f9' : '#0f0f23',
                fontSize: 13,
                cursor: 'pointer',
                marginBottom: 12,
                fontFamily: 'inherit',
              }}
            />

            {/* Drag and drop zone below the input */}
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              style={{
                padding: '20px 28px',
                borderRadius: 14,
                textAlign: 'center',
                border: `2px dashed ${
                  dragging     ? '#6366f1' :
                  selectedFile ? '#10b981' :
                  errors.file  ? '#ef4444' :
                  dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'
                }`,
                background: dragging
                  ? 'rgba(99,102,241,0.08)'
                  : selectedFile
                  ? 'rgba(16,185,129,0.06)'
                  : dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                transition: 'all 0.2s',
              }}
            >
              {selectedFile ? (
                <>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#34d399', marginBottom: 4 }}>
                    {selectedFile.name}
                  </p>
                  <p style={{ fontSize: 12, color: dark ? '#475569' : '#94a3b8', marginBottom: 10 }}>
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={removeFile}
                    style={{
                      fontSize: 12, padding: '4px 14px', borderRadius: 8, cursor: 'pointer',
                      border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)',
                      color: '#ef4444', fontFamily: 'inherit', fontWeight: 600,
                    }}
                  >
                    Remove file
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>☁️</div>
                  <p style={{ fontSize: 13, color: dark ? '#64748b' : '#94a3b8' }}>
                    Or drag & drop file here
                  </p>
                  <p style={{ fontSize: 11, color: dark ? '#334155' : '#cbd5e1', marginTop: 4 }}>
                    PDF, PPT, DOCX up to 50 MB
                  </p>
                </>
              )}
            </div>
          </FormField>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={uploading}
          style={{
            ...css.btnPrimary,
            width: '100%', padding: 14, fontSize: 15, borderRadius: 13,
            opacity: uploading ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginTop: 8,
          }}
        >
          {uploading
            ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Uploading...</>
            : 'Upload Resource →'
          }
        </button>

      </div>
    </div>
  );
}

function FormField({ label, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 13, fontWeight: 600,
        color: error ? '#ef4444' : '#94a3b8', marginBottom: 8,
      }}>
        {label}
      </label>
      {children}
      {error && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 5, fontWeight: 500 }}>{error}</p>}
    </div>
  );
}