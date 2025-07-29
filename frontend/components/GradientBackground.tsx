"use client";

import { motion } from "motion/react";

export const GradientBackground = () => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed bottom-0 left-0 w-full h-[100vh] -z-[10] blur-gradient-bottom after:content-[''] after:fixed after:inset-0 after:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iLjA1Ii8+PC9zdmc+')] after:opacity-40 after:mix-blend-overlay"
        style={{
          background:
            "radial-gradient(1600px 90% at 50% 100%," +
              "rgba(0,250,255,0.68) 0%, " +       /* #00FAFF  aqua-cyan burst   */
              "rgba(33,255,125,0.60) 40%, " +     /* #21FF7D  neon-lime midstop */
              "rgba(0,63,92,0.45) 80%, " +        /* #003F5C  deep-teal fade    */
              "transparent 100%)",
          maskImage:
            "radial-gradient(1600px 90% at 50% 80%," +
              "#000 0%, rgba(0,0,0,.48) 40%, transparent 100%)",
        }}
      />
    </>
  );
};
