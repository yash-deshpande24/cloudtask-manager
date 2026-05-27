import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTasks, createTask, updateTask, deleteTask } from '../api';

const STATUSES   = ['todo', 'in_progress', 'done'];
const STATUS_MAP = { todo: { label: 'To Do', color: '#64748b' }, in_progress: { label: 'In Progress', color: '#f59e0b' }, done: { label: 'Done', color: '#22c55e' } };
const PRIORITY   = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };

const s = {
  app:    { minHeight:'100vh', background:'#0f172a', color:'#f1f5f9', fontFamily:'system-ui,sans-serif' },
  nav:    { background:'#1e293b', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:64, borderBottom:'1px solid #334155' },
  logo:   { display:'flex', alignItems:'center', gap:10, fontSize:18, fontWeight:700, color:'#f1f5f9' },
  user:   { display:'flex', alignItems:'center', gap:12 },
  avatar: { width:36, height:36, borderRadius:'50%', background:'#3b82f6', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14 },
  logout: { background:'transparent', border:'1px solid #334155', color:'#94a3b8', padding:'6px 14px', borderRadius:6, cursor:'pointer', fontSize:13 },
  main:   { padding:'28px 24px', maxWidth:1100, margin:'0 auto' },
  form:   { background:'#1e293b', borderRadius:12, padding:20, marginBottom:28, border:'1px solid #334155' },
  row:    { display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end' },
  inp:    { flex:2, minWidth:200, padding:'10px 14px', background:'#0f172a', border:'1px solid #334155', borderRadius:8, color:'#f1f5f9', fontSize:14, outline:'none' },
  sel:    { flex:1, minWidth:130, padding:'10px 14px', background:'#0f172a', border:'1px solid #334155', borderRadius:8, color:'#f1f5f9', fontSize:14, outline:'none' },
  addbtn: { padding:'10px 22px', background:'#3b82f6', border:'none', borderRadius:8, color:'#fff', fontWeight:700, cursor:'pointer', fontSize:14, whiteSpace:'nowrap' },
  cols:   { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:20 },
  col:    { background:'#1e293b', borderRadius:12, padding:16, border:'1px solid #334155' },
  colhdr: (c) => ({ display:'flex', alignItems:'center', gap:8, marginBottom:16, paddingBottom:12, borderBottom:'1px solid #334155' }),
  dot:    (c) => ({ width:10, height:10, borderRadius:'50%', background:c }),
  badge:  (c) => ({ marginLeft:'auto', background:`${c}22`, color:c, padding:'2px 8px', borderRadius:12, fontSize:12, fontWeight:600 }),
  card:   { background:'#0f172a', borderRadius:10, padding:14, marginBottom:10, border:'1px solid #1e293b', position:'relative' },
  ctitle: { fontWeight:600, fontSize:15, marginBottom:6, paddingRight:60 },
  cdesc:  { color:'#64748b', fontSize:13, marginBottom:10, lineHeight:1.5 },
  cfoot:  { display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' },
  ptag:   (p) => ({ background:`${PRIORITY[p]}22`, color:PRIORITY[p], padding:'2px 8px', borderRadius:6, fontSize:11, fontWeight:700, textTransform:'uppercase' }),
  acts:   { position:'absolute', top:12, right:12, display:'flex', gap:6 },
  ibtn:   (c) => ({ width:28, height:28, border:'none', borderRadius:6, cursor:'pointer', background:`${c}22`, color:c, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }),
  stsel:  { background:'transparent', border:'none', color:'#94a3b8', fontSize:12, cursor:'pointer', padding:'2px 4px' },
  empty:  { textAlign:'center', color:'#334155', padding:'32px 0', fontSize:14 },
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks,    setTasks]    = useState([]);
  const [newTask,  setNewTask]  = useState({ title:'', description:'', priority:'medium' });
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getTasks().then(r => setTasks(r.data)).finally(() => setLoading(false));
  }, []);

  const add = async () => {
    if (!newTask.title.trim()) return;
    const { data } = await createTask(newTask);
    setTasks(t => [data, ...t]);
    setNewTask({ title:'', description:'', priority:'medium' });
  };

  const changeStatus = async (id, status) => {
    const { data } = await updateTask(id, { status });
    setTasks(t => t.map(x => x.id === id ? data : x));
  };

  const remove = async (id) => {
    await deleteTask(id);
    setTasks(t => t.filter(x => x.id !== id));
  };

  const byStatus = (s) => tasks.filter(t => t.status === s);

  return (
    <div style={s.app}>
      <nav style={s.nav}>
        <div style={s.logo}>☁️ <span>CloudTask</span></div>
        <div style={s.user}>
          <div style={s.avatar}>{user?.name?.[0]?.toUpperCase() || 'U'}</div>
          <span style={{ color:'#94a3b8', fontSize:14 }}>{user?.name}</span>
          <button style={s.logout} onClick={logout}>Logout</button>
        </div>
      </nav>

      <main style={s.main}>
        <h2 style={{ marginBottom:20, fontSize:20, fontWeight:700 }}>My Tasks
          <span style={{ marginLeft:10, color:'#64748b', fontSize:14, fontWeight:400 }}>{tasks.length} total</span>
        </h2>

        {/* Add Task Form */}
        <div style={s.form}>
          <div style={{ color:'#94a3b8', fontSize:13, fontWeight:600, marginBottom:12 }}>+ New Task</div>
          <div style={s.row}>
            <input style={s.inp} placeholder="Task title *" value={newTask.title}
              onChange={e => setNewTask(n => ({ ...n, title: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && add()} />
            <input style={{ ...s.inp, flex:3 }} placeholder="Description (optional)" value={newTask.description}
              onChange={e => setNewTask(n => ({ ...n, description: e.target.value }))} />
            <select style={s.sel} value={newTask.priority} onChange={e => setNewTask(n => ({ ...n, priority: e.target.value }))}>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
            <button style={s.addbtn} onClick={add}>Add Task</button>
          </div>
        </div>

        {/* Kanban Columns */}
        {loading ? (
          <div style={{ textAlign:'center', color:'#64748b', padding:60 }}>Loading tasks...</div>
        ) : (
          <div style={s.cols}>
            {STATUSES.map(status => {
              const { label, color } = STATUS_MAP[status];
              const col = byStatus(status);
              return (
                <div key={status} style={s.col}>
                  <div style={s.colhdr(color)}>
                    <span style={s.dot(color)} />
                    <span style={{ fontWeight:700, fontSize:15 }}>{label}</span>
                    <span style={s.badge(color)}>{col.length}</span>
                  </div>
                  {col.length === 0 && <div style={s.empty}>No tasks</div>}
                  {col.map(task => (
                    <div key={task.id} style={s.card}>
                      <div style={s.acts}>
                        <button style={s.ibtn('#ef4444')} onClick={() => remove(task.id)} title="Delete">✕</button>
                      </div>
                      <div style={s.ctitle}>{task.title}</div>
                      {task.description && <div style={s.cdesc}>{task.description}</div>}
                      <div style={s.cfoot}>
                        <span style={s.ptag(task.priority)}>{task.priority}</span>
                        <select style={s.stsel} value={task.status}
                          onChange={e => changeStatus(task.id, e.target.value)}>
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                        <span style={{ marginLeft:'auto', color:'#334155', fontSize:11 }}>
                          {new Date(task.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
