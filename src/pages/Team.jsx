import { useEffect, useMemo, useState } from 'react'
import { Search, Users } from 'lucide-react'
import { MemberCard } from '../components/MemberCard'
import { Notice, PageHeading } from '../components/Layout'
import { supabase, supabaseConfigured } from '../lib/supabase'

const demoMembers = [
  { id: 'demo-1', name: 'Aanya Rao', domain: 'Web Development', position: 'Head', branch: 'CSE', semester: 6, bio: 'Building thoughtful digital experiences and exploring the space where design meets engineering.', photo_url: 'https://i.pravatar.cc/240?img=47', linkedin_url: 'https://linkedin.com', github_url: 'https://github.com' },
  { id: 'demo-2', name: 'Rohan Mehta', domain: 'Design', position: 'Core Member', branch: 'AIML', semester: 4, bio: 'Turning complex ideas into simple, accessible interfaces with a little personality.', photo_url: 'https://i.pravatar.cc/240?img=12', linkedin_url: 'https://linkedin.com', github_url: 'https://github.com' },
  { id: 'demo-3', name: 'Ishita Nair', domain: 'Operations', position: 'Vice-Head', branch: 'CSE', semester: 6, bio: 'A systems thinker who loves bringing people together and making good ideas happen.', photo_url: 'https://i.pravatar.cc/240?img=44', linkedin_url: 'https://linkedin.com', github_url: 'https://github.com' },
  { id: 'demo-4', name: 'Kabir Shah', domain: 'Logistics', position: 'Member', branch: 'ECE', semester: 2, bio: 'Curious about technology, teamwork, and the details that make an event memorable.', photo_url: 'https://i.pravatar.cc/240?img=13', linkedin_url: 'https://linkedin.com', github_url: 'https://github.com' },
  { id: 'demo-5', name: 'Meera Iyer', domain: 'Social Media', position: 'Core Member', branch: 'CSE', semester: 4, bio: 'Storytelling, creative campaigns, and finding fresh ways to build a community.', photo_url: 'https://i.pravatar.cc/240?img=49', linkedin_url: 'https://linkedin.com', github_url: 'https://github.com' },
  { id: 'demo-6', name: 'Arjun Das', domain: 'Event Management', position: 'Member', branch: 'ME', semester: 2, bio: 'Enjoys collaborative projects, practical problem-solving, and a well-planned event.', photo_url: 'https://i.pravatar.cc/240?img=60', linkedin_url: 'https://linkedin.com', github_url: 'https://github.com' },
]
const domains = ['All domains', 'Web Development', 'Design', 'Logistics', 'Operations', 'Sponsorship', 'Hospitality', 'Social Media', 'Event Management']
const positions = ['All positions', 'Head', 'Vice-Head', 'Core Member', 'Member']
const selectClass = 'rounded-xl border border-white/10 bg-[#081319] px-4 py-3 text-sm text-zinc-200 outline-none focus:border-cyan-400/60'

export default function Team() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [domain, setDomain] = useState('All domains')
  const [position, setPosition] = useState('All positions')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let alive = true
    async function load() {
      if (!supabaseConfigured) { setMembers(demoMembers); setLoading(false); return }
      const { data, error: queryError } = await supabase.from('members').select('id,name,domain,position,branch,semester,bio,photo_url,linkedin_url,github_url').eq('status', 'approved').order('created_at', { ascending: false })
      if (!alive) return
      if (queryError) { setError(queryError.message); setMembers([]) }
      else setMembers(data || [])
      setLoading(false)
    }
    load()
    return () => { alive = false }
  }, [])

  const filtered = useMemo(() => members.filter(m => (domain === 'All domains' || m.domain === domain) && (position === 'All positions' || m.position === position) && `${m.name} ${m.domain} ${m.position} ${m.bio || ''}`.toLowerCase().includes(search.toLowerCase())), [members, domain, position, search])

  return <section className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
    <PageHeading eyebrow="People behind the ideas" title="Meet the team." description="A community of curious minds, creative problem-solvers, and builders making things happen at PES University." />
    {!supabaseConfigured && <div className="mb-6"><Notice>Showing sample profiles for the design preview. Connect Supabase to load approved members from your database.</Notice></div>}
    {error && <div className="mb-6"><Notice kind="error">Could not load approved members: {error}</Notice></div>}
    <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-4 md:flex-row">
      <label className="relative flex-1"><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members…" className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm outline-none placeholder:text-zinc-600 focus:border-cyan-400/60"/></label>
      <select aria-label="Filter by domain" className={selectClass} value={domain} onChange={e => setDomain(e.target.value)}>{domains.map(x => <option key={x}>{x}</option>)}</select>
      <select aria-label="Filter by position" className={selectClass} value={position} onChange={e => setPosition(e.target.value)}>{positions.map(x => <option key={x}>{x}</option>)}</select>
    </div>
    <div className="mb-5 flex items-center justify-between text-sm text-zinc-500"><span className="flex items-center gap-2"><Users size={16}/>{filtered.length} {filtered.length === 1 ? 'member' : 'members'}</span><span>Approved members</span></div>
    {loading ? <div className="py-20 text-center text-zinc-500">Loading the team…</div> : filtered.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map(member => <MemberCard key={member.id} member={member}/>)}</div> : <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center"><p className="font-medium text-zinc-200">No matching members</p><p className="mt-2 text-sm text-zinc-500">Try changing the filters or search term.</p></div>}
  </section>
}
