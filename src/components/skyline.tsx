const bars = [34, 52, 40, 78, 60, 100, 46, 86, 36, 68, 42];

export function Skyline() {
  return (
    <div className="w-full" aria-hidden="true">
      <div className="flex h-24 items-end gap-1 sm:h-36 lg:h-56 lg:gap-1.5">
        {bars.map((height, index) => {
          const accent = index === 5;
          const showWindows = height >= 52;
          return (
            <div
              key={`${height}-${index}`}
              className={`relative min-w-0 flex-1 rounded-t-md ring-1 ring-inset ring-white/15 ${
                accent ? "bg-orange-500" : "bg-white/15"
              }`}
              style={{ height: `${height}%` }}
            >
              {showWindows ? (
                <span className="absolute inset-x-1 top-2 grid grid-cols-2 gap-1">
                  {Array.from({ length: accent ? 6 : 4 }).map((_, windowIndex) => (
                    <span
                      key={windowIndex}
                      className={`h-1 rounded-[1px] sm:h-1.5 ${
                        accent ? "bg-white/85" : "bg-sky-200/80"
                      }`}
                    />
                  ))}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="mt-1 h-1 rounded-full bg-orange-500" />
    </div>
  );
}
