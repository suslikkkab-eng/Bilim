// src/components/duel/DuelCharacter.jsx
import { motion, AnimatePresence } from 'framer-motion'

// ── Particle burst ─────────────────────────────────────────────────────────
function Particles({ type }) {
  const colors = type === 'hit'
    ? ['#ff3b3b', '#ff8c00', '#ffd700', '#ff6b6b']
    : ['#00f5a0', '#00d9f5', '#7c3aed', '#a78bfa']
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 20 }}>
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * 360
        const dist = 50 + Math.random() * 40
        const dx = Math.cos((angle * Math.PI) / 180) * dist
        const dy = Math.sin((angle * Math.PI) / 180) * dist
        return (
          <motion.div
            key={i}
            initial={{ x: '50%', y: '30%', opacity: 1, scale: 1.5 }}
            animate={{ x: `calc(50% + ${dx}px)`, y: `calc(30% + ${dy}px)`, opacity: 0, scale: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut', delay: i * 0.02 }}
            className="absolute rounded-full"
            style={{ width: 6 + Math.random() * 6, height: 6 + Math.random() * 6, background: colors[i % colors.length] }}
          />
        )
      })}
    </div>
  )
}

// ── HERO CHARACTER (Player — left side) ────────────────────────────────────
// Sleek sci-fi warrior with glowing armor
function HeroSVG({ state }) {
  const isVictory = state === 'victory'
  const isDamaged = state === 'damaged' || state === 'wrong'
  const isCorrect = state === 'correct'
  const isDefeat = state === 'defeat'
  const isIdle = state === 'idle'

  return (
    <motion.svg
      viewBox="0 0 140 220"
      width="120"
      height="200"
      animate={
        isDamaged ? { x: [0, -18, 14, -10, 5, 0], filter: ['drop-shadow(0 0 8px #ff3b3b)', 'drop-shadow(0 0 20px #ff3b3b)', 'drop-shadow(0 0 8px #6366f1)'] } :
        isCorrect ? { y: [0, -12, 0], filter: ['drop-shadow(0 0 12px #00f5a0)', 'drop-shadow(0 0 25px #00f5a0)', 'drop-shadow(0 0 12px #00f5a0)'] } :
        isVictory ? { y: [0, -18, -8, -15, 0] } :
        isDefeat ? { rotate: [0, -8, 5, -3, 0], y: [0, 6, 0] } :
        {}
      }
      transition={{ duration: isDamaged ? 0.4 : 0.5 }}
      style={{ filter: isVictory ? 'drop-shadow(0 0 20px #fbbf24)' : isIdle ? 'drop-shadow(0 0 10px rgba(99,102,241,0.5))' : undefined, overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="heroArmor" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="heroGlow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="heroBlade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e0e7ff" />
          <stop offset="50%" stopColor="#a5b4fc" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="70" cy="215" rx="32" ry="5" fill="rgba(99,102,241,0.25)" />

      {/* Energy aura when correct/victory */}
      {(isCorrect || isVictory) && (
        <motion.ellipse cx="70" cy="110" rx="55" ry="90"
          fill="none" stroke="rgba(0,245,160,0.15)" strokeWidth="8"
          animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.8, repeat: isVictory ? Infinity : 1 }} />
      )}

      {/* ── BOOTS ── */}
      <rect x="45" y="175" width="20" height="30" rx="6" fill="#1e1b4b" />
      <rect x="75" y="175" width="20" height="30" rx="6" fill="#1e1b4b" />
      {/* Boot armor plates */}
      <rect x="43" y="185" width="24" height="8" rx="3" fill="#312e81" />
      <rect x="73" y="185" width="24" height="8" rx="3" fill="#312e81" />
      <rect x="44" y="198" width="22" height="7" rx="3" fill="#4338ca" />
      <rect x="74" y="198" width="22" height="7" rx="3" fill="#4338ca" />

      {/* ── LEGS ── */}
      <rect x="47" y="145" width="22" height="34" rx="8" fill="#1e1b4b" />
      <rect x="71" y="145" width="22" height="34" rx="8" fill="#1e1b4b" />
      {/* Leg armor */}
      <rect x="45" y="148" width="26" height="10" rx="4" fill="#3730a3" />
      <rect x="69" y="148" width="26" height="10" rx="4" fill="#3730a3" />
      {/* Knee gems */}
      <circle cx="58" cy="163" r="5" fill="#6366f1" stroke="#a5b4fc" strokeWidth="1" />
      <circle cx="82" cy="163" r="5" fill="#6366f1" stroke="#a5b4fc" strokeWidth="1" />
      <motion.circle cx="58" cy="163" r="3"
        fill="#818cf8"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity }} />
      <motion.circle cx="82" cy="163" r="3"
        fill="#818cf8"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} />

      {/* ── WAIST / BELT ── */}
      <rect x="44" y="138" width="52" height="12" rx="5" fill="#312e81" />
      <rect x="62" y="137" width="16" height="14" rx="4" fill="#4f46e5" />
      {/* Belt gem */}
      <motion.rect x="65" y="140" width="10" height="8" rx="2"
        fill="#a5b4fc"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }} />

      {/* ── TORSO / CHEST ARMOR ── */}
      <rect x="38" y="88" width="64" height="55" rx="14" fill="url(#heroArmor)" />
      {/* Chest plate */}
      <path d="M50 92 L90 92 L94 130 L46 130 Z" fill="#3730a3" opacity="0.6" />
      {/* Chest center line */}
      <line x1="70" y1="92" x2="70" y2="135" stroke="#818cf8" strokeWidth="1" opacity="0.5" />
      {/* Shoulder guards */}
      <path d="M38 92 L30 85 L38 105 Z" fill="#4338ca" />
      <path d="M102 92 L110 85 L102 105 Z" fill="#4338ca" />

      {/* Core gem */}
      <motion.circle cx="70" cy="112"
        r="8"
        fill="#6366f1"
        stroke="#a5b4fc"
        strokeWidth="1.5"
        animate={{ opacity: isDamaged ? [1, 0.2, 1] : [0.8, 1, 0.8] }}
        transition={{ duration: isDamaged ? 0.3 : 2, repeat: Infinity }} />
      <motion.circle cx="70" cy="112" r="4"
        fill="white"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }} />

      {/* ── LEFT ARM (weapon arm) ── */}
      <motion.g
        animate={isCorrect || isVictory ? { rotate: [-35, 5, -20] } : isDefeat ? { rotate: [0, 25] } : {}}
        style={{ transformOrigin: '38px 100px' }}
        transition={{ duration: 0.5 }}
      >
        <rect x="20" y="90" width="20" height="48" rx="9" fill="url(#heroArmor)" />
        {/* Arm armor stripe */}
        <rect x="18" y="100" width="24" height="6" rx="3" fill="#4338ca" />
        <rect x="18" y="118" width="24" height="6" rx="3" fill="#4338ca" />
        {/* Gauntlet */}
        <rect x="16" y="134" width="26" height="16" rx="7" fill="#312e81" stroke="#6366f1" strokeWidth="1" />
        {/* Energy sword — only visible for attack */}
        {(isCorrect || isVictory) && (
          <motion.g
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            style={{ transformOrigin: '20px 150px' }}
          >
            {/* Sword hilt */}
            <rect x="15" y="148" width="10" height="5" rx="2" fill="#fbbf24" />
            {/* Blade */}
            <motion.rect x="17" y="100" width="6" height="50" rx="3"
              fill="url(#heroBlade)"
              animate={{ opacity: [0.8, 1, 0.8], boxShadow: ['0 0 10px #818cf8', '0 0 20px #818cf8'] }}
              transition={{ duration: 0.4, repeat: Infinity }} />
            {/* Blade glow */}
            <motion.rect x="15" y="100" width="10" height="50" rx="5"
              fill="rgba(129,140,248,0.3)"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 0.4, repeat: Infinity }} />
          </motion.g>
        )}
      </motion.g>

      {/* ── RIGHT ARM (shield arm) ── */}
      <motion.g
        animate={isCorrect ? { rotate: [0, -20, 0] } : isVictory ? { rotate: [0, -30, -10, -30] } : {}}
        style={{ transformOrigin: '102px 100px' }}
        transition={{ duration: 0.6, repeat: isVictory ? Infinity : 0 }}
      >
        <rect x="100" y="90" width="20" height="48" rx="9" fill="url(#heroArmor)" />
        <rect x="98" y="100" width="24" height="6" rx="3" fill="#4338ca" />
        <rect x="98" y="118" width="24" height="6" rx="3" fill="#4338ca" />
        {/* Shield */}
        <path d="M104 132 L118 132 L120 148 L111 155 L102 148 Z"
          fill="#312e81" stroke="#6366f1" strokeWidth="1.5" />
        <motion.circle cx="111" cy="143" r="4"
          fill="#6366f1"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity }} />
      </motion.g>

      {/* ── NECK ── */}
      <rect x="60" y="74" width="20" height="18" rx="7" fill="#F4C08C" />
      {/* Neck armor collar */}
      <path d="M56 82 L84 82 L86 90 L54 90 Z" fill="#312e81" />

      {/* ── HEAD ── */}
      {/* Helmet */}
      <path d="M40 65 Q40 30 70 28 Q100 30 100 65 L98 80 Q70 90 42 80 Z"
        fill="#1e1b4b" stroke="#4338ca" strokeWidth="1.5" />
      {/* Helmet crest */}
      <path d="M60 28 Q70 10 80 28" fill="none" stroke="#6366f1" strokeWidth="3" />
      <motion.circle cx="70" cy="18" r="5"
        fill="#818cf8"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1, repeat: Infinity }} />

      {/* Face visor */}
      <path d="M48 58 L92 58 L90 74 L50 74 Z" fill="#0d0d2b" rx="6" />
      <path d="M48 58 Q70 52 92 58" fill="#1e1b4b" />

      {/* Visor glow line */}
      <motion.rect x="50" y="63" width="40" height="5" rx="2.5"
        fill={isDamaged ? '#ff3b3b' : isCorrect || isVictory ? '#00f5a0' : '#6366f1'}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: isDamaged ? 0.2 : 1.5, repeat: Infinity }} />

      {/* Eye slits */}
      <motion.rect x="52" y="61" width="14" height="4" rx="2"
        fill={isDamaged ? '#ff6b6b' : '#a5b4fc'}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity }} />
      <motion.rect x="74" y="61" width="14" height="4" rx="2"
        fill={isDamaged ? '#ff6b6b' : '#a5b4fc'}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }} />

      {/* Helmet side details */}
      <line x1="42" y1="55" x2="42" y2="72" stroke="#4338ca" strokeWidth="2" />
      <line x1="98" y1="55" x2="98" y2="72" stroke="#4338ca" strokeWidth="2" />

      {/* Victory crown effect */}
      {isVictory && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.circle
              key={i}
              cx={50 + i * 10}
              cy={15}
              r={3}
              fill={['#fbbf24', '#f59e0b', '#fbbf24', '#f59e0b', '#fbbf24'][i]}
              animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
            />
          ))}
        </>
      )}

      {/* Impact flash */}
      {isDamaged && (
        <motion.rect x="0" y="0" width="140" height="220" rx="10"
          fill="rgba(255,59,59,0.15)"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.4 }} />
      )}
    </motion.svg>
  )
}

