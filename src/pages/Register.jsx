import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, UploadCloud } from 'lucide-react'
import { MemberCard } from '../components/MemberCard'
import { Notice, PageHeading } from '../components/Layout'
import { convertToWebP } from '../lib/image'
import { supabase, supabaseConfigured } from '../lib/supabase'

const domains = ['Web Development', 'Design', 'Logistics', 'Operations', 'Sponsorship', 'Hospitality', 'Social Media', 'Event Management']
const positions = ['Head', 'Vice-Head', 'Core Member', 'Member']
const branches = ['CSE', 'AIML', 'ECE', 'EEE', 'ME', 'Biotech', 'Other']
const initial = { name: '', domain: domains[0], position: 'Member', srn: '', email: '', linkedin_url: '', github_url: '', branch: 'CSE', semester: '1', bio: '' }
const fieldClass = 'mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/10'
const labelClass = 'block text-sm font-medium text-zinc-300'

function Field({ label, children }) { return <label className={labelClass}>{label}{children}</label> }

export default function Register() {
  const [form, setForm] = useState(initial)
  const [webpFile, setWebpFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)
  const [converting, setConverting] = useState(false)
  const memberPreview = useMemo(() => ({ ...form, photo_url: photoPreview }), [form, photoPreview])

  useEffect(() => () => { if (photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview) }, [photoPreview])
  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  async function handlePhoto(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setNotice(null); setConverting(true)
    try {
      const converted = await convertToWebP(file)
      setWebpFile(converted)
      setPhotoPreview(old => { if (old.startsWith('blob:')) URL.revokeObjectURL(old); return URL.createObjectURL(converted) })
      setNotice({ kind: 'success', text: `Image converted to WebP (${(converted.size / 1024).toFixed(0)} KB). It will upload when you submit.` })
    } catch (error) { setNotice({ kind: 'error', text: error.message || 'Could not process that image.' }) }
    finally { setConverting(false); event.target.value = '' }
  }

  async function submit(event) {
    event.preventDefault(); setNotice(null)
    if (!supabaseConfigured) { setNotice({ kind: 'error', text: 'Connect Supabase first: fill in VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local, then restart the dev server.' }); return }
    if (!webpFile) { setNotice({ kind: 'error', text: 'Please select a profile picture. It will be converted to WebP before upload.' }); return }
    const linkedin = form.linkedin_url.trim(), github = form.github_url.trim()
    if ((linkedin && !/^https:\/\//i.test(linkedin)) || (github && !/^https:\/\//i.test(github))) { setNotice({ kind: 'error', text: 'Social profile links must start with https://.' }); return }
    setBusy(true)
    try {
      const srn = form.srn.trim().toUpperCase()
      const { data: existing, error: lookupError } = await supabase.from('members').select('id').eq('srn', srn).maybeSingle()
      if (lookupError) throw lookupError
      if (existing) throw new Error('That SRN has already been submitted. If you think this is a mistake, contact the team.')

      const safeName = webpFile.name.toLowerCase().replace(/[^a-z0-9._-]/g, '-')
      const path = `${crypto.randomUUID()}-${safeName}`
      const { error: uploadError } = await supabase.storage.from('member-photos').upload(path, webpFile, { contentType: 'image/webp', upsert: false })
      if (uploadError) throw uploadError
      const { data: publicUrlData } = supabase.storage.from('member-photos').getPublicUrl(path)
      const row = { name: form.name.trim(), domain: form.domain, position: form.position, srn, email: form.email.trim(), linkedin_url: linkedin || null, github_url: github || null, branch: form.branch, semester: Number(form.semester), bio: form.bio.trim(), photo_url: publicUrlData.publicUrl, status: 'pending' }
      const { error: insertError } = await supabase.from('members').insert(row)
      if (insertError) { await supabase.storage.from('member-photos').remove([path]); throw insertError }
      setNotice({ kind: 'success', text: 'Application submitted! Your profile is pending admin review and will appear in the team directory after approval.' })
      setForm(initial); setWebpFile(null); setPhotoPreview(old => { if (old.startsWith('blob:')) URL.revokeObjectURL(old); return '' })
    } catch (error) { setNotice({ kind: 'error', text: error.message || 'Submission failed. Check your connection and try again.' }) }
    finally { setBusy(false) }
  }

  return <section className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
    <PageHeading eyebrow="Become part of the story" title="Your journey starts here." description="Introduce yourself to The Embrione. Complete your profile and see your member card take shape in real time." />
    {!supabaseConfigured && <div className="mb-6"><Notice>Preview mode: the interface works, but database submission needs your Supabase environment variables.</Notice></div>}
    {notice && <div className="mb-6"><Notice kind={notice.kind}>{notice.text}</Notice></div>}
    <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_.85fr]">
      <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-white/[.025] p-5 sm:p-7">
        <div className="mb-6 flex items-center justify-between"><h2 className="text-lg font-semibold">Member details</h2><span className="text-xs text-zinc-500">* Required</span></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name *"><input className={fieldClass} required maxLength={100} value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Aanya Rao" /></Field>
          <Field label="SRN *"><input className={fieldClass} required maxLength={30} value={form.srn} onChange={e => update('srn', e.target.value)} placeholder="PES1UG23CS001" /></Field>
          <Field label="Domain *"><select className={fieldClass} value={form.domain} onChange={e => update('domain', e.target.value)}>{domains.map(x => <option key={x}>{x}</option>)}</select></Field>
          <Field label="Position *"><select className={fieldClass} value={form.position} onChange={e => update('position', e.target.value)}>{positions.map(x => <option key={x}>{x}</option>)}</select></Field>
          <Field label="Email *"><input className={fieldClass} type="email" required maxLength={254} value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" /></Field>
          <Field label="Branch *"><select className={fieldClass} value={form.branch} onChange={e => update('branch', e.target.value)}>{branches.map(x => <option key={x}>{x}</option>)}</select></Field>
          <Field label="Semester *"><select className={fieldClass} value={form.semester} onChange={e => update('semester', e.target.value)}>{Array.from({length: 8}, (_, i) => String(i + 1)).map(x => <option key={x} value={x}>{x}</option>)}</select></Field>
          <Field label="LinkedIn URL"><input className={fieldClass} type="url" value={form.linkedin_url} onChange={e => update('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/..." /></Field>
          <div className="sm:col-span-2"><Field label="GitHub URL"><input className={fieldClass} type="url" value={form.github_url} onChange={e => update('github_url', e.target.value)} placeholder="https://github.com/..." /></Field></div>
          <div className="sm:col-span-2"><Field label="Short bio *"><textarea className={`${fieldClass} min-h-28 resize-y`} required minLength={10} maxLength={200} value={form.bio} onChange={e => update('bio', e.target.value)} placeholder="Tell us what you enjoy building, creating, or contributing..." /><span className="mt-1 block text-right text-xs text-zinc-600">{form.bio.length}/200 characters</span></Field></div>
          <div className="sm:col-span-2"><label className={labelClass}>Profile picture *<span className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/15 bg-black/20 px-4 py-5 transition hover:border-cyan-400/60"><UploadCloud className="text-cyan-300"/><span className="flex-1"><span className="block text-sm text-zinc-200">{webpFile ? webpFile.name : 'Choose a PNG, JPG, or WebP image'}</span><span className="mt-1 block text-xs text-zinc-500">Max 10 MB · Converted to WebP in your browser</span></span><input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePhoto} /></span></label>{converting && <p className="mt-2 text-xs text-cyan-300">Converting image…</p>}</div>
        </div>
        <button disabled={busy || converting} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Submitting…' : <><CheckCircle2 size={17}/> Submit for approval</>}</button>
        <p className="mt-3 text-center text-xs leading-5 text-zinc-600">Your profile stays hidden from the public directory until an admin approves it.</p>
      </form>
      <aside className="lg:sticky lg:top-24"><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">Live preview</p><h2 className="mt-1 text-lg font-semibold">Your member card</h2></div><span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">Preview</span></div><MemberCard member={memberPreview} preview/><p className="mt-4 text-xs leading-5 text-zinc-600">This preview updates as you type. Your selected photo is only uploaded when you submit the form.</p></aside>
    </div>
  </section>
}
