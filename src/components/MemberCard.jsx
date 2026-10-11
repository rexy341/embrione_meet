import { Github, Linkedin, Sparkles } from 'lucide-react'

export function MemberCard({ member, preview = false }) {
  const name = member.name?.trim() || 'Your Name'
  const initials = name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()
  return <article className="group overflow-hidden rounded-2xl border border-white/10 bg-[#081319] shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35">
    <div className="h-1 bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-300" />
    <div className="p-5 sm:p-6">
      <div className="flex items-start gap-4">
        {member.photo_url ? <img src={member.photo_url} alt={`${name} profile`} className="h-16 w-16 rounded-2xl border border-white/10 object-cover" /> : <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-cyan-500/15 text-lg font-semibold text-cyan-200 ring-1 ring-cyan-300/20">{initials || <Sparkles/>}</div>}
        <div className="min-w-0 flex-1"><p className="truncate text-lg font-semibold text-white">{name}</p><p className="mt-1 text-sm text-cyan-300">{member.position || 'Member'}</p><p className="mt-2 text-xs text-zinc-500">{member.domain || 'Choose a domain'}</p></div>
      </div>
      <p className="mt-5 min-h-[4.5rem] text-sm leading-6 text-zinc-400">{member.bio?.trim() || 'A little introduction about you will appear here.'}</p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4 text-xs text-zinc-500"><span>{[member.branch, member.semester ? `Semester ${member.semester}` : null].filter(Boolean).join(' · ') || 'PES University'}</span><div className="flex gap-3">{member.linkedin_url && <a aria-label={`${name} LinkedIn`} href={member.linkedin_url} target="_blank" rel="noreferrer" className="hover:text-cyan-300"><Linkedin size={16}/></a>}{member.github_url && <a aria-label={`${name} GitHub`} href={member.github_url} target="_blank" rel="noreferrer" className="hover:text-cyan-300"><Github size={16}/></a>}</div></div>
      {preview && <p className="mt-3 text-[10px] uppercase tracking-widest text-cyan-300/70">Live preview</p>}
    </div>
  </article>
}