// ── RIVAL CHARACTER (Opponent — right side, mirrored) ──────────────────────
// Dark energy mage / villain aesthetic
function RivalSVG({ state }) {
  const isVictory = state === 'victory'
  const isDamaged = state === 'damaged' || state === 'wrong'
  const isCorrect = state === 'correct'
  const isDefeat = state === 'defeat'

  return (
    <motion.svg
      viewBox="0 0 140 220"
      width="120"
      height="200"
      animate={
        isDamaged ? { x: [0, 18, -14, 10, -5, 0] } :
        isCorrect ? { y: [0, -12, 0] } :
        isVictory ? { y: [0, -18, -8, -15, 0] } :
        isDefeat ? { rotate: [0, 8, -5, 3, 0], y: [0, 6, 0] } :
        {}
      }
      transition={{ duration: isDamaged ? 0.4 : 0.5 }}
      style={{ filter: isDamaged ? 'drop-shadow(0 0 16px #ff3b3b)' : isCorrect ? 'drop-shadow(0 0 16px #a855f7)' : isVictory ? 'drop-shadow(0 0 20px #ec4899)' : 'drop-shadow(0 0 10px rgba(168,85,247,0.5))', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="rivalArmor" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c2d12" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
        <linearGradient id="rivalDark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1c1917" />
          <stop offset="100%" stopColor="#292524" />
        </linearGradient>
        <linearGradient id="orbGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="70" cy="215" rx="32" ry="5" fill="rgba(168,85,247,0.2)" />

      {/* Dark aura ring */}
      <motion.ellipse cx="70" cy="110" rx="52" ry="88"
        fill="none" stroke="rgba(168,85,247,0.1)" strokeWidth="6"
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }} />

      {/* ── BOOTS ── */}
      <rect x="45" y="175" width="20" height="30" rx="4" fill="#1c1917" />
      <rect x="75" y="175" width="20" height="30" rx="4" fill="#1c1917" />
      {/* Spike details */}
      <polygon points="45,185 48,177 51,185" fill="#7f1d1d" />
      <polygon points="75,185 78,177 81,185" fill="#7f1d1d" />
      <polygon points="89,185 92,177 95,185" fill="#7f1d1d" />
      <rect x="43" y="195" width="24" height="10" rx="2" fill="#292524" />
      <rect x="73" y="195" width="24" height="10" rx="2" fill="#292524" />

      {/* ── LEGS ── */}
      <rect x="47" y="145" width="22" height="34" rx="6" fill="#1c1917" />
      <rect x="71" y="145" width="22" height="34" rx="6" fill="#1c1917" />
      {/* Rune markings */}
      <line x1="50" y1="150" x2="66" y2="150" stroke="#9f1239" strokeWidth="1.5" />
      <line x1="58" y1="150" x2="58" y2="178" stroke="#9f1239" strokeWidth="1" />
      <line x1="74" y1="150" x2="90" y2="150" stroke="#9f1239" strokeWidth="1.5" />
      <line x1="82" y1="150" x2="82" y2="178" stroke="#9f1239" strokeWidth="1" />

      {/* ── WAIST ── */}
      <rect x="44" y="138" width="52" height="12" rx="4" fill="#292524" />
      {/* Skull belt buckle */}
      <rect x="63" y="137" width="14" height="14" rx="3" fill="#1c1917" stroke="#9f1239" strokeWidth="1" />
      <motion.circle cx="70" cy="144" r="4"
        fill="url(#orbGlow)"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }} />

      {/* ── TORSO ── */}
      <rect x="38" y="88" width="64" height="55" rx="12" fill="url(#rivalDark)" />
      {/* Chest armor pieces */}
      <path d="M50 90 L70 82 L90 90 L92 130 L48 130 Z" fill="#1a1a1a" stroke="#7f1d1d" strokeWidth="1" />
      {/* Center chest gem - dark red */}
      <motion.circle cx="70" cy="108"
        r="9"
        fill="#7f1d1d"
        stroke="#ec4899"
        strokeWidth="1.5"
        animate={{ opacity: isDamaged ? [1, 0.2, 1] : [0.7, 1, 0.7] }}
        transition={{ duration: isDamaged ? 0.3 : 2, repeat: Infinity }} />
      <motion.circle cx="70" cy="108" r="5"
        fill={isCorrect || isVictory ? '#f472b6' : '#be123c'}
        animate={{ scale: [0.8, 1.1, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity }} />
      {/* Ribcage pattern */}
      {[-12, -4, 4, 12].map((y, i) => (
        <line key={i} x1="52" y1={110 + y} x2="66" y2={110 + y} stroke="#3f3f46" strokeWidth="1" opacity="0.6" />
      ))}
      {[-12, -4, 4, 12].map((y, i) => (
        <line key={i} x1="74" y1={110 + y} x2="88" y2={110 + y} stroke="#3f3f46" strokeWidth="1" opacity="0.6" />
      ))}
      {/* Shoulder spikes */}
      <polygon points="38,90 28,80 36,100" fill="#7f1d1d" />
      <polygon points="102,90 112,80 104,100" fill="#7f1d1d" />
      <polygon points="38,82 30,72 36,88" fill="#9f1239" />
      <polygon points="102,82 110,72 104,88" fill="#9f1239" />

      {/* ── LEFT ARM ── */}
      <motion.g
        animate={isCorrect || isVictory ? { rotate: [-30, 8, -20] } : isDefeat ? { rotate: [0, 20] } : {}}
        style={{ transformOrigin: '38px 100px' }}
        transition={{ duration: 0.5 }}
      >
        <rect x="20" y="90" width="20" height="48" rx="8" fill="#1c1917" stroke="#7f1d1d" strokeWidth="1" />
        <rect x="18" y="104" width="24" height="5" rx="2" fill="#7f1d1d" />
        <rect x="18" y="120" width="24" height="5" rx="2" fill="#7f1d1d" />
        {/* Dark energy orb */}
        <motion.circle cx="26" cy="145" r="10"
          fill="#1c1917" stroke="#a855f7" strokeWidth="1.5"
          animate={{ scale: isCorrect ? [1, 1.4, 1] : [1, 1.1, 1] }}
          transition={{ duration: 0.8, repeat: isCorrect ? 2 : Infinity }} />
        <motion.circle cx="26" cy="145" r="6"
          fill="url(#orbGlow)"
          animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity }} />
        {/* Energy tendrils when attacking */}
        {(isCorrect || isVictory) && (
          <>
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <motion.line key={i}
                x1="26" y1="145"
                x2={26 + Math.cos(angle * Math.PI / 180) * 20}
                y2={145 + Math.sin(angle * Math.PI / 180) * 20}
                stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round"
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                transition={{ duration: 0.5, repeat: 3, delay: i * 0.05 }} />
            ))}
          </>
        )}
      </motion.g>

      {/* ── RIGHT ARM ── */}
      <motion.g
        animate={isCorrect ? { rotate: [0, -20, 0] } : isVictory ? { rotate: [0, -25, -10, -25] } : {}}
        style={{ transformOrigin: '102px 100px' }}
        transition={{ duration: 0.6, repeat: isVictory ? Infinity : 0 }}
      >
        <rect x="100" y="90" width="20" height="48" rx="8" fill="#1c1917" stroke="#7f1d1d" strokeWidth="1" />
        <rect x="98" y="104" width="24" height="5" rx="2" fill="#7f1d1d" />
        <rect x="98" y="120" width="24" height="5" rx="2" fill="#7f1d1d" />
        {/* Claw gauntlet */}
        <path d="M100 134 L120 134 L122 152 L110 160 L98 152 Z"
          fill="#1c1917" stroke="#9f1239" strokeWidth="1.5" />
        {/* Claws */}
        <polygon points="100,136 96,128 102,136" fill="#be123c" />
        <polygon points="111,134 108,124 113,134" fill="#be123c" />
        <polygon points="122,136 124,127 118,136" fill="#be123c" />
      </motion.g>

      {/* ── NECK ── */}
      <rect x="60" y="74" width="20" height="20" rx="6" fill="#292524" />

      {/* ── HEAD ── */}
      {/* Skull-like helmet */}
      <path d="M42 68 Q42 30 70 26 Q98 30 98 68 L96 80 Q70 90 44 80 Z"
        fill="#1c1917" stroke="#7f1d1d" strokeWidth="1.5" />
      {/* Horns */}
      <path d="M50 36 Q42 15 46 8 Q52 18 54 32" fill="#292524" stroke="#7f1d1d" strokeWidth="1" />
      <path d="M90 36 Q98 15 94 8 Q88 18 86 32" fill="#292524" stroke="#7f1d1d" strokeWidth="1" />
      {/* Horn glow tips */}
      <motion.circle cx="46" cy="9" r="4"
        fill="#ec4899"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1, repeat: Infinity }} />
      <motion.circle cx="94" cy="9" r="4"
        fill="#ec4899"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.5 }} />

      {/* Mask / visor */}
      <path d="M48 58 L92 58 L90 76 L50 76 Z" fill="#0d0911" />
      {/* Eye sockets */}
      <motion.path d="M50 61 Q58 56 66 61 L64 70 Q58 73 52 70 Z"
        fill={isDamaged ? '#ff3b3b' : isCorrect || isVictory ? '#f472b6' : '#a855f7'}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: isDamaged ? 0.2 : 1.8, repeat: Infinity }} />
      <motion.path d="M74 61 Q82 56 90 61 L88 70 Q82 73 76 70 Z"
        fill={isDamaged ? '#ff3b3b' : isCorrect || isVictory ? '#f472b6' : '#a855f7'}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: isDamaged ? 0.2 : 1.8, repeat: Infinity, delay: 0.4 }} />
      {/* Nose/teeth decoration */}
      <line x1="68" y1="68" x2="72" y2="68" stroke="#7f1d1d" strokeWidth="1" />
      {[0,4,8,12].map(x => (
        <rect key={x} x={54+x} y="72" width="3" height="4" rx="1" fill="#374151" />
      ))}

      {/* Victory / defeat effects */}
      {isVictory && (
        <>
          <motion.circle cx="70" cy="5" r="8"
            fill="url(#orbGlow)"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.6, repeat: Infinity }} />
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <motion.circle key={i}
              cx={70 + Math.cos(angle * Math.PI / 180) * 20}
              cy={5 + Math.sin(angle * Math.PI / 180) * 20}
              r={3}
              fill="#ec4899"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
          ))}
        </>
      )}

      {/* Damage flash */}
      {isDamaged && (
        <motion.rect x="0" y="0" width="140" height="220" rx="10"
          fill="rgba(255,59,59,0.12)"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.4 }} />
      )}
    </motion.svg>
  )
}

