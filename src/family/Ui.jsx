import { useEffect, useRef } from 'react';
function Icon({ name, size = 20, ...props }) {
  const paths = {
    train: <><path d="m7 4 2 2-3 3-2-2m13 13-2-2 3-3 2 2M5 19 19 5M3 12l9 9M12 3l9 9" /></>,
    history: <><path d="M3 10a9 9 0 1 1 1 7M3 4v6h6M12 7v5l3 2" /></>,
    chart: <><path d="M4 4v16h16M8 15l4-5 4 2 4-7" /></>,
    settings: <><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="3" /><circle cx="15" cy="17" r="3" /></>,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    check: <path d="m5 12 4 4L19 6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    pause: <><path d="M8 5v14M16 5v14" /></>,
    play: <path d="m8 5 11 7-11 7Z" />,
    undo: <><path d="m8 4-5 5 5 5M3 9h10a7 7 0 0 1 0 14" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    sound: <><path d="M4 9v6h4l5 4V5L8 9ZM17 8a7 7 0 0 1 0 8M20 5a11 11 0 0 1 0 14" /></>,
    mute: <><path d="M4 9v6h4l5 4V5L8 9ZM17 9l5 6m0-6-5 6" /></>,
    shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z" /><path d="m8 12 3 3 5-6" /></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.shield}</svg>;
}

function Bell({ small = false }) {
  if (small) return <svg viewBox="0 0 32 36" width="30" height="34" aria-hidden="true"><path d="M10 13C2-2 30-2 22 13" fill="none" stroke="currentColor" strokeWidth="4"/><path d="M9 12h14c1 5 7 7 7 14 0 6-5 9-14 9S2 32 2 26c0-7 6-9 7-14Z" fill="currentColor"/></svg>;
  return <svg className="bell-art" viewBox="0 0 300 290" aria-hidden="true"><defs><linearGradient id="bellBody" x1="0" y1="0" x2="1" y2=".7"><stop stopColor="#737773"/><stop offset=".33" stopColor="#333735"/><stop offset=".7" stopColor="#191c1b"/><stop offset="1" stopColor="#0d0f0e"/></linearGradient><linearGradient id="bellHandle" x1="0" x2="1"><stop stopColor="#373b38"/><stop offset=".45" stopColor="#858b81"/><stop offset="1" stopColor="#252926"/></linearGradient><radialGradient id="bellGlow"><stop stopColor="#f8783d" stopOpacity=".18"/><stop offset="1" stopColor="#f8783d" stopOpacity="0"/></radialGradient></defs><circle cx="150" cy="156" r="130" fill="url(#bellGlow)"/><ellipse cx="156" cy="264" rx="90" ry="12" fill="#080b09" opacity=".6"/><path d="M105 109C46 9 250 8 193 109" fill="none" stroke="#0c0f0d" strokeWidth="28"/><path d="M105 105C56 20 238 16 190 105" fill="none" stroke="url(#bellHandle)" strokeWidth="19"/><path d="M100 91q48-12 97 0c4 23 20 33 35 55 35 58 7 115-78 115-91 0-116-62-80-117 15-23 23-30 26-53Z" fill="url(#bellBody)" stroke="#4d534c" strokeWidth="1"/><path d="M104 98q45-11 88-1" fill="none" stroke="#a1a79a" strokeOpacity=".5" strokeWidth="2"/><circle cx="152" cy="179" r="36" fill="#151a16" stroke="#555c50" strokeOpacity=".55"/><text x="152" y="187" textAnchor="middle" fill="#b3baa9" fontFamily="sans-serif" fontSize="25" fontWeight="700">ABC</text><path d="M80 173q-18 46 24 65" fill="none" stroke="#a2a692" strokeOpacity=".12" strokeWidth="3"/></svg>;
}

function Modal({ title, children, onClose }) {
  const ref = useRef(null);
  useEffect(() => { const dialog = ref.current; dialog.showModal(); return () => dialog.close(); }, []);
  return <dialog className="modal" ref={ref} aria-labelledby="modal-title" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="modal-head"><h2 id="modal-title">{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><Icon name="close" /></button></div>{children}
  </dialog>;
}


export {Icon,Bell,Modal};
