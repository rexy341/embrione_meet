import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, LogOut, RefreshCw, ShieldCheck, X, Trash2, Users, Clock3, UserCheck } from 'lucide-react'
import { MemberCard } from '../components/MemberCard'
import { Notice, PageHeading } from '../components/Layout'
import { supabase, supabaseConfigured } from '../lib/supabase'

const ADMIN_EMAIL = 'admin@embrione.pes.edu'
const inputClass = 'mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-cyan-300/70'
const filters = [
  { id: 'all', label: 'All members' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
]

export default function Admin() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState(ADMIN_EMAIL)
  const [password, setPassword] = useState('')
  const [members, setMembers] = useState([])
  const [busyId, setBusyId] = useState('')
  const [busyLogin, setBusyLogin] = useState(false)
  const [notice, setNotice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')

  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL

  useEffect(() => {
    if (!supabase) return undefined
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setNotice({ kind: 'error', text: `Could not check sign-in: ${error.message}` })
      setSession(data?.session ?? null)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => listener.subscription.unsubscribe()
  }, [])

  const loadMembers = useCallback(async () => {
    if (!isAdmin || !supabase) return
    setLoading(true)
    const { data, error } = await supabase.from('members').select('*').order('created_at', { ascending: false })
    if (error) setNotice({ kind: 'error', text: `Could not load members: ${error.message}` })
    else {
      setMembers(data || [])
      setNotice(null)
    }
    setLoading(false)
  }, [isAdmin])

  useEffect(() => { loadMembers() }, [loadMembers])

  async function login(event) {
    event.preventDefault()
    setNotice(null)
    if (!supabaseConfigured) {
      setNotice({ kind: 'error', text: 'Connect Supabase first using .env.local.' })
      return
    }
    if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
      setNotice({ kind: 'error', text: 'Use the designated admin email.' })
      return
    }
    setBusyLogin(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) setNotice({ kind: 'error', text: error.message })
    else {
      setPassword('')
      setNotice({ kind: 'success', text: 'Signed in successfully.' })
    }
    setBusyLogin(false)
  }

  async function changeStatus(member, status) {
    if (!isAdmin) return
    setBusyId(member.id)
    setNotice(null)
    const { error } = await supabase.from('members').update({ status }).eq('id', member.id)
    if (error) setNotice({ kind: 'error', text: `Update failed: ${error.message}` })
    else {
      setMembers(prev => prev.map(item => item.id === member.id ? { ...item, status } : item))
      setNotice({ kind: 'success', text: `${member.name} marked ${status}.` })
    }
    setBusyId('')
  }

  async function deleteMember(member) {
    if (!isAdmin) return
    const confirmed = window.confirm(`Delete ${member.name}'s member record? This cannot be undone.`)
    if (!confirmed) return
    setBusyId(member.id)
    setNotice(null)
    // Delete the database record first. If the photo is in our public Supabase
    // bucket, clean it up too; external demo avatars are left untouched.
    const { error } = await supabase.from('members').delete().eq('id', member.id)
    if (error) {
      setNotice({ kind: 'error', text: `Delete failed: ${error.message}` })
      setBusyId('')
      return
    }

    setMembers(prev => prev.filter(item => item.id !== member.id))
    const photoPath = getMemberPhotoPath(member.photo_url)
    if (photoPath) {
      const { error: photoError } = await supabase.storage.from('member-photos').remove([photoPath])
      if (photoError) {
        setNotice({ kind: 'info', text: `${member.name}'s record was deleted, but the stored photo could not be removed: ${photoError.message}` })
      } else {
        setNotice({ kind: 'success', text: `${member.name}'s record and stored photo were deleted.` })
      }
    } else {
      setNotice({ kind: 'success', text: `${member.name}'s record was deleted.` })
    }
    setBusyId('')
  }

  async function logout() {
    await supabase.auth.signOut()
    setMembers([])
    setNotice({ kind: 'info', text: 'You have signed out.' })
  }

  const counts = useMemo(() => ({
    all: members.length,
    pending: members.filter(m => m.status === 'pending').length,
    approved: members.filter(m => m.status === 'approved').length,
    rejected: members.filter(m => m.status === 'rejected').length,
  }), [members])
  const visibleMembers = activeFilter === 'all' ? members : members.filter(m => m.status === activeFilter)

  return <section className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
    <PageHeading eyebrow="Behind the scenes" title="Moderation dashboard." description="Review every member record, manage application status, and decide who appears in the public team directory." />
    {!supabaseConfigured && <div className="mb-6"><Notice>Admin login needs a configured Supabase project and an admin Auth user.</Notice></div>}
    {notice && <div className="mb-6"><Notice kind={notice.kind}>{notice.text}</Notice></div>}

    {!session ? <form onSubmit={login} className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/[.025] p-6 sm:p-8">
      <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-200"><ShieldCheck /></div>
      <h2 className="text-xl font-semibold">Admin sign in</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-500">Sign in with the administrator account configured in Supabase Auth.</p>
      <label className="mt-6 block text-sm text-zinc-300">Admin email<input className={inputClass} type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label className="mt-4 block text-sm text-zinc-300">Password<input className={inputClass} type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
      <button disabled={busyLogin} className="mt-6 w-full rounded-xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-black hover:bg-cyan-200 disabled:opacity-50">{busyLogin ? 'Signing in…' : 'Sign in securely'}</button>
    </form> : !isAdmin ? <div className="mx-auto max-w-xl rounded-2xl border border-rose-400/20 bg-rose-400/5 p-6">
      <Notice kind="error">This account is not the designated admin. Sign out and use {ADMIN_EMAIL}.</Notice>
      <button onClick={logout} className="mt-4 rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5">Sign out</button>
    </div> : <>
      <div className="mb-7 grid gap-4 sm:grid-cols-3">
        <Stat icon={<Users size={18} />} label="Total members" value={counts.all} />
        <Stat icon={<Clock3 size={18} />} label="Pending review" value={counts.pending} />
        <Stat icon={<UserCheck size={18} />} label="Approved" value={counts.approved} />
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-xl font-semibold">Member management</h2><p className="mt-1 text-sm text-zinc-500">{counts.all} total · {counts.pending} pending · {counts.rejected} rejected</p></div>
        <div className="flex gap-2">
          <button type="button" onClick={loadMembers} disabled={loading} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm text-zinc-300 hover:bg-white/5 disabled:opacity-50"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh</button>
          <button type="button" onClick={logout} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm text-zinc-300 hover:bg-white/5"><LogOut size={15} /> Sign out</button>
        </div>
      </div>

      <div className="metal-tabs mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter members by status">
        {filters.map((filter, index) => <button key={filter.id} type="button" role="tab" aria-selected={activeFilter === filter.id} onClick={() => setActiveFilter(filter.id)} className={`metal-tab ${activeFilter === filter.id ? 'metal-tab--active' : ''}`}>
          <span className="metal-tab__label">{filter.label}</span><span className="metal-tab__count">{counts[filter.id]}</span>
        </button>)}
      </div>

      {loading ? <p className="py-16 text-center text-zinc-500">Loading members from Supabase…</p> : visibleMembers.length ? <div className="grid gap-5 lg:grid-cols-2">{visibleMembers.map(member => <div key={member.id} className="rounded-2xl border border-white/10 bg-white/[.025] p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3"><span className={`rounded-full px-3 py-1 text-xs font-medium ${member.status === 'approved' ? 'bg-emerald-400/10 text-emerald-200' : member.status === 'rejected' ? 'bg-rose-400/10 text-rose-200' : 'bg-amber-300/10 text-amber-100'}`}>{member.status}</span><span className="text-xs text-zinc-600">{member.created_at ? new Date(member.created_at).toLocaleDateString() : ''}</span></div>
        <MemberCard member={member} />
        <div className="mt-4 flex flex-wrap gap-2">
          {member.status !== 'approved' && <button type="button" disabled={busyId === member.id} onClick={() => changeStatus(member, 'approved')} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500/15 px-3 py-3 text-sm font-semibold text-emerald-200 ring-1 ring-emerald-400/20 hover:bg-emerald-500/25 disabled:opacity-50"><Check size={16} /> Approve</button>}
          {member.status === 'pending' && <button type="button" disabled={busyId === member.id} onClick={() => changeStatus(member, 'rejected')} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500/10 px-3 py-3 text-sm font-semibold text-rose-200 ring-1 ring-rose-400/20 hover:bg-rose-500/20 disabled:opacity-50"><X size={16} /> Reject</button>}
          <button type="button" disabled={busyId === member.id} onClick={() => deleteMember(member)} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-3 text-sm text-zinc-300 hover:border-rose-400/30 hover:bg-rose-400/5 hover:text-rose-200 disabled:opacity-50"><Trash2 size={15} /> Delete</button>
        </div>
        <p className="mt-3 break-all text-xs text-zinc-600">{member.email} · {member.srn}</p>
      </div>)}</div> : <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center"><Check className="mx-auto text-cyan-200" /><p className="mt-3 font-medium">No {activeFilter === 'all' ? '' : `${activeFilter} `}members found</p><p className="mt-1 text-sm text-zinc-500">{activeFilter === 'pending' ? 'New submissions will appear here.' : 'Try another status filter or refresh the list.'}</p></div>}
    </>}
  </section>
}

function getMemberPhotoPath(photoUrl) {
  if (!photoUrl || !supabase) return null
  try {
    const url = new URL(photoUrl)
    const marker = '/storage/v1/object/public/member-photos/'
    const index = url.pathname.indexOf(marker)
    if (index === -1) return null
    return decodeURIComponent(url.pathname.slice(index + marker.length)) || null
  } catch {
    return null
  }
}

function Stat({ icon, label, value }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><div className="flex items-center justify-between text-zinc-500"><p className="text-sm">{label}</p><span className="text-cyan-200">{icon}</span></div><p className="mt-3 text-3xl font-semibold">{value}</p></div>
}
