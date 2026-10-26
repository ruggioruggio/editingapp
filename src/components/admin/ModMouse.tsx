/**
 * Squeak in versione "moderatore Discord": ciccione sulla sedia da gaming,
 * barba lunga a chiazze, cappello, cuffie, briciole ovunque e un pacchetto di
 * patatine rovesciato per terra. Mangia con una mano e banna con l'altra.
 */
export function ModMouse({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 260" className={className} role="img" aria-label="Squeak moderatore che mangia patatine e banna utenti">
      <style>{`
        .mm-belly{transform-origin:150px 200px;animation:mm-jiggle .45s ease-in-out infinite alternate}
        .mm-arm{transform-origin:112px 150px;animation:mm-eat 2.6s ease-in-out infinite}
        .mm-type{transform-origin:190px 150px;animation:mm-type .18s steps(2) infinite}
        .mm-jaw{transform-origin:150px 104px;animation:mm-chew .3s ease-in-out infinite alternate}
        .mm-beard path{transform-origin:150px 100px;animation:mm-sway 3s ease-in-out infinite alternate}
        .mm-beard path:nth-child(2n){animation-duration:2.3s}
        .mm-crumb{animation:mm-fall 1.6s linear infinite}
        .mm-crumb:nth-child(2){animation-delay:.5s}.mm-crumb:nth-child(3){animation-delay:1s}.mm-crumb:nth-child(4){animation-delay:1.3s}
        .mm-chat{animation:mm-scroll 6s linear infinite}
        .mm-rgb{animation:mm-hue 3s linear infinite}
        .mm-ban{transform-origin:328px 100px;animation:mm-stamp 3s ease-out infinite}
        .mm-eye{transform-origin:center;transform-box:fill-box;animation:mm-blink 4s infinite}
        @keyframes mm-jiggle{to{transform:scale(1.025,.975)}}
        @keyframes mm-eat{0%,15%{transform:rotate(0deg)}45%,60%{transform:rotate(176deg)}85%,100%{transform:rotate(0deg)}}
        @keyframes mm-type{to{transform:translateY(-2px)}}
        @keyframes mm-chew{to{transform:translateY(3px) scaleY(1.15)}}
        @keyframes mm-sway{from{transform:rotate(-2.5deg)}to{transform:rotate(2.5deg)}}
        @keyframes mm-fall{0%{transform:translateY(0);opacity:1}100%{transform:translateY(120px);opacity:0}}
        @keyframes mm-scroll{from{transform:translateY(0)}to{transform:translateY(-60px)}}
        @keyframes mm-hue{to{filter:hue-rotate(360deg)}}
        @keyframes mm-stamp{0%,55%{transform:scale(0);opacity:0}62%{transform:scale(1.35) rotate(-12deg);opacity:1}70%,92%{transform:scale(1) rotate(-12deg);opacity:1}100%{transform:scale(1) rotate(-12deg);opacity:0}}
        @keyframes mm-blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}
        @media (prefers-reduced-motion:reduce){svg *{animation:none!important}}
      `}</style>

      {/* stanza buia con la luce del monitor */}
      <rect width="400" height="260" fill="#17151f" />
      <ellipse cx="320" cy="130" rx="150" ry="110" fill="#5865f2" opacity=".12" />
      <rect y="228" width="400" height="32" fill="#231f2b" />
      <ellipse cx="70" cy="238" rx="40" ry="6" fill="#6b4a22" opacity=".5" />

      {/* sedia da gaming */}
      <rect x="92" y="40" width="116" height="175" rx="26" fill="#1c1c22" />
      <rect x="112" y="48" width="18" height="160" rx="9" fill="#c4302b" />
      <rect x="170" y="48" width="18" height="160" rx="9" fill="#c4302b" />
      <rect x="140" y="214" width="20" height="14" fill="#111" />
      <path d="M110 232h80" stroke="#111" strokeWidth="6" strokeLinecap="round" />

      {/* scrivania, monitor, tastiera RGB, lattina */}
      <rect x="225" y="150" width="175" height="10" rx="3" fill="#3a2f2a" />
      <rect x="236" y="160" width="8" height="70" fill="#2b231f" />
      <rect x="385" y="160" width="8" height="70" fill="#2b231f" />
      <rect x="262" y="52" width="128" height="88" rx="6" fill="#0d0d10" />
      <rect x="266" y="56" width="120" height="78" rx="3" fill="#313338" />
      <rect x="266" y="56" width="26" height="78" fill="#2b2d31" />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx="279" cy={66 + i * 16} r="6" fill={["#5865f2", "#3ba55d", "#faa61a", "#ed4245"][i]} />
      ))}
      <rect x="320" y="140" width="12" height="10" fill="#0d0d10" />
      <svg x="294" y="58" width="92" height="74">
        <text x="2" y="9" fontSize="7" fill="#b5bac1" fontWeight="700">
          # generale
        </text>
        <g className="mm-chat">
          {[
            ["xX_pro_Xx", "chi mi regala il pro?", "#f2f3f5"],
            ["Squeak (mod)", "🔨 bannato.", "#ed4245"],
            ["noob99", "spam spam spam", "#f2f3f5"],
            ["Squeak (mod)", "🔨 bannato.", "#ed4245"],
            ["edit_king", "ciao a tutti!", "#f2f3f5"],
            ["Squeak (mod)", "🔨 per sicurezza.", "#ed4245"],
            ["xX_pro_Xx", "ma perché?!", "#f2f3f5"],
            ["Squeak (mod)", "🔨 bannato.", "#ed4245"],
          ].map(([u, m, c], i) => (
            <g key={i} transform={`translate(2 ${20 + i * 15})`}>
              <text fontSize="6" fill={u.startsWith("Squeak") ? "#5865f2" : "#80848e"} fontWeight="700">
                {u}
              </text>
              <text y="7" fontSize="6" fill={c}>
                {m}
              </text>
            </g>
          ))}
        </g>
      </svg>
      <g className="mm-ban">
        <rect x="296" y="88" width="64" height="24" rx="4" fill="none" stroke="#ed4245" strokeWidth="3" />
        <text x="328" y="106" textAnchor="middle" fontSize="15" fontWeight="900" fill="#ed4245">
          BAN
        </text>
      </g>
      <rect x="240" y="142" width="80" height="9" rx="2" fill="#222" />
      <rect x="243" y="144" width="74" height="5" rx="1" className="mm-rgb" fill="url(#mm-rainbow)" />
      <defs>
        <linearGradient id="mm-rainbow">
          <stop offset="0" stopColor="#ff4d4d" />
          <stop offset=".33" stopColor="#4dff88" />
          <stop offset=".66" stopColor="#4d7dff" />
          <stop offset="1" stopColor="#ff4dd2" />
        </linearGradient>
      </defs>
      <rect x="346" y="124" width="14" height="26" rx="3" fill="#2fbf5a" />
      <rect x="346" y="130" width="14" height="6" fill="#111" />
      <text x="353" y="135" textAnchor="middle" fontSize="4" fill="#2fbf5a" fontWeight="900">
        TURBO
      </text>

      {/* pacchetto di patatine rovesciato per terra */}
      <g transform="rotate(-24 62 210)">
        <path d="M36 186 L88 184 L92 232 L32 234 Z" fill="#f2c230" />
        <path d="M36 186 L88 184 L86 192 L38 194 Z" fill="#d93a2b" />
        <text x="62" y="216" textAnchor="middle" fontSize="8" fontWeight="900" fill="#d93a2b">
          PATATINE
        </text>
      </g>
      {[
        [90, 236],
        [104, 232],
        [80, 240],
        [116, 238],
        [30, 236],
      ].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="5" ry="3" fill="#e9b04a" transform={`rotate(${i * 37} ${x} ${y})`} />
      ))}

      {/* corpo */}
      <g className="mm-belly">
        <ellipse cx="150" cy="172" rx="66" ry="58" fill="#8f97a6" />
        {/* canottiera macchiata */}
        <path d="M100 140 Q150 128 200 140 L206 200 Q150 226 94 200 Z" fill="#e8e4d8" />
        <ellipse cx="128" cy="168" rx="9" ry="6" fill="#c9a26a" opacity=".7" />
        <ellipse cx="172" cy="186" rx="12" ry="7" fill="#b9874c" opacity=".55" />
        <ellipse cx="150" cy="150" rx="6" ry="4" fill="#d18f3f" opacity=".6" />
        <ellipse cx="150" cy="206" rx="22" ry="14" fill="#8f97a6" />
        <circle cx="150" cy="206" r="2.5" fill="#6b7280" />
        {/* briciole sulla pancia */}
        {[
          [136, 156],
          [160, 162],
          [176, 150],
          [124, 186],
          [166, 196],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.8" fill="#e9b04a" />
        ))}
        {/* gambe */}
        <ellipse cx="122" cy="226" rx="16" ry="9" fill="#7d8594" />
        <ellipse cx="178" cy="226" rx="16" ry="9" fill="#7d8594" />
      </g>

      {/* braccio destro che scrive sulla tastiera */}
      <g className="mm-type">
        <path d="M196 150 Q230 150 248 142" stroke="#8f97a6" strokeWidth="14" strokeLinecap="round" fill="none" />
        <circle cx="250" cy="142" r="7" fill="#a3abb8" />
      </g>

      {/* testa */}
      <g>
        <circle cx="114" cy="62" r="17" fill="#a3abb8" />
        <circle cx="186" cy="62" r="17" fill="#a3abb8" />
        <circle cx="114" cy="62" r="10" fill="#f2b8c6" />
        <circle cx="186" cy="62" r="10" fill="#f2b8c6" />
        <ellipse cx="150" cy="88" rx="38" ry="34" fill="#a3abb8" />
        {/* occhiaie e sguardo annoiato */}
        <ellipse cx="136" cy="84" rx="8" ry="4" fill="#7b6f86" opacity=".6" />
        <ellipse cx="164" cy="84" rx="8" ry="4" fill="#7b6f86" opacity=".6" />
        <g className="mm-eye">
          <ellipse cx="136" cy="80" rx="6" ry="4" fill="#fff" />
          <circle cx="138" cy="81" r="2.6" fill="#111" />
          <path d="M129 78 Q136 74 143 78" stroke="#6b7280" strokeWidth="2.5" fill="none" />
        </g>
        <g className="mm-eye">
          <ellipse cx="164" cy="80" rx="6" ry="4" fill="#fff" />
          <circle cx="166" cy="81" r="2.6" fill="#111" />
          <path d="M157 78 Q164 74 171 78" stroke="#6b7280" strokeWidth="2.5" fill="none" />
        </g>
        <ellipse cx="150" cy="94" rx="5" ry="4" fill="#f28aa5" />
        <path d="M128 96h-16M128 100l-14 4M172 96h16M172 100l14 4" stroke="#6b7280" strokeWidth="1" />
      </g>

      {/* barba lunga a chiazze */}
      <g className="mm-beard" fill="#5a4632">
        <path d="M122 98 Q118 124 124 140 Q128 120 132 104 Z" />
        <path d="M134 106 Q130 142 138 160 Q142 132 142 108 Z" />
        <path d="M146 110 Q146 150 152 170 Q156 140 154 110 Z" />
        <path d="M160 108 Q164 136 160 156 Q170 130 168 104 Z" />
        <path d="M174 98 Q180 118 174 134 Q186 112 180 96 Z" />
        <path d="M140 118 Q138 128 141 134 Q144 126 144 118 Z" opacity=".7" />
      </g>
      {/* bocca che mastica, con briciole */}
      <g className="mm-jaw">
        <ellipse cx="150" cy="104" rx="7" ry="4" fill="#5c1f2b" />
      </g>
      {[
        [140, 108],
        [158, 110],
        [146, 114],
        [162, 104],
        [136, 102],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.6" fill="#e9b04a" />
      ))}
      <g>
        {[
          [144, 112],
          [156, 114],
          [150, 118],
          [140, 116],
        ].map(([x, y], i) => (
          <circle key={i} className="mm-crumb" cx={x} cy={y} r="1.6" fill="#e9b04a" />
        ))}
      </g>

      {/* cappello e cuffie con microfono */}
      <path d="M108 58 Q150 40 192 58 L186 66 Q150 56 114 66 Z" fill="#1a1a1a" />
      <path d="M124 54 Q126 22 150 22 Q174 22 176 54 Q150 46 124 54 Z" fill="#1a1a1a" />
      <path d="M124 50 Q150 42 176 50 L176 54 Q150 46 124 54 Z" fill="#7a1f1f" />
      <path d="M108 74 Q108 40 150 38 Q192 40 192 74" stroke="#2a2a2a" strokeWidth="5" fill="none" />
      <rect x="100" y="70" width="12" height="20" rx="5" fill="#2a2a2a" />
      <rect x="188" y="70" width="12" height="20" rx="5" fill="#2a2a2a" />
      <path d="M106 88 Q112 106 136 106" stroke="#2a2a2a" strokeWidth="3" fill="none" />
      <circle cx="137" cy="106" r="3.5" fill="#5865f2" />

      {/* braccio sinistro: dal pacchetto alla bocca */}
      <g className="mm-arm">
        <path d="M112 150 Q96 168 86 186" stroke="#8f97a6" strokeWidth="14" strokeLinecap="round" fill="none" />
        <circle cx="86" cy="188" r="7" fill="#a3abb8" />
        <ellipse cx="84" cy="182" rx="5" ry="3" fill="#e9b04a" transform="rotate(-20 84 182)" />
      </g>
    </svg>
  );
}
