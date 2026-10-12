import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, ArrowDownToLine, ArrowLeft, Bell, Bookmark, Check, ChevronDown, CircleHelp,
  Compass, Crown, Flame, Gift, Heart, Home, ImagePlus, Info, LogIn, Menu, MessageCircle,
  Mic, MoreHorizontal, Radio, Search, Send, Settings, ShieldCheck, Sparkles, Tv, Upload,
  UserRound, Users, Video, Wallet, X, Zap
} from 'lucide-react';
import { supabase } from './lib/supabase';
import './styles.css';

const demoVideos = [
  { id: 'v1', creator: 'zara.creates', name: 'Zara James', caption: 'Lagos after the rain just hits different 🌆✨', tag: 'Lifestyle', likes: 24800, views: '182K', avatar: 'Z', color: 'coral', poster: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85', video_url: '' },
  { id: 'v2', creator: 'chuksbeats', name: 'Chuks Beats', caption: 'Made this beat from sounds around my street 🎧', tag: 'Music', likes: 18300, views: '96K', avatar: 'C', color: 'purple', poster: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=85', video_url: '' },
  { id: 'v3', creator: 'mira.cooks', name: 'Mira Cooks', caption: 'Quick suya-style noodles for late night cravings 🌶️', tag: 'Food', likes: 12700, views: '74K', avatar: 'M', color: 'orange', poster: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=85', video_url: '' },
];
const liveCreators = [
  { name: 'Nana Live', handle: '@nanalive', topic: 'Chill with me · Q&A', viewers: '2.4K', color: 'pink', initials: 'N' },
  { name: 'DJ Kola', handle: '@djkola', topic: 'Afrobeats live set', viewers: '1.8K', color: 'blue', initials: 'K' },
  { name: 'Tech With Sam', handle: '@techwithsam', topic: 'Building in public', viewers: '846', color: 'green', initials: 'S' },
];
const giftItems = [
  { name: 'Heart', icon: '💖', cost: 5 }, { name: 'Fire', icon: '🔥', cost: 25 }, { name: 'Star', icon: '⭐', cost: 50 }, { name: 'Crown', icon: '👑', cost: 250 }, { name: 'Rocket', icon: '🚀', cost: 500 }, { name: 'Diamond', icon: '💎', cost: 1000 },
];
const navItems = [{ label: 'For You', icon: Home }, { label: 'Discover', icon: Compass }, { label: 'Following', icon: Users }, { label: 'LIVE', icon: Radio }, { label: 'Messages', icon: MessageCircle }];

function App() {
  const [page, setPage] = useState('For You');
  const [videos, setVideos] = useState(demoVideos);
  const [activeVideo, setActiveVideo] = useState(null);
  const [liked, setLiked] = useState([]);
  const [saved, setSaved] = useState([]);
  const [following, setFollowing] = useState([]);
  const [search, setSearch] = useState('');
  const [showStudio, setShowStudio] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [activeLive, setActiveLive] = useState(null);
  const [giftToast, setGiftToast] = useState('');
  const [giftCount, setGiftCount] = useState(0);
  const [coinBalance, setCoinBalance] = useState(1200);
  const [chat, setChat] = useState(['Welcome to the room! 🎉', 'The vibes are immaculate', '🇳🇬🇳🇬🇳🇬']);
  const [chatInput, setChatInput] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [cloudVideos, setCloudVideos] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    supabase.from('videos').select('id, caption, video_url, thumbnail_url, created_at, user_id, profiles(username, display_name, avatar_url)').eq('visibility', 'public').order('created_at', { ascending: false }).limit(30).then(({ data, error }) => {
      if (!error && data?.length) {
        const mapped = data.map((v) => ({ id: v.id, creator: v.profiles?.username || 'creator', name: v.profiles?.display_name || 'ADUJI Creator', caption: v.caption || '', tag: 'Community', likes: 0, views: 'New', avatar: (v.profiles?.display_name || 'A').slice(0, 1).toUpperCase(), color: 'blue', poster: v.thumbnail_url || '', video_url: v.video_url || '' }));
        setVideos([...mapped, ...demoVideos]); setCloudVideos(true);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const filteredVideos = useMemo(() => videos.filter((v) => `${v.caption} ${v.creator} ${v.tag}`.toLowerCase().includes(search.toLowerCase())), [videos, search]);
  const selectPage = (label) => { setPage(label); setShowMobileNav(false); if (label === 'LIVE') setActiveLive(null); };
  const toggleLike = (id) => setLiked((old) => old.includes(id) ? old.filter((x) => x !== id) : [...old, id]);
  const toggleSave = (id) => setSaved((old) => old.includes(id) ? old.filter((x) => x !== id) : [...old, id]);

  async function handleGoogleAuth() {
    setNotice('');
    if (!supabase) { setNotice('Add your Supabase URL and publishable key in Vercel first.'); return; }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) setNotice(error.message);
  }
  async function handleAuth(e) {
    e.preventDefault(); setNotice('');
    if (!supabase) { setNotice('Add your Supabase environment variables in Vercel to enable accounts.'); return; }
    const action = authMode === 'signup' ? supabase.auth.signUp({ email: authEmail, password: authPassword, options: { data: { display_name: authEmail.split('@')[0] } } }) : supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    const { error } = await action;
    if (error) setNotice(error.message); else { setNotice(authMode === 'signup' ? 'Account created. Check your email if confirmation is enabled.' : 'Signed in successfully.'); setTimeout(() => setShowAuth(false), 700); }
  }
  async function handleUpload(e) {
    e.preventDefault();
    if (!uploadFile) { setNotice('Choose a video file first.'); return; }
    if (!user || !supabase) { setNotice('Sign in with a configured Supabase account to upload.'); return; }
    const path = `${user.id}/${Date.now()}-${uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
    const { error: uploadError } = await supabase.storage.from('aduji-videos').upload(path, uploadFile, { contentType: uploadFile.type, upsert: false });
    if (uploadError) { setNotice(uploadError.message); return; }
    const { data: publicData } = supabase.storage.from('aduji-videos').getPublicUrl(path);
    const { error } = await supabase.from('videos').insert({ user_id: user.id, caption: uploadTitle || uploadFile.name, video_url: publicData.publicUrl, visibility: 'public' });
    if (error) { setNotice(error.message); return; }
    setNotice('Video published!'); setShowUpload(false); setUploadFile(null); setUploadTitle(''); window.location.reload();
  }
  async function startLive(e) {
    e.preventDefault();
    setShowStudio(false);
    setActiveLive({ name: user?.email?.split('@')[0] || 'Your Live', handle: '@you', topic: 'Creator live room', viewers: '1', color: 'purple', initials: 'Y', creator: true });
    setPage('LIVE');
    setChat(['Your live room is open in preview mode.', 'Connect a live video provider to broadcast to viewers.']);
  }
  function sendGift(gift) {
    if (coinBalance < gift.cost) { setGiftToast('Not enough demo coins.'); return; }
    setCoinBalance((b) => b - gift.cost); setGiftCount((n) => n + 1); setChat((c) => [...c.slice(-8), `You sent ${gift.icon} ${gift.name}!`]); setGiftToast(`${gift.icon} ${gift.name} sent!`); setTimeout(() => setGiftToast(''), 2200);
  }
  function sendChat(e) { e.preventDefault(); if (!chatInput.trim()) return; setChat((c) => [...c.slice(-9), chatInput.trim()]); setChatInput(''); }

  return <div className="app-shell">
    <header className="topbar">
      <button className="icon-btn mobile-menu" aria-label="Open menu" onClick={() => setShowMobileNav(!showMobileNav)}><Menu size={21}/></button>
      <button className="brand" onClick={() => selectPage('For You')}><span className="brand-mark">A</span><span>ADUJI</span><span className="brand-dot">.</span></button>
      <div className="searchbox"><Search size={18}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search creators, videos, sounds..."/><kbd>⌘ K</kbd></div>
      <div className="top-actions"><button className="icon-btn" title="Notifications" onClick={() => setNotice('You’re all caught up!')}><Bell size={19}/><i className="notification-dot"/></button><button className="coin-pill" onClick={() => setShowWallet(true)}><span>🪙</span>{coinBalance.toLocaleString()} <ChevronDown size={14}/></button>{user ? <button className="profile-mini" title="Sign out" onClick={async () => { await supabase?.auth.signOut(); setUser(null); }}> {(user.email || 'A').slice(0,1).toUpperCase()}</button> : <button className="sign-in" onClick={() => setShowAuth(true)}>Log in</button>}<button className="create-btn" onClick={() => user ? setShowUpload(true) : setShowAuth(true)}><Upload size={16}/> Create</button></div>
    </header>
    <div className="layout">
      <aside className={`sidebar ${showMobileNav ? 'sidebar-open' : ''}`}>
        <div className="sidebar-scroll"><p className="side-label">YOUR SPACE</p>{navItems.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${page === label ? 'selected' : ''}`} onClick={() => selectPage(label)}><Icon size={19}/><span>{label}</span>{label === 'LIVE' && <span className="live-nav-dot"/>}{label === 'Messages' && <span className="nav-count">3</span>}</button>)}
          <div className="side-divider"/><p className="side-label">TRENDING TOPICS</p>{['Afrobeats', 'Comedy', 'Campus life', 'Food & recipes', 'Football'].map((x, i) => <button className="topic-item" key={x} onClick={() => { setSearch(x); setPage('Discover'); }}><span className={`topic-dot topic-${i}`}/>{x}</button>)}
          <div className="side-divider"/><div className="side-live-head"><p className="side-label">LIVE NOW</p><span className="live-counter">● 24</span></div>{liveCreators.map((creator) => <button className="live-person" key={creator.name} onClick={() => { setActiveLive(creator); setPage('LIVE'); setChat(['Welcome to the live chat 👋', 'Where are you watching from?']); }}><span className={`person-avatar ${creator.color}`}>{creator.initials}<i/></span><span className="person-text"><b>{creator.name}</b><small>{creator.topic}</small></span><span className="live-mini-dot"/></button>)}
          <div className="sidebar-promo"><span className="promo-spark"><Sparkles size={18}/></span><b>Your creativity deserves a stage.</b><p>Go live, connect with your people, and build your community.</p><button onClick={() => setShowStudio(true)}>Open Live Studio <ArrowLeft size={14}/></button></div>
          <div className="sidebar-bottom"><button onClick={() => setNotice('Settings will be available as the account features are connected.')}><Settings size={17}/> Settings</button><button onClick={() => setNotice('Help centre is coming soon.')}><CircleHelp size={17}/> Help centre</button><div className="footer-links">About · Guidelines · Privacy · Terms<br/><span>© 2026 ADUJI</span></div></div>
        </div>
      </aside>
      <main className="main-content">
        {page === 'LIVE' ? <LivePage activeLive={activeLive} setActiveLive={setActiveLive} setShowStudio={setShowStudio} setShowGift={setShowGift} setShowAuth={setShowAuth} chat={chat} chatInput={chatInput} setChatInput={setChatInput} sendChat={sendChat} giftCount={giftCount} giftToast={giftToast} following={following} setFollowing={setFollowing} /> : page === 'Messages' ? <MessagesPage setShowAuth={setShowAuth}/> : <>
          <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line"/> THE INTERNET, YOUR WAY</div><h1>{page === 'Discover' ? 'Find your next' : page === 'Following' ? 'Your people,' : 'Your world.'}<br/><span>{page === 'Discover' ? 'new obsession.' : page === 'Following' ? 'in one place.' : 'Your stories.'}</span></h1><p className="welcome-sub">A home for your videos, your people, and the moments that matter.</p></div><div className="welcome-art"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-glow"/><div className="art-play"><Video size={30} fill="currentColor"/></div><span className="art-chip chip-one">✦ CREATE</span><span className="art-chip chip-two">● LIVE</span><span className="art-chip chip-three">♡ CONNECT</span></div></section>
          <section className="quick-actions"><button onClick={() => setShowUpload(true)} className="quick-card"><span className="quick-icon coral-bg"><ImagePlus size={20}/></span><span><b>Share a video</b><small>Post your moment</small></span><span className="quick-arrow">↗</span></button><button onClick={() => setShowStudio(true)} className="quick-card"><span className="quick-icon purple-bg"><Radio size={20}/></span><span><b>Go LIVE</b><small>Meet your community</small></span><span className="quick-arrow">↗</span></button><button onClick={() => setShowWallet(true)} className="quick-card"><span className="quick-icon gold-bg"><Gift size={20}/></span><span><b>Send a gift</b><small>Make a creator's day</small></span><span className="quick-arrow">↗</span></button></section>
          <section className="live-strip"><div className="section-heading"><div><span className="live-badge"><span/> LIVE RIGHT NOW</span><h2>Happening live</h2><p>Drop in, say hi, and be part of the moment.</p></div><button className="text-link" onClick={() => selectPage('LIVE')}>Explore LIVE <ArrowLeft size={15}/></button></div><div className="live-cards">{liveCreators.map((c, i) => <button key={c.name} className={`live-card live-card-${i}`} onClick={() => { setActiveLive(c); setPage('LIVE'); setChat(['Welcome to the live chat 👋', 'Where are you watching from?']); }}><div className="live-card-image"><span className="live-label"><span/> LIVE</span><span className="viewers"><Users size={13}/>{c.viewers}</span><div className={`live-portrait ${c.color}`}>{c.initials}</div><span className="live-wave">〰 〰 〰</span></div><div className="live-card-info"><span className={`tiny-avatar ${c.color}`}>{c.initials}</span><span><b>{c.name}</b><small>{c.topic}</small></span><span className="join-arrow">↗</span></div></button>)}</div></section>
          <section className="feed-section"><div className="feed-heading"><div><h2>{page === 'Discover' ? 'Made for your curiosity' : page === 'Following' ? 'From your community' : 'Made for your mood'} <Sparkles size={18}/></h2><p>Fresh stories picked for you</p></div><div className="feed-tabs"><button className="active-tab" onClick={() => setPage('For You')}>For you</button><button onClick={() => setPage('Discover')}>Explore</button></div></div><div className="video-grid">{filteredVideos.map((v) => <article className="video-card" key={v.id}><button className="video-poster" style={{ backgroundImage: `linear-gradient(180deg, transparent 55%, rgba(0,0,0,.75)), url("${v.poster || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=85'}")` }} onClick={() => setActiveVideo(v)}><span className="poster-play"><Video size={18} fill="currentColor"/></span><span className="video-views"><Activity size={13}/>{v.views || 'New'} views</span><span className="video-tag">{v.tag}</span></button><div className="video-meta"><div className={`creator-avatar ${v.color}`}>{v.avatar}</div><div className="video-meta-text"><b>{v.name}</b><span>@{v.creator}</span><p>{v.caption}</p></div><button className={`more-btn ${following.includes(v.creator) ? 'following' : ''}`} title={following.includes(v.creator) ? 'Following' : 'Follow creator'} onClick={() => setFollowing((old) => old.includes(v.creator) ? old.filter((x) => x !== v.creator) : [...old, v.creator])}>{following.includes(v.creator) ? <Check size={18}/> : <MoreHorizontal size={20}/>}</button></div><div className="video-actions"><button className={liked.includes(v.id) ? 'liked' : ''} onClick={() => toggleLike(v.id)}><Heart size={17} fill={liked.includes(v.id) ? 'currentColor' : 'none'}/>{(v.likes + (liked.includes(v.id) ? 1 : 0)).toLocaleString()}</button><button onClick={() => { setActiveVideo(v); setNotice('Comments are ready to connect to your Supabase comments table.'); }}><MessageCircle size={17}/> Comment</button><button className={saved.includes(v.id) ? 'saved' : ''} onClick={() => toggleSave(v.id)}><Bookmark size={17}/></button><button onClick={() => setShowGift(true)}><Gift size={17}/></button></div></article>)}</div>{filteredVideos.length === 0 && <div className="empty-state"><Search size={25}/><h3>No stories found</h3><p>Try another search to discover something new.</p></div>}</section>
        </>}
        <footer className="main-footer"><span>ADUJI is where your next story begins.</span><span><ShieldCheck size={14}/> Community-first by design</span></footer>
      </main>
      <aside className="right-rail"><div className="rail-card creator-card"><div className="rail-card-title"><span>CREATOR CORNER</span><Sparkles size={17}/></div><div className="creator-spotlight"><div className="spotlight-art"><div className="spotlight-disc">A<span>✦</span></div><span className="spotlight-star star-a">✧</span><span className="spotlight-star star-b">✦</span></div><h3>Your next chapter starts here.</h3><p>Build your audience, share what you love, and make your corner of ADUJI yours.</p><button className="rail-primary" onClick={() => setShowStudio(true)}>Become a creator <ArrowLeft size={15}/></button></div></div><div className="rail-card trends-card"><div className="rail-card-title"><span>ON EVERYONE'S MIND</span><Flame size={17}/></div>{[{tag:'#NaijaCreators',desc:'Creators to watch',posts:'12.8K posts'},{tag:'#Afrobeats',desc:'Sound of the moment',posts:'8.2K posts'},{tag:'#CampusLife',desc:'The student experience',posts:'5.4K posts'},{tag:'#StreetFood',desc:'What are we eating?',posts:'3.1K posts'}].map((t,i)=><button className="trend-row" key={t.tag} onClick={() => { setSearch(t.tag.replace('#','')); setPage('Discover'); }}><span className="trend-number">0{i+1}</span><span><b>{t.tag}</b><small>{t.desc}</small><small className="trend-posts">{t.posts}</small></span><MoreHorizontal size={17}/></button>)}<button className="show-more" onClick={() => selectPage('Discover')}>Explore all trends <ArrowLeft size={14}/></button></div><div className="rail-card balance-card"><div className="balance-top"><span className="balance-icon"><Wallet size={19}/></span><span>YOUR ADUJI WALLET<small>Demo coin balance</small></span></div><div className="balance-amount">{coinBalance.toLocaleString()} <span>COINS</span></div><div className="balance-progress"><span/></div><p>Send gifts to show creators some love.</p><button onClick={() => setShowWallet(true)}>Manage wallet <ArrowLeft size={14}/></button><small className="wallet-disclaimer">Demo balance only · no real money</small></div><div className="rail-community"><span className="community-avatars"><i>A</i><i>K</i><i>M</i><i>+</i></span><span><b>Find your people.</b><small>Good things happen together.</small></span></div></aside>
    </div>

    {showStudio && <Modal title="ADUJI Live Studio" subtitle="Set the scene. Bring your community in." onClose={() => setShowStudio(false)}><form className="modal-form" onSubmit={startLive}><div className="studio-preview"><div className="preview-camera"><Video size={30}/><span>CAMERA PREVIEW</span><small>Live video provider not connected</small></div><div className="preview-side"><span className="preview-dot"/> Studio preview<div className="preview-muted"><Mic size={15}/> Microphone ready in preview</div></div></div><label>Live title<input placeholder="What are we talking about today?" defaultValue="Let's hang out ✨"/></label><label>Category<select defaultValue="Community"><option>Community</option><option>Music</option><option>Gaming</option><option>Education</option><option>Food</option><option>Q&A</option></select></label><div className="notice-box"><Info size={17}/><span>This opens a live-room preview. To broadcast real camera video to other viewers, connect a streaming provider such as LiveKit, Agora, or Livepeer and configure its keys.</span></div><button className="modal-primary" type="submit"><Radio size={17}/> Open live room preview</button></form></Modal>}
    {showUpload && <Modal title="Share your story" subtitle="Your next favourite moment could start here." onClose={() => { setShowUpload(false); setNotice(''); }}><form className="modal-form" onSubmit={handleUpload}><label>Video caption<input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="Give your video a little context..."/></label><label className="file-drop"><input type="file" accept="video/*" onChange={(e) => setUploadFile(e.target.files?.[0] || null)}/><Upload size={25}/><b>{uploadFile ? uploadFile.name : 'Choose a video to upload'}</b><small>{uploadFile ? `${(uploadFile.size / 1024 / 1024).toFixed(1)} MB` : 'MP4, WebM or MOV · select from your device'}</small></label>{!user && <div className="notice-box"><Info size={17}/><span>Sign in and configure Supabase in Vercel to upload videos permanently. Preview interactions work without an account.</span></div>}{notice && <p className="form-notice">{notice}</p>}<button className="modal-primary" type="submit"><Upload size={17}/> Publish video</button></form></Modal>}
    {showAuth && <Modal title={authMode === 'signup' ? 'Join ADUJI' : 'Welcome back'} subtitle="Your people and your stories are waiting." onClose={() => { setShowAuth(false); setNotice(''); }}><div className="modal-form"><button className="google-auth-btn" type="button" onClick={handleGoogleAuth}><span className="google-g">G</span> Continue with Google</button><div className="auth-divider"><span/>or use email<span/></div><form className="modal-form auth-email-form" onSubmit={handleAuth}><label>Email address<input type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="you@example.com"/></label><label>Password<input type="password" required minLength={6} value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="At least 6 characters"/></label>{notice && <p className="form-notice">{notice}</p>}<button className="modal-primary" type="submit"><LogIn size={17}/>{authMode === 'signup' ? 'Create account' : 'Log in'}</button><button className="modal-secondary" type="button" onClick={() => { setAuthMode(authMode === 'signup' ? 'signin' : 'signup'); setNotice(''); }}>{authMode === 'signup' ? 'Already have an account? Log in' : 'New to ADUJI? Create an account'}</button>{!supabase && <p className="form-footnote">Accounts activate when your Supabase environment variables are configured in Vercel.</p>}</form></div></Modal>}
    {showGift && <Modal title="Send some love" subtitle="Gifts are a fun way to support the moment." onClose={() => setShowGift(false)}><div className="gift-balance"><span>🪙</span><span><b>{coinBalance.toLocaleString()} demo coins</b><small>Preview currency — not redeemable for cash</small></span><button onClick={() => { setShowGift(false); setShowWallet(true); }}>Wallet</button></div><div className="gift-grid">{giftItems.map((g) => <button key={g.name} className="gift-tile" onClick={() => sendGift(g)}><span>{g.icon}</span><b>{g.name}</b><small>🪙 {g.cost}</small></button>)}</div>{giftToast && <p className="gift-toast">{giftToast}</p>}<p className="form-footnote">Gift sending here is a local demo. Real purchases, creator payouts, fraud checks, and age-appropriate payment controls are not enabled.</p></Modal>}
    {showWallet && <Modal title="Your ADUJI wallet" subtitle="A preview of how creator gifts could work." onClose={() => setShowWallet(false)}><div className="wallet-hero"><span>🪙</span><small>DEMO COIN BALANCE</small><strong>{coinBalance.toLocaleString()}</strong><p>Use coins to send virtual gifts in live rooms.</p></div><div className="wallet-rows"><div><span>Gifts sent this session</span><b>{giftCount}</b></div><div><span>Real-money transactions</span><b>Disabled</b></div><div><span>Creator payouts</span><b>Not connected</b></div></div><div className="notice-box"><ShieldCheck size={17}/><span>Real-money gifting requires a compliant payment provider, transparent pricing, fraud controls, refund handling, and creator payout verification. This build uses demo coins only.</span></div><button className="modal-primary" onClick={() => { setShowWallet(false); setShowGift(true); }}><Gift size={17}/> Browse gifts</button></Modal>}
    {activeVideo && <Modal title="Video preview" subtitle={`@${activeVideo.creator}`} onClose={() => setActiveVideo(null)}><div className="video-detail"><div className="video-detail-poster" style={{backgroundImage:`url("${activeVideo.poster}")`}}>{activeVideo.video_url ? <video src={activeVideo.video_url} controls autoPlay playsInline/> : <div><Video size={28}/><span>Video card preview</span></div>}</div><h3>{activeVideo.caption}</h3><div className="detail-actions"><button className={liked.includes(activeVideo.id) ? 'liked' : ''} onClick={() => toggleLike(activeVideo.id)}><Heart size={18}/> {activeVideo.likes + (liked.includes(activeVideo.id) ? 1 : 0)}</button><button onClick={() => { setActiveVideo(null); setShowGift(true); }}><Gift size={18}/> Send gift</button><button onClick={() => toggleSave(activeVideo.id)}><Bookmark size={18}/> {saved.includes(activeVideo.id) ? 'Saved' : 'Save'}</button></div></div></Modal>}
    {notice && !showAuth && !showUpload && <div className="toast-note" role="status"><Info size={17}/>{notice}<button onClick={() => setNotice('')}><X size={15}/></button></div>}
  </div>;
}

function LivePage({ activeLive, setActiveLive, setShowStudio, setShowGift, setShowAuth, chat, chatInput, setChatInput, sendChat, giftCount, giftToast, following, setFollowing }) {
  const creator = activeLive || liveCreators[0];
  return <section className="live-page"><div className="live-page-header"><div><span className="live-badge"><span/> ADUJI LIVE</span><h1>Be there <span>in the moment.</span></h1><p>Real-time conversations, shared passions, and people who get you.</p></div><button className="create-btn" onClick={() => setShowStudio(true)}><Radio size={16}/> Go live</button></div><div className="live-room-layout"><div className="live-stage"><div className="stage-top"><span className="live-label"><span/> LIVE</span><span className="stage-viewers"><Users size={15}/>{creator.viewers || '1'} watching</span></div><div className={`stage-visual ${creator.color || 'purple'}`}><div className="stage-halo"/><div className="stage-big-avatar">{creator.initials || creator.name?.slice(0,1) || 'A'}</div><div className="stage-equalizer"><i/><i/><i/><i/><i/><i/><i/><i/><i/></div><div className="stage-copy"><b>{creator.topic || 'Creator live room'}</b><span>{creator.name || 'ADUJI Creator'}</span></div><span className="stage-watermark">ADUJI</span></div><div className="stage-controls"><button onClick={() => setShowAuth(true)}><Heart size={17}/> Follow</button><button onClick={() => setShowGift(true)} className="stage-gift"><Gift size={17}/> Send a gift</button><button onClick={() => setShowStudio(true)}><Video size={17}/> Start your live</button></div><div className="live-creator-info"><div className={`creator-avatar ${creator.color || 'purple'}`}>{creator.initials || 'A'}</div><div><b>{creator.name || 'ADUJI Creator'}</b><small>{creator.handle || '@creator'} · {creator.topic || 'Live now'}</small></div><button className={`follow-btn ${following.includes(creator.handle) ? 'following' : ''}`} onClick={() => setFollowing((old) => old.includes(creator.handle) ? old.filter((x) => x !== creator.handle) : [...old, creator.handle])}>{following.includes(creator.handle) ? 'Following' : 'Follow'}</button></div></div><div className="live-chat-panel"><div className="chat-header"><div><MessageCircle size={17}/><b>Live chat</b></div><span><i/> {creator.viewers || '1'} here</span></div><div className="chat-topic"><span>✦</span> Keep it kind. Make it a good room.</div><div className="chat-messages">{chat.map((line, i) => <div className="chat-message" key={`${line}-${i}`}><span className={`chat-avatar chat-color-${i % 4}`}>{i === 0 ? 'A' : ['J','M','T','Y'][i % 4]}</span><p><b>{i === 0 ? 'aduji_community' : ['joyfulsoul','mimi_vibes','techfan','you'][i % 4]}</b>{line}</p></div>)}</div>{giftToast && <div className="chat-gift-alert">{giftToast}</div>}<form className="chat-form" onSubmit={sendChat}><input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Say something nice..."/><button type="submit" aria-label="Send message"><Send size={17}/></button></form><div className="chat-bottom"><button onClick={() => setShowGift(true)}><Gift size={16}/> Send gift {giftCount > 0 && <span>{giftCount}</span>}</button><small>Be kind · Stay curious</small></div></div></div><div className="live-explore"><div className="section-heading"><div><h2>More rooms to explore</h2><p>Find a vibe that feels like yours.</p></div></div><div className="live-cards">{liveCreators.map((c) => <button key={c.name} className="live-card" onClick={() => setActiveLive(c)}><div className="live-card-image"><span className="live-label"><span/> LIVE</span><span className="viewers"><Users size={13}/>{c.viewers}</span><div className={`live-portrait ${c.color}`}>{c.initials}</div><span className="live-wave">〰 〰 〰</span></div><div className="live-card-info"><span className={`tiny-avatar ${c.color}`}>{c.initials}</span><span><b>{c.name}</b><small>{c.topic}</small></span><span className="join-arrow">↗</span></div></button>)}</div></div></section>;
}
function MessagesPage({ setShowAuth }) { return <section className="messages-page"><span className="quick-icon purple-bg"><MessageCircle size={24}/></span><h1>Your conversations.</h1><p>Good communities start with good conversations. Sign in to get your messages when messaging is connected.</p><button className="modal-primary" onClick={() => setShowAuth(true)}><LogIn size={17}/> Log in to ADUJI</button><div className="notice-box"><Info size={17}/><span>Messaging UI is a placeholder in this starter. Direct message persistence and notifications need their database policies and realtime channel wired in.</span></div></section>; }
function Modal({ title, subtitle, onClose, children }) { return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><section className="modal" role="dialog" aria-modal="true" aria-label={title}><div className="modal-head"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={19}/></button></div>{children}</section></div>; }

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
