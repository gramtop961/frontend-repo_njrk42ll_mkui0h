import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

function Card({ children }){
  return <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-5 border border-white/40">{children}</div>;
}

export default function Dashboard(){
  const [user, setUser] = useState(null);
  const [wardrobe, setWardrobe] = useState([]);
  const [occasion, setOccasion] = useState('Smart casual dinner');
  const [weather, setWeather] = useState('Mild 18C');
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(false);

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
    const r = await fetch(`${API_BASE}/wardrobe/analyze`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ user_id: user._id, image_url: demoImage })});
    const data = await r.json();
    setWardrobe((w)=>[data, ...w]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEF9F0] to-[#f1eee6] text-[#1A1F2C] px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-semibold" style={{ fontFamily:'Playfair Display, serif' }}>Dashboard</h2>
          <div className="space-x-3">
            <button onClick={addDemoItem} className="px-4 py-2 rounded-full bg-[#1A1F2C] text-[#FEF9F0]">Add demo item</button>
            <button onClick={quickSuggest} className="px-4 py-2 rounded-full bg-[#D4AF37] text-[#1A1F2C]">Without Wardrobe</button>
            <button onClick={requestRecommendation} className="px-4 py-2 rounded-full bg-[#1A1F2C] text-[#FEF9F0]">Get Outfit</button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <div className="text-sm text-gray-500">Occasion</div>
            <input value={occasion} onChange={e=>setOccasion(e.target.value)} className="mt-2 w-full border rounded px-3 py-2" />
            <div className="text-sm text-gray-500 mt-4">Weather</div>
            <input value={weather} onChange={e=>setWeather(e.target.value)} className="mt-2 w-full border rounded px-3 py-2" />
          </Card>
          <Card>
            <div className="font-medium mb-2">Wardrobe</div>
            <div className="grid grid-cols-3 gap-2">
              {wardrobe.map(i=> (
                <img key={i._id} src={i.image_url} className="h-24 w-full object-cover rounded-lg" />
              ))}
            </div>
          </Card>
          <Card>
            <div className="font-medium mb-2">Result</div>
            {loading && <div className="animate-pulse text-gray-500">Curating a premium look...</div>}
            {!loading && rec && (
              <div className="space-y-3">
                <div className="text-xl font-semibold">{rec.outfit_name || 'Curated Look'}</div>
                {rec.justification && <p className="text-sm text-gray-600">{rec.justification}</p>}
                <div className="space-y-2">
                  {(rec.items||[]).map((it, idx)=> (
                    <div key={idx} className="flex items-center gap-3">
                      {it.image_url && <img src={it.image_url} className="h-14 w-14 object-cover rounded-md" />}
                      <div>
                        <div className="font-medium">{it.specific_name || `${it.category}`}</div>
                        {it.color && <div className="text-xs text-gray-500">{it.color}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