// ── AI Judge (center) ──────────────────────────────────────────────────────
export function JudgeSVG({ message }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <AnimatePresence>
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 10, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.88 }}
            className="relative max-w-[160px] text-center px-3 py-2 rounded-2xl text-[11px] font-bold leading-snug"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.25))',
              border: '1px solid rgba(168,85,247,0.5)',
              color: '#e9d5ff',
              backdropFilter: 'blur(8px)',
            }}
          >
            {message}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-2.5 w-3 h-3">
              <div className="w-3 h-3 rotate-45 bg-purple-950/60 border-b border-r border-purple-500/40 mx-auto" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Robot judge */}
      <motion.svg
        viewBox="0 0 90 140"
        width="72"
        height="112"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ filter: 'drop-shadow(0 0 18px rgba(168,85,247,0.7))' }}
      >
        <defs>
          <linearGradient id="judgeBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#312e81" />
          </linearGradient>
        </defs>

        <ellipse cx="45" cy="137" rx="28" ry="4" fill="rgba(168,85,247,0.2)" />

        {/* Legs */}
        <rect x="28" y="108" width="13" height="20" rx="5" fill="#1e1b4b" stroke="rgba(168,85,247,0.4)" strokeWidth="1" />
        <rect x="49" y="108" width="13" height="20" rx="5" fill="#1e1b4b" stroke="rgba(168,85,247,0.4)" strokeWidth="1" />
        <ellipse cx="34" cy="128" rx="9" ry="5" fill="#312e81" />
        <ellipse cx="55" cy="128" rx="9" ry="5" fill="#312e81" />

        {/* Body */}
        <rect x="18" y="55" width="54" height="58" rx="12" fill="url(#judgeBody)" stroke="rgba(168,85,247,0.5)" strokeWidth="1.5" />
        {/* Body details */}
        <rect x="28" y="68" width="34" height="4" rx="2" fill="rgba(168,85,247,0.4)" />
        <rect x="28" y="76" width="24" height="4" rx="2" fill="rgba(99,102,241,0.4)" />
        <rect x="28" y="84" width="29" height="4" rx="2" fill="rgba(168,85,247,0.3)" />
        <motion.circle cx="45" cy="98" r="7" fill="rgba(168,85,247,0.8)"
          animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} />
        <motion.circle cx="45" cy="98" r="3.5" fill="white"
          animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} />

        {/* Arms */}
        <rect x="4" y="58" width="15" height="36" rx="6" fill="#1e1b4b" stroke="rgba(168,85,247,0.35)" strokeWidth="1" />
        <rect x="71" y="58" width="15" height="36" rx="6" fill="#1e1b4b" stroke="rgba(168,85,247,0.35)" strokeWidth="1" />
        <ellipse cx="11" cy="96" rx="8" ry="8" fill="#312e81" stroke="rgba(168,85,247,0.35)" strokeWidth="1" />
        <ellipse cx="79" cy="96" rx="8" ry="8" fill="#312e81" stroke="rgba(168,85,247,0.35)" strokeWidth="1" />

        {/* Head */}
        <rect x="14" y="8" width="62" height="52" rx="16" fill="#1e1b4b" stroke="rgba(168,85,247,0.6)" strokeWidth="1.5" />
        {/* Screen face */}
        <rect x="20" y="14" width="50" height="36" rx="10" fill="#080818" />
        {/* Eyes */}
        <motion.rect x="24" y="22" width="14" height="9" rx="4" fill="rgba(99,102,241,0.9)"
          animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }} />
        <motion.rect x="52" y="22" width="14" height="9" rx="4" fill="rgba(99,102,241,0.9)"
          animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity, delay: 0.4 }} />
        {/* Scanning line */}
        <rect x="24" y="36" width="36" height="6" rx="3" fill="rgba(168,85,247,0.15)" />
        <motion.rect x="24" y="36" width="12" height="6" rx="3" fill="rgba(168,85,247,0.9)"
          animate={{ x: [24, 48, 24] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }} />

        {/* Antenna */}
        <line x1="45" y1="8" x2="45" y2="0" stroke="rgba(168,85,247,0.7)" strokeWidth="2.5" />
        <motion.circle cx="45" cy="0" r="4" fill="#a855f7"
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 0.9, repeat: Infinity }} />

        {/* Crown */}
        <path d="M20 10 L27 0 L35 10 L45 2 L55 10 L63 0 L70 10" fill="#4f46e5" stroke="rgba(168,85,247,0.7)" strokeWidth="1" />
      </motion.svg>

      <p className="text-[9px] text-purple-400 font-black tracking-widest uppercase">ЖС Төреші</p>
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────────────────
export default function DuelCharacter({ name, state, hp, side, flipped }) {
  const isDamaged = state === 'damaged' || state === 'wrong'
  const isCorrect = state === 'correct'
  const isVictory = state === 'victory'

  return (
    <div className={`flex flex-col items-center gap-1.5 ${flipped ? 'scale-x-[-1]' : ''}`} style={{ position: 'relative' }}>
      <AnimatePresence>
        {isDamaged && <Particles key="hit" type="hit" />}
        {isCorrect && <Particles key="correct" type="correct" />}
      </AnimatePresence>

      {/* Name tag */}
      <div className={`${flipped ? 'scale-x-[-1]' : ''} px-3 py-0.5 rounded-full text-xs font-bold`}
        style={{
          background: flipped ? 'rgba(168,85,247,0.2)' : 'rgba(99,102,241,0.2)',
          border: `1px solid ${flipped ? 'rgba(168,85,247,0.4)' : 'rgba(99,102,241,0.4)'}`,
          color: flipped ? '#e9d5ff' : '#c7d2fe'
        }}>
        {name}
      </div>

      {/* Character */}
      {flipped ? <RivalSVG state={state} /> : <HeroSVG state={state} />}

      <AnimatePresence>
        {isVictory && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`${flipped ? 'scale-x-[-1]' : ''} font-black text-xs`}
            style={{ color: '#fbbf24', textShadow: '0 0 12px rgba(251,191,36,0.8)' }}
          >
            🏆 ЖЕҢІС!
          </motion.div>
        )}
        {state === 'defeat' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`${flipped ? 'scale-x-[-1]' : ''} text-red-400 font-black text-xs`}
          >
            💀 Жеңіліс
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}