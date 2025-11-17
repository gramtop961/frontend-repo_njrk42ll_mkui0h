import { useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

function Chip({ active, children, onClick }){
  return (
    <button onClick={onClick} className={`px-3 py-1 rounded-full border transition text-sm backdrop-blur ${active ? 'bg-[#1A1F2C] text-[#FEF9F0] border-transparent shadow' : 'bg-white/50 text-[#1A1F2C] border-white/60 hover:bg-white/70'}`}>
      {children}
    </button>
  );
}

function Stat({ label, value }){
  return (
    <div className="p-4 rounded-2xl bg-white/60 backdrop-blur border border-white/50 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-[#1A1F2C]/60">{label}</div>
      <div className="text-2xl font-semibold mt-1" style={{ fontFamily:'Playfair Display, serif' }}>{value}</div>
    </div>
  );
}

function Card({ children, className = '' }){
  return <div className={`bg-white/70 backdrop-blur rounded-3xl shadow-xl border border-white/50 ${className}`}>{children}</div>;
}

export default function Dashboard(){
  const [user, setUser] = useState(null);
  const [wardrobe, setWardrobe] = useState([]);
  const [occasion, setOccasion] = useState('Smart casual dinner');
  const [weather, setWeather] = useState('Mild 18C');
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [filter, setFilter] = useState('all');

  const categories = ['all','upper','t-shirt','shirt','jacket','outerwear','dress','pants','jeans','skirt','shorts','shoes','accessory'];

  useEffect(() => {
    // Demo: create or update a seed user so UI works without auth wiring
    fetch(`${API_BASE}/users`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email:'demo@stylesage.ai', name:'Demo User', height_cm:180, weight_kg:75, style_preferences:['classic','minimalist'] })})
      .then(r=>r.json()).then(setUser).catch(()=>{});
  },[]);

  useEffect(() => {
    if(user?._id){
      fetch(`${API_BASE}/users/${user._id}/wardrobe`).then(r=>r.json()).then(setWardrobe).catch(()=>{});
    }
  },[user]);

  const filteredWardrobe = useMemo(()=>{
    if(filter==='all') return wardrobe;
    return wardrobe.filter(i => (i.category||'').toLowerCase() === filter);
  },[wardrobe, filter]);

  const requestRecommendation = async () => {
    if(!user?._id) return;
    setLoading(true);
    setRec(null);
    try{
      const r = await fetch(`${API_BASE}/recommendations`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ user_id: user._id, occasion, weather })});
      const data = await r.json();
      setRec(data);
    }catch(e){
      console.error(e);
    }finally{setLoading(false);}  
  };

  const quickSuggest = async () => {
    setLoading(true); setRec(null);
    try{
      const r = await fetch(`${API_BASE}/recommendations/without-wardrobe`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ height_cm: 180, weight_kg: 75, body_type:'rectangle', style_choice:'classic' })});
      const data = await r.json();
      setRec(data);
    }catch(e){ console.error(e);} finally{ setLoading(false);}  
  };

  const addDemoItem = async () => {
    if(!user?._id) return;
    const demoImage = 'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200&auto=format&fit=crop';
    setAdding(true);
    try{
      const r = await fetch(`${API_BASE}/wardrobe/analyze`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ user_id: user._id, image_url: demoImage })});
      const data = await r.json();
      setWardrobe((w)=>[data, ...w]);
    } finally { setAdding(false);} 
  };

  const addCustomItem = async () => {
    if(!user?._id || !imageUrl) return;
    setAdding(true);
    try{
      const r = await fetch(`${API_BASE}/wardrobe/analyze`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ user_id: user._id, image_url: imageUrl })});
      const data = await r.json();
      setWardrobe((w)=>[data, ...w]);
      setImageUrl('');
      setFilter('all');
    }catch(e){ console.error(e);} finally{ setAdding(false);}  
  };

  const countsByCategory = useMemo(()=>{
    const map = {};
    wardrobe.forEach(i=>{
      const c = (i.category||'other').toLowerCase();
      map[c] = (map[c]||0)+1;
    });
    return map;
  },[wardrobe]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0f1422]">
      {/* Ambient background ornaments */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#D4AF37]/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-[#7a6c3a]/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.04),transparent_60%)]" />
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl text-[#FEF9F0]" style={{ fontFamily:'Playfair Display, serif' }}>Style Sage</h1>
            <p className="text-[#FEF9F0]/70 text-sm md:text-base">Curate your wardrobe and get impeccable, tailored outfits.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={quickSuggest} className="px-4 py-2 rounded-full bg-[#D4AF37] text-[#1A1F2C] font-medium shadow-[0_10px_30px_rgba(212,175,55,0.35)] hover:brightness-110 transition">Suggest Without Wardrobe</button>
            <button onClick={requestRecommendation} className="px-4 py-2 rounded-full bg-white/80 text-[#1A1F2C] font-medium backdrop-blur hover:bg-white">Get Outfit</button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pb-16">
        {/* Top stats and controls */}
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <Card className="p-6 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-3 flex-wrap">
                {categories.map(c => (
                  <Chip key={c} active={filter===c} onClick={()=>setFilter(c)}>
                    <span className="capitalize">{c}</span>
                    {c!=='all' && countsByCategory[c] ? <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-black/10 text-[10px]">{countsByCategory[c]}</span> : null}
                  </Chip>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input value={occasion} onChange={e=>setOccasion(e.target.value)} className="px-3 py-2 rounded-full bg-white/70 border border-white/50 text-sm" placeholder="Occasion" />
                <input value={weather} onChange={e=>setWeather(e.target.value)} className="px-3 py-2 rounded-full bg-white/70 border border-white/50 text-sm" placeholder="Weather" />
              </div>
            </div>

            {/* Wardrobe grid */}
            <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredWardrobe.length === 0 ? (
                <div className="col-span-full text-center text-[#FEF9F0]/70 py-16">
                  <div className="text-2xl mb-2" style={{ fontFamily:'Playfair Display, serif' }}>Your wardrobe awaits</div>
                  <p className="text-sm">Add images of jackets, tees, pants, shoes—anything—and we’ll analyze them automatically.</p>
                </div>
              ) : filteredWardrobe.map(i => (
                <div key={i._id} className="group relative rounded-2xl overflow-hidden shadow-lg border border-white/40 bg-white/60">
                  <img src={i.image_url} className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <div className="text-sm font-semibold drop-shadow">{i.specific_name || i.subcategory || i.category || 'Item'}</div>
                    <div className="text-[11px] opacity-90 drop-shadow">
                      {[(i.category||'').toUpperCase(), i.color, i.material].filter(Boolean).join(' • ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Add item + stats */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="text-lg font-semibold text-[#1A1F2C]" style={{ fontFamily:'Playfair Display, serif' }}>Add wardrobe item</div>
              <p className="text-sm text-[#1A1F2C]/70 mt-1">Paste an image link for any piece: upperwear, jacket, t‑shirt, pants, shoes, accessories—anything.</p>
              <div className="mt-4 space-y-3">
                <input value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="https://image-url" className="w-full px-3 py-2 rounded-xl bg-white/70 border border-white/60" />
                <div className="flex gap-3">
                  <button onClick={addCustomItem} disabled={!imageUrl || adding} className="flex-1 px-4 py-2 rounded-xl bg-[#1A1F2C] text-[#FEF9F0] disabled:opacity-60">{adding ? 'Analyzing…' : 'Analyze & Save'}</button>
                  <button onClick={addDemoItem} disabled={adding} className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#1A1F2C]">Add demo</button>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-3 gap-4">
              <Stat label="Items" value={wardrobe.length} />
              <Stat label="Categories" value={Object.keys(countsByCategory).length || 0} />
              <Stat label="Favorites" value={rec?.is_favorite ? 1 : 0} />
            </div>

            <Card className="p-0 overflow-hidden">
              <div className="px-6 pt-5">
                <div className="text-lg font-semibold" style={{ fontFamily:'Playfair Display, serif' }}>Recommendation</div>
                <p className="text-sm text-[#1A1F2C]/70">Get a complete look tailored to your items, occasion, and weather.</p>
              </div>
              <div className="p-6">
                {loading && <div className="animate-pulse text-[#1A1F2C]/60">Curating a premium look…</div>}
                {!loading && rec && (
                  <div className="space-y-4">
                    <div>
                      <div className="text-xl font-semibold">{rec.outfit_name || 'Curated Look'}</div>
                      {rec.justification && <p className="text-sm text-[#1A1F2C]/70 mt-1">{rec.justification}</p>}
                    </div>
                    <div className="space-y-3">
                      {(rec.items||[]).map((it, idx)=> (
                        <div key={idx} className="flex items-center gap-3">
                          {it.image_url && <img src={it.image_url} className="h-12 w-12 object-cover rounded-lg" />}
                          <div>
                            <div className="font-medium">{it.specific_name || `${it.category}`}</div>
                            <div className="text-xs text-[#1A1F2C]/60">{[it.category, it.color].filter(Boolean).join(' • ')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!loading && !rec && (
                  <div className="text-sm text-[#1A1F2C]/60">No look yet. Click “Get Outfit”.</div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
