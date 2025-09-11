export function BorderDecoration() {
  return (
    <>
      {/* Left corner decoration */}
      <div className="absolute left-0 top-0 w-[60px] h-full overflow-hidden sm:block hidden z-0">
        <div
          className="absolute dark:opacity-[0.15] opacity-[0.2] inset-0 w-[60px] h-full border border-dashed dark:border-[#eee] border-[#000]/70"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, transparent, transparent 2px, currentcolor 2px, currentcolor 3px, transparent 3px, transparent 6px)",
          }}
        ></div>
      </div>

      {/* Right corner decoration */}
      <div className="absolute right-0 top-0 w-[60px] h-full overflow-hidden sm:block hidden z-0">
        <div
          className="absolute dark:opacity-[0.15] opacity-[0.2] inset-0 w-[60px] h-full border border-dashed dark:border-[#eee] border-[#000]/70"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, transparent, transparent 2px, currentcolor 2px, currentcolor 3px, transparent 3px, transparent 6px)",
          }}
        ></div>
      </div>
    </>
  )
}
