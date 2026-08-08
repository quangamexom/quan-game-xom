import os
import subprocess

svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="1024" height="1024">
  <defs>
    <!-- Outer Circular Gradient Border -->
    <linearGradient id="outerRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="35%" stop-color="#22D3EE" />
      <stop offset="70%" stop-color="#E087FF" />
      <stop offset="100%" stop-color="#EC4899" />
    </linearGradient>

    <!-- Inner Dark Circuit Board Gradient -->
    <radialGradient id="circuitBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1E293B" />
      <stop offset="60%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#020617" />
    </radialGradient>

    <!-- Shield Neon Border Gradient -->
    <linearGradient id="shieldNeonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00F0FF" />
      <stop offset="50%" stop-color="#3B82F6" />
      <stop offset="100%" stop-color="#D946EF" />
    </linearGradient>

    <!-- QUÁN 3D Gold Gradient -->
    <linearGradient id="goldTextGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="25%" stop-color="#FFE17D" />
      <stop offset="65%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>

    <linearGradient id="goldTextStroke" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#78350F" />
      <stop offset="100%" stop-color="#451A03" />
    </linearGradient>

    <!-- GAME XÓM Metallic Cyan/Silver Gradient -->
    <linearGradient id="gameXomGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#E0F2FE" />
      <stop offset="40%" stop-color="#7DD3FC" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>

    <!-- Glow Filter -->
    <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- 1. Outer Gradient Ring -->
  <circle cx="150" cy="150" r="145" fill="none" stroke="url(#outerRingGrad)" stroke-width="8" />

  <!-- 2. Inner Cyber Circle Canvas -->
  <circle cx="150" cy="150" r="140" fill="url(#circuitBg)" stroke="#090D16" stroke-width="4" />

  <!-- 3. Circuit Board Lines & Nodes in Background -->
  <g stroke="#334155" stroke-width="2" opacity="0.6">
    <line x1="30" y1="100" x2="80" y2="100" />
    <line x1="80" y1="100" x2="100" y2="120" />
    <circle cx="30" cy="100" r="4" fill="#22D3EE" />

    <line x1="270" y1="100" x2="220" y2="100" />
    <line x1="220" y1="100" x2="200" y2="120" />
    <circle cx="270" cy="100" r="4" fill="#E087FF" />

    <line x1="40" y1="200" x2="90" y2="200" />
    <circle cx="40" cy="200" r="4" fill="#3B82F6" />

    <line x1="260" y1="200" x2="210" y2="200" />
    <circle cx="260" cy="200" r="4" fill="#EC4899" />
  </g>

  <!-- 4. Central Tech Shield Badge -->
  <path
    d="M 150 40 C 210 40, 240 60, 240 90 C 240 180, 200 235, 150 260 C 100 235, 60 180, 60 90 C 60 60, 90 40, 150 40 Z"
    fill="#0B0F19"
    stroke="url(#shieldNeonGrad)"
    stroke-width="6"
    filter="url(#neonGlow)"
  />

  <!-- Inner Shield Bevel Line -->
  <path
    d="M 150 52 C 200 52, 225 70, 225 95 C 225 170, 190 220, 150 242 C 110 220, 75 170, 75 95 C 75 70, 100 52, 150 52 Z"
    fill="none"
    stroke="#22D3EE"
    stroke-width="2"
    opacity="0.8"
  />

  <!-- 5. Top Character Avatar (Guy with Spiked Brown Hair & Sunglasses & Smirk) -->
  <g transform="translate(0, 5)">
    <!-- Spiky Anime Hair Background layer -->
    <path
      d="M 110 90 Q 95 60, 115 50 Q 120 25, 150 22 Q 180 25, 185 50 Q 205 60, 190 90 Q 200 100, 195 110 L 105 110 Q 100 100, 110 90 Z"
      fill="#543310"
      stroke="#090D16"
      stroke-width="3"
    />
    <!-- Spiky Hair Tufts -->
    <path
      d="M 125 45 L 140 28 L 150 42 L 165 28 L 175 48 L 190 40 L 180 65 L 195 72 L 180 90 L 120 90 L 105 72 L 120 65 L 110 40 Z"
      fill="#744210"
      stroke="#F59E0B"
      stroke-width="2"
    />
    <!-- Hair Highlights -->
    <path d="M 135 38 L 145 32 M 155 35 L 168 30" stroke="#FDE047" stroke-width="3" stroke-linecap="round" />

    <!-- Character Face -->
    <path
      d="M 115 90 C 115 90, 115 130, 150 135 C 185 130, 185 90, 185 90 Z"
      fill="#FDBA74"
      stroke="#090D16"
      stroke-width="3"
    />

    <!-- Ears -->
    <circle cx="112" cy="100" r="7" fill="#FDBA74" stroke="#090D16" stroke-width="2" />
    <circle cx="188" cy="100" r="7" fill="#FDBA74" stroke="#090D16" stroke-width="2" />

    <!-- Black Cool Sunglasses -->
    <path
      d="M 114 85 L 147 88 L 150 93 L 153 88 L 186 85 L 182 110 C 178 116, 157 118, 154 110 L 150 97 L 146 110 C 143 118, 122 116, 118 110 Z"
      fill="#090D16"
      stroke="#38BDF8"
      stroke-width="3"
    />
    <!-- Glare on Sunglasses -->
    <line x1="120" y1="90" x2="138" y2="104" stroke="#FFFFFF" stroke-width="3" opacity="0.7" stroke-linecap="round" />
    <line x1="160" y1="90" x2="178" y2="104" stroke="#FFFFFF" stroke-width="3" opacity="0.7" stroke-linecap="round" />

    <!-- Smirk & Goatee -->
    <path d="M 134 121 Q 150 130, 166 121" fill="none" stroke="#7C2D12" stroke-width="3" stroke-linecap="round" />
    <path d="M 138 122 Q 150 128, 162 122" fill="#FFFFFF" />
    <path d="M 145 130 Q 150 135, 155 130" stroke="#451A03" stroke-width="3" stroke-linecap="round" />
  </g>

  <!-- 6. Gold Ribbon Banner with "QUÁN" -->
  <g transform="translate(0, 10)">
    <!-- Banner Background Outer Ribbon -->
    <path
      d="M 60 135 L 240 135 L 255 175 L 235 185 L 65 185 L 45 175 Z"
      fill="#090D16"
      stroke="#F59E0B"
      stroke-width="4"
      filter="url(#neonGlow)"
    />
    <!-- Banner Gold Fill -->
    <path
      d="M 64 139 L 236 139 L 248 171 L 230 181 L 70 181 L 52 171 Z"
      fill="url(#goldTextGrad)"
      stroke="#FFFBEB"
      stroke-width="1.5"
    />
    <!-- "QUÁN" 3D Bold Font -->
    <text
      x="150"
      y="173"
      text-anchor="middle"
      fill="#451A03"
      font-weight="900"
      font-size="40"
      font-family="Arial Black, Impact, sans-serif"
      letter-spacing="3"
    >
      QUÁN
    </text>
    <text
      x="150"
      y="170"
      text-anchor="middle"
      fill="url(#goldTextGrad)"
      stroke="url(#goldTextStroke)"
      stroke-width="1.5"
      font-weight="900"
      font-size="40"
      font-family="Arial Black, Impact, sans-serif"
      letter-spacing="3"
    >
      QUÁN
    </text>
  </g>

  <!-- 7. Bottom Metallic Container with "GAME XÓM" -->
  <g transform="translate(0, 5)">
    <rect
      x="72"
      y="196"
      width="156"
      height="38"
      rx="6"
      fill="#070A14"
      stroke="#22D3EE"
      stroke-width="3"
      filter="url(#neonGlow)"
    />
    <text
      x="150"
      y="223"
      text-anchor="middle"
      fill="#0284C7"
      font-weight="900"
      font-size="20"
      font-family="Arial Black, sans-serif"
      letter-spacing="2"
    >
      GAME XÓM
    </text>
    <text
      x="150"
      y="221"
      text-anchor="middle"
      fill="url(#gameXomGrad)"
      font-weight="900"
      font-size="20"
      font-family="Arial Black, sans-serif"
      letter-spacing="2"
    >
      GAME XÓM
    </text>
  </g>
</svg>
'''

svg_path_public = "public/assets/logo/logo-qgx-default.svg"
png_path_public = "public/assets/logo/logo-qgx-default.png"
png_path_src = "src/assets/logo/logo-qgx-default.png"

with open(svg_path_public, "w", encoding="utf-8") as f:
    f.write(svg_content)

print(f"Saved SVG to {svg_path_public}")

# Convert SVG to PNG using ImageMagick
cmd = f"convert -density 300 -background transparent '{svg_path_public}' '{png_path_public}'"
subprocess.run(cmd, shell=True, check=True)
print(f"Converted PNG to {png_path_public}")

# Copy to src/assets/logo/ as well
cmd2 = f"cp '{png_path_public}' '{png_path_src}'"
subprocess.run(cmd2, shell=True, check=True)
print(f"Copied PNG to {png_path_src}")
