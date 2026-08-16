interface MaveliCharacterProps {
  state?: 'idle' | 'happy' | 'excited' | 'thinking'
  size?: number
  className?: string
}

export default function MaveliCharacter({ state = 'idle', size = 120, className = '' }: MaveliCharacterProps) {
  const animClass =
    state === 'happy'   ? 'animate-maveli-happy' :
    state === 'excited' ? 'animate-maveli-excited' :
    state === 'thinking'? 'animate-maveli-thinking' :
    'animate-float'

  return (
    <div className={`${animClass} ${className} inline-block`} style={{ width: size, height: size * 1.5 }}>
      <svg viewBox="0 0 120 180" width={size} height={size * 1.5} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="faceGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#e8b07a" />
            <stop offset="100%" stopColor="#c4845a" />
          </radialGradient>
          <radialGradient id="bodyGrad" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#d44050" />
            <stop offset="100%" stopColor="#a02030" />
          </radialGradient>
          <radialGradient id="crownGrad" cx="50%" cy="20%" r="80%">
            <stop offset="0%" stopColor="#f5d76e" />
            <stop offset="100%" stopColor="#b8960c" />
          </radialGradient>
        </defs>

        {/* Crown base */}
        <rect x="32" y="52" width="56" height="10" rx="3" fill="url(#crownGrad)" />

        {/* Crown points */}
        <polygon points="36,52 42,30 48,52" fill="url(#crownGrad)" />
        <polygon points="56,52 60,22 64,52" fill="url(#crownGrad)" />
        <polygon points="72,52 78,30 84,52" fill="url(#crownGrad)" />

        {/* Crown gems */}
        <circle cx="42" cy="32" r="5" fill="#c41e3a" />
        <circle cx="42" cy="32" r="3" fill="#ff6080" />
        <circle cx="60" cy="24" r="6" fill="#1a8a1a" />
        <circle cx="60" cy="24" r="3.5" fill="#40cc40" />
        <circle cx="78" cy="32" r="5" fill="#c41e3a" />
        <circle cx="78" cy="32" r="3" fill="#ff6080" />

        {/* Crown accent dots */}
        <circle cx="36" cy="54" r="3" fill="#d4af37" />
        <circle cx="84" cy="54" r="3" fill="#d4af37" />

        {/* Head */}
        <ellipse cx="60" cy="88" rx="32" ry="30" fill="url(#faceGrad)" />

        {/* Ears */}
        <ellipse cx="28" cy="88" rx="7" ry="9" fill="#c4845a" />
        <ellipse cx="92" cy="88" rx="7" ry="9" fill="#c4845a" />
        <ellipse cx="28" cy="88" rx="4" ry="5.5" fill="#d4905e" />
        <ellipse cx="92" cy="88" rx="4" ry="5.5" fill="#d4905e" />

        {/* Eyes */}
        <ellipse cx="47" cy="82" rx="8" ry="8.5" fill="white" />
        <ellipse cx="73" cy="82" rx="8" ry="8.5" fill="white" />

        {/* Irises */}
        <circle cx="48" cy="83" r="5.5" fill="#3a2010" />
        <circle cx="74" cy="83" r="5.5" fill="#3a2010" />

        {/* Pupils */}
        <circle cx="49" cy="84" r="3.5" fill="#1a0808" />
        <circle cx="75" cy="84" r="3.5" fill="#1a0808" />

        {/* Eye shine */}
        <circle cx="50.5" cy="81.5" r="1.5" fill="white" />
        <circle cx="76.5" cy="81.5" r="1.5" fill="white" />

        {/* Happy eyebrows */}
        {state !== 'thinking' ? (
          <>
            <path d="M 40,74 Q 47,70 54,74" fill="none" stroke="#5a2010" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 66,74 Q 73,70 80,74" fill="none" stroke="#5a2010" strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M 40,74 Q 47,72 54,74" fill="none" stroke="#5a2010" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 66,72 Q 73,74 80,72" fill="none" stroke="#5a2010" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}

        {/* Nose */}
        <ellipse cx="60" cy="91" rx="5" ry="4" fill="#b87050" />
        <circle cx="57.5" cy="91.5" r="1.5" fill="#a05a3a" />
        <circle cx="62.5" cy="91.5" r="1.5" fill="#a05a3a" />

        {/* Moustache */}
        <path d="M 48,97 Q 54,100 60,98 Q 66,100 72,97" fill="#3a1808" />

        {/* Smile */}
        {state === 'happy' || state === 'excited' ? (
          <path d="M 46,103 Q 60,114 74,103" fill="#7a2010" stroke="none" />
        ) : (
          <path d="M 49,103 Q 60,110 71,103" fill="none" stroke="#7a2010" strokeWidth="2.5" strokeLinecap="round" />
        )}

        {/* Teeth on happy */}
        {(state === 'happy' || state === 'excited') && (
          <path d="M 50,104 Q 60,110 70,104 L 70,108 Q 60,115 50,108 Z" fill="white" />
        )}

        {/* Beard */}
        <ellipse cx="60" cy="112" rx="22" ry="9" fill="#3a1808" opacity="0.65" />

        {/* Body */}
        <rect x="32" y="116" width="56" height="42" rx="8" fill="url(#bodyGrad)" />

        {/* Gold collar/border on body */}
        <rect x="32" y="116" width="56" height="10" rx="0" fill="#d4af37" />
        <rect x="32" y="116" width="56" height="10" rx="4" fill="none" stroke="#b8960c" strokeWidth="1" />

        {/* Body pattern */}
        <line x1="32" y1="132" x2="88" y2="132" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <line x1="32" y1="142" x2="88" y2="142" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

        {/* Belt/dhoti top */}
        <rect x="30" y="150" width="60" height="8" rx="4" fill="#d4af37" />

        {/* Dhoti (white lower cloth) */}
        <rect x="34" y="156" width="52" height="18" rx="4" fill="#f5f1de" />
        <line x1="60" y1="156" x2="60" y2="174" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" />

        {/* Arms */}
        {state === 'happy' || state === 'excited' ? (
          <>
            {/* Arms raised */}
            <ellipse cx="18" cy="110" rx="9" ry="20" fill="#c4845a" transform="rotate(-40, 18, 110)" />
            <ellipse cx="102" cy="110" rx="9" ry="20" fill="#c4845a" transform="rotate(40, 102, 110)" />
            {/* Hands */}
            <circle cx="12" cy="96" r="7" fill="#c4845a" />
            <circle cx="108" cy="96" r="7" fill="#c4845a" />
          </>
        ) : state === 'thinking' ? (
          <>
            {/* One arm raised to chin */}
            <ellipse cx="20" cy="130" rx="9" ry="16" fill="#c4845a" transform="rotate(10, 20, 130)" />
            <ellipse cx="100" cy="118" rx="9" ry="18" fill="#c4845a" transform="rotate(-35, 100, 118)" />
            <circle cx="18" cy="142" r="7" fill="#c4845a" />
            <circle cx="108" cy="105" r="7" fill="#c4845a" />
          </>
        ) : (
          <>
            {/* Arms at sides */}
            <ellipse cx="20" cy="130" rx="9" ry="18" fill="#c4845a" transform="rotate(8, 20, 130)" />
            <ellipse cx="100" cy="130" rx="9" ry="18" fill="#c4845a" transform="rotate(-8, 100, 130)" />
            <circle cx="18" cy="146" r="7" fill="#c4845a" />
            <circle cx="102" cy="146" r="7" fill="#c4845a" />
          </>
        )}

        {/* Feet */}
        <ellipse cx="46" cy="176" rx="14" ry="6" fill="#8b5a30" />
        <ellipse cx="74" cy="176" rx="14" ry="6" fill="#8b5a30" />
        <ellipse cx="46" cy="175" rx="10" ry="4" fill="#a06a40" />
        <ellipse cx="74" cy="175" rx="10" ry="4" fill="#a06a40" />

        {/* Shadow under feet */}
        <ellipse cx="60" cy="179" rx="28" ry="4" fill="rgba(0,0,0,0.18)" />
      </svg>
    </div>
  )
}
