import { DISTRICTS } from "@/lib/hk-districts";

export function HongKongDistrictsMap({
  mode,
}: {
  mode: "blank" | "labeled";
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={mode === "blank" ? "香港18區無字地圖" : "香港18區提示地圖"}
      className="map-image block h-auto w-full select-none"
    >
      <rect width="100" height="100" fill="#9fd4ea" />
      <rect width="100" height="100" fill="url(#ocean-grid)" />

      <defs>
        <pattern id="ocean-grid" width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M 4 0 L 0 0 0 4" fill="none" stroke="#7ec4de" strokeWidth="0.12" />
        </pattern>
      </defs>

      <path
        d="M28 9 C40 5 54 5 64 9 C74 13 84 22 86 34 C87 44 82 51 74 54 C69 49 63 45 58 47 C52 44 46 42 40 45 C32 42 24 44 18 47 C15 40 15 30 19 22 C22 14 24 11 28 9 Z"
        fill="#d7e0ea"
        stroke="#334155"
        strokeWidth="0.45"
      />
      <path
        d="M18 46 C22 43 30 43 36 46 C40 50 38 54 32 56 C24 56 18 54 16 50 C16 48 16 47 18 46 Z"
        fill="#d7e0ea"
        stroke="#334155"
        strokeWidth="0.4"
      />
      <path
        d="M70 48 C78 46 86 48 88 54 C86 60 80 62 74 58 C70 55 68 51 70 48 Z"
        fill="#d7e0ea"
        stroke="#334155"
        strokeWidth="0.4"
      />
      <path
        d="M48 49 L66 50 L69 56 L66 63 L54 64 L49 59 Z"
        fill="#cbd5e1"
        stroke="#1e293b"
        strokeWidth="0.4"
      />
      <path
        d="M47 67 L68 66 L67 76 L60 81 L50 80 L46 73 Z"
        fill="#cbd5e1"
        stroke="#1e293b"
        strokeWidth="0.4"
      />
      <path
        d="M14 63 C24 61 36 64 41 70 C42 76 36 82 24 83 C14 80 10 73 14 63 Z"
        fill="#d7e0ea"
        stroke="#334155"
        strokeWidth="0.4"
      />
      <ellipse cx="44" cy="84" rx="2.4" ry="1.5" fill="#d7e0ea" stroke="#334155" strokeWidth="0.3" />
      <ellipse cx="32" cy="86" rx="1.8" ry="1.1" fill="#d7e0ea" stroke="#334155" strokeWidth="0.3" />

      <text
        x="8"
        y="8"
        fill="#0f172a"
        fontSize="2.4"
        fontWeight="700"
        fontFamily="var(--font-sans), sans-serif"
      >
        香港
      </text>
      <text
        x="8"
        y="11.2"
        fill="#334155"
        fontSize="1.8"
        fontFamily="var(--font-display), sans-serif"
      >
        18 DISTRICTS
      </text>

      {DISTRICTS.map((district) =>
        mode === "blank" ? (
          <g key={district.id}>
            <circle
              cx={district.x}
              cy={district.y}
              r="2.55"
              fill="#0f172a"
              stroke="#f8fafc"
              strokeWidth="0.28"
            />
            <text
              x={district.x}
              y={district.y + 0.75}
              textAnchor="middle"
              fill="#fff7ed"
              fontSize="2.1"
              fontWeight="700"
              fontFamily="var(--font-display), sans-serif"
            >
              {district.number}
            </text>
          </g>
        ) : (
          <g key={district.id}>
            <rect
              x={district.x - 5.6}
              y={district.y - 1.7}
              width="11.2"
              height="3.4"
              rx="0.8"
              fill="#0f172a"
              opacity="0.86"
            />
            <text
              x={district.x}
              y={district.y + 0.7}
              textAnchor="middle"
              fill="#fff7ed"
              fontSize="1.7"
              fontWeight="700"
              fontFamily="var(--font-sans), sans-serif"
            >
              {district.number} {district.shortName}
            </text>
          </g>
        ),
      )}
    </svg>
  );
}
