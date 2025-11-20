import { useEffect, useState } from 'react'

const apiBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function App() {
  const [guilds, setGuilds] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ guild_id: '', guild_name: '', bot_token: '' })
  const [mapping, setMapping] = useState({ guild_id: '', plan: '', role_id: '', role_name: '' })
  const [link, setLink] = useState({ provider: 'stripe', provider_user_id: '', discord_user_id: '', guild_id: '' })
  const [notice, setNotice] = useState('')

  const fetchGuilds = async () => {
    const res = await fetch(`${apiBase}/api/guilds`)
    const data = await res.json()
    setGuilds(data.items || [])
  }

  useEffect(() => { fetchGuilds() }, [])

  const saveGuild = async (e) => {
    e.preventDefault()
    setLoading(true)
    setNotice('')
    try {
      const res = await fetch(`${apiBase}/api/guilds/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error('Failed to save guild config')
      await fetchGuilds()
      setForm({ guild_id: '', guild_name: '', bot_token: '' })
      setNotice('Saved guild settings')
    } catch (e) {
      setNotice(e.message)
    } finally {
      setLoading(false)
    }
  }

  const saveMapping = async (e) => {
    e.preventDefault()
    setLoading(true)
    setNotice('')
    try {
      const res = await fetch(`${apiBase}/api/mappings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapping)
      })
      if (!res.ok) throw new Error('Failed to save mapping')
      setMapping({ guild_id: '', plan: '', role_id: '', role_name: '' })
      setNotice('Saved role mapping')
    } catch (e) {
      setNotice(e.message)
    } finally {
      setLoading(false)
    }
  }

  const saveLink = async (e) => {
    e.preventDefault()
    setLoading(true)
    setNotice('')
    try {
      const res = await fetch(`${apiBase}/api/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(link)
      })
      if (!res.ok) throw new Error('Failed to save member link')
      setLink({ provider: 'stripe', provider_user_id: '', discord_user_id: '', guild_id: '' })
      setNotice('Saved member link')
    } catch (e) {
      setNotice(e.message)
    } finally {
      setLoading(false)
    }
  }

  const triggerAssign = async (action) => {
    setLoading(true)
    setNotice('')
    try {
      const res = await fetch(`${apiBase}/api/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guild_id: mapping.guild_id, discord_user_id: link.discord_user_id, plan: mapping.plan })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed')
      setNotice(`${action} success: role ${data.role_id}`)
    } catch (e) {
      setNotice(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="relative min-h-screen p-8 max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Discord Role Automation</h1>
        <p className="text-blue-200 mb-8">Connect your server, map products to roles, and assign automatically via webhooks.</p>

        {notice && (
          <div className="mb-6 p-3 rounded bg-slate-800/60 border border-blue-500/30 text-blue-200">{notice}</div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 border border-blue-500/20 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">1) Server Settings</h2>
            <form onSubmit={saveGuild} className="space-y-3">
              <input className="w-full p-2 rounded bg-slate-900/60 border border-slate-700" placeholder="Guild ID" value={form.guild_id} onChange={e=>setForm({...form,guild_id:e.target.value})} />
              <input className="w-full p-2 rounded bg-slate-900/60 border border-slate-700" placeholder="Guild Name (optional)" value={form.guild_name} onChange={e=>setForm({...form,guild_name:e.target.value})} />
              <input className="w-full p-2 rounded bg-slate-900/60 border border-slate-700" placeholder="Bot Token (kept secret)" value={form.bot_token} onChange={e=>setForm({...form,bot_token:e.target.value})} />
              <button disabled={loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">Save</button>
            </form>

            <div className="mt-5">
              <h3 className="font-medium mb-2">Your Servers</h3>
              <div className="space-y-2">
                {guilds.map(g => (
                  <div key={g._id} className="text-sm bg-slate-900/40 border border-slate-700 rounded p-2 flex items-center justify-between">
                    <span>{g.guild_name || 'Unnamed'} · {g.guild_id}</span>
                    <button className="text-xs px-2 py-1 bg-slate-700 rounded" onClick={()=>{
                      setMapping(m=>({...m, guild_id: g.guild_id}))
                      setLink(l=>({...l, guild_id: g.guild_id}))
                    }}>Use</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-blue-500/20 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">2) Map Product to Role</h2>
            <form onSubmit={saveMapping} className="space-y-3">
              <input className="w-full p-2 rounded bg-slate-900/60 border border-slate-700" placeholder="Guild ID" value={mapping.guild_id} onChange={e=>setMapping({...mapping,guild_id:e.target.value})} />
              <input className="w-full p-2 rounded bg-slate-900/60 border border-slate-700" placeholder="Plan/Product ID (e.g. price_123)" value={mapping.plan} onChange={e=>setMapping({...mapping,plan:e.target.value})} />
              <input className="w-full p-2 rounded bg-slate-900/60 border border-slate-700" placeholder="Role ID" value={mapping.role_id} onChange={e=>setMapping({...mapping,role_id:e.target.value})} />
              <input className="w-full p-2 rounded bg-slate-900/60 border border-slate-700" placeholder="Role Name (optional)" value={mapping.role_name} onChange={e=>setMapping({...mapping,role_name:e.target.value})} />
              <button disabled={loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">Save</button>
            </form>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">3) Link Member</h2>
              <form onSubmit={saveLink} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input className="w-full p-2 rounded bg-slate-900/60 border border-slate-700" placeholder="Provider (stripe)" value={link.provider} onChange={e=>setLink({...link,provider:e.target.value})} />
                  <input className="w-full p-2 rounded bg-slate-900/60 border border-slate-700" placeholder="Guild ID" value={link.guild_id} onChange={e=>setLink({...link,guild_id:e.target.value})} />
                </div>
                <input className="w-full p-2 rounded bg-slate-900/60 border border-slate-700" placeholder="Provider User ID (e.g. cus_...)" value={link.provider_user_id} onChange={e=>setLink({...link,provider_user_id:e.target.value})} />
                <input className="w-full p-2 rounded bg-slate-900/60 border border-slate-700" placeholder="Discord User ID" value={link.discord_user_id} onChange={e=>setLink({...link,discord_user_id:e.target.value})} />
                <button disabled={loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">Save</button>
              </form>
            </div>

            <div className="mt-6 flex gap-2">
              <button disabled={loading} onClick={()=>triggerAssign('assign')} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded">Assign Now</button>
              <button disabled={loading} onClick={()=>triggerAssign('remove')} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded">Remove Now</button>
            </div>
          </div>
        </div>

        <div className="mt-10 text-sm text-blue-300/70">
          <p>Tip: Create a Discord bot with Manage Roles, add it to your server, and place its token in Server Settings. Then map your product plan IDs to role IDs. Use webhooks from your payment provider to POST to the webhook endpoint with provider, type, plan, provider_user_id, guild_id, and action.</p>
        </div>
      </div>
    </div>
  )
}

export default App
