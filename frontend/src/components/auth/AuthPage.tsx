import { useState } from "react"
import { motion, AnimatePresence, MotionConfig } from "framer-motion"
import { VeyraLogo } from "@/components/brand/VeyraLogo"
import { VeyraCompanion, Obj3D } from "@/components/VeyraCompanion"
import LoginForm from "./LoginForm"
import SignupForm from "./SignupForm"

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-[100dvh] w-full flex items-center justify-center p-3 sm:p-5 md:p-6 lg:p-8 relative overflow-hidden bg-[var(--veyra-paper)] selection:bg-[var(--veyra-ink)] selection:text-white">
        {/* ── layered ambient — cinematic paper ── */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(1100px circle at 14% 12%, rgba(196,90,60,0.075) 0%, transparent 56%), radial-gradient(900px circle at 90% 86%, rgba(138,154,139,0.09) 0%, transparent 58%), radial-gradient(700px circle at 50% 48%, rgba(224,122,95,0.035) 0%, transparent 66%), var(--veyra-paper)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.24] mix-blend-multiply"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.032'/%3E%3C/svg%3E\")",
          }}
        />
        {/* drifting orbs */}
        <motion.div
          aria-hidden
          className="absolute -top-28 -left-20 w-[460px] h-[460px] sm:w-[600px] sm:h-[600px] rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(232,224,208,0.88) 0%, transparent 72%)" }}
          animate={{ x: [0, 10, 0], y: [0, -7, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -bottom-28 -right-20 w-[500px] h-[500px] sm:w-[640px] sm:h-[640px] rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(196,90,60,0.085) 0%, transparent 70%)" }}
          animate={{ x: [0, -12, 0], y: [0, 7, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        />
        <motion.div
          aria-hidden
          className="absolute top-[46%] left-1/2 -translate-x-1/2 w-[720px] h-[360px] rounded-full blur-3xl pointer-events-none opacity-40 hidden lg:block"
          style={{ background: "radial-gradient(ellipse at center, rgba(15,26,28,0.03) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="w-full max-w-[1080px] relative z-10 grid lg:grid-cols-[1.02fr_1.12fr] gap-5 sm:gap-6 lg:gap-7 items-center">
          {/* ── MOBILE — official VEYRA brand */}
          <div className="lg:hidden flex justify-center px-1">
            <VeyraLogo size="md" className="w-full max-w-[160px] h-auto" />
          </div>

          {/* ── LEFT — immersive editorial theatre (desktop) ── */}
          <div
            className="hidden lg:flex flex-col relative min-h-[580px] rounded-[32px] overflow-hidden p-7 sm:p-8"
            style={{
              background: "var(--veyra-ink)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 24px 64px rgba(15,26,28,0.18), 0 6px 20px rgba(15,26,28,0.08)",
            }}
          >
            {/* inner lighting */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(700px circle at 16% 14%, rgba(196,90,60,0.13) 0%, transparent 58%), radial-gradient(600px circle at 92% 88%, rgba(138,154,139,0.10) 0%, transparent 60%), radial-gradient(520px circle at 62% 36%, rgba(224,122,95,0.06) 0%, transparent 62%)",
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-soft-light"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
              }}
            />
            {/* top hairline */}
            <div aria-hidden className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* brand — official VEYRA */}
            <div className="relative z-10 flex items-center gap-3">
              <VeyraLogo size="md" className="max-w-[150px] h-auto" />
              <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur border border-white/10 text-[10px] font-600 text-white/80">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--veyra-sage)] animate-pulse shadow-[0_0_8px_rgba(138,154,139,0.6)]" />
                AI active
              </div>
            </div>

            {/* editorial kicker */}
            <div className="relative z-10 mt-5 flex items-center gap-2">
              <span className="w-7 h-px bg-[var(--veyra-clay)]/60" aria-hidden />
              <span className="font-mono text-[10px] tracking-[0.16em] font-700 text-[#E8B896] uppercase">Editorial • Warm • Tactile</span>
            </div>

            {/* headline */}
            <div className="relative z-10 mt-3">
              <h2 className="font-serif text-[30px] leading-[0.9] tracking-[-0.04em] text-white">
                Food,
                <span className="label-serif italic font-400 text-[#E8B896]"> understood.</span>
              </h2>
              <p className="mt-2 text-[13.5px] leading-[1.6] text-white/65 max-w-[32ch] font-400">
                Intelligent nutrition, movement, and habits — gently personal, never clinical.
              </p>
            </div>

            {/* companion stage — layered glass/paper */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-6">
              <div className="relative">
                {/* paper halos */}
                <div
                  aria-hidden
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full pointer-events-none"
                  style={{
                    background: "radial-gradient(circle, rgba(255,255,255,0.085) 0%, rgba(255,255,255,0.025) 44%, transparent 72%)",
                    filter: "blur(0.5px)",
                  }}
                />
                <div
                  aria-hidden
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[232px] h-[232px] rounded-full pointer-events-none rotate-2"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 14px 36px rgba(0,0,0,0.14)",
                  }}
                />
                <div
                  aria-hidden
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[208px] h-[208px] rounded-[24px] rotate-[-1.2deg] pointer-events-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    backdropFilter: "blur(8px)",
                  }}
                />

                <motion.div
                  className="relative"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <VeyraCompanion
                    mood={activeTab === "login" ? "happy" : "celebrate"}
                    accent={activeTab === "login" ? "sage" : "clay"}
                    size={182}
                    float={false}
                  />
                </motion.div>

                {/* floating wellness cards — tactile */}
                <motion.div
                  className="absolute -top-2 -right-7 pointer-events-none"
                  animate={{ y: [0, -6, 0], rotate: [0, 1.4, 0] }}
                  transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="rounded-[14px] p-1 bg-white/96 backdrop-blur border border-[#E8E0D0] shadow-[0_10px_28px_rgba(15,26,28,0.12)]">
                    <Obj3D kind="leaf" size={44} float={false} />
                  </div>
                  <div className="mx-auto mt-1.5 w-fit px-2 py-1 rounded-full bg-white/10 backdrop-blur border border-white/10">
                    <span className="font-mono text-[8px] tracking-[0.12em] font-700 text-white/80 uppercase">Leaf • fresh</span>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -bottom-2 -left-7 pointer-events-none"
                  animate={{ y: [0, 5, 0], rotate: [0, -1.2, 0] }}
                  transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
                >
                  <div className="rounded-[14px] p-1 bg-white/92 backdrop-blur border border-white/40 shadow-[0_10px_24px_rgba(15,26,28,0.10)]">
                    <Obj3D kind={activeTab === "login" ? "water" : "avocado"} size={42} float={false} />
                  </div>
                </motion.div>

                {/* orbital speck */}
                <motion.span
                  aria-hidden
                  className="absolute left-[-10%] top-[18%] w-1.5 h-1.5 rounded-full bg-[#E8B896] opacity-50"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              {/* quote — glass paper, editorial */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6 w-full max-w-[360px]"
              >
                <div
                  className="relative rounded-[20px] p-4 sm:p-5 overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.97)",
                    border: "1px solid rgba(232,224,208,0.92)",
                    boxShadow: "0 14px 32px rgba(0,0,0,0.10), 0 3px 10px rgba(0,0,0,0.06)",
                  }}
                >
                  <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-[var(--veyra-clay)]" />
                  <span
                    aria-hidden
                    className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-15"
                    style={{ background: "var(--veyra-clay)" }}
                  />
                  <div className="font-mono text-[9px] tracking-[0.16em] font-700 text-[var(--veyra-clay)] uppercase mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--veyra-sage)] animate-pulse" />
                    The Veyra promise
                  </div>
                  <p className="label-serif italic text-[15px] leading-[1.45] tracking-[-0.01em] text-[var(--veyra-ink)]">
                    {activeTab === "login"
                      ? "“Welcome back. Your habits, meals and progress — gently gathered, intelligently understood.”"
                      : "“Start where you are. We’ll tune every recommendation to you — your foods, your rhythm, your goals.”"}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="w-6 h-px bg-[#E8E0D0]" aria-hidden />
                    <span className="font-mono text-[9px] tracking-[0.12em] text-[#9CA3AF] uppercase">Warm • Human • Yours</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-center gap-2 text-white/55">
                  <span className="w-1 h-1 rounded-full bg-[#E8B896]" />
                  <span className="font-mono text-[9px] tracking-[0.12em] uppercase">Intelligent food + wellness + personalization</span>
                </div>
              </motion.div>
            </div>

            {/* stats — tactile ink glass */}
            <div className="relative z-10 grid grid-cols-3 gap-2">
              {[
                { k: "Recipes", v: "1,400+" },
                { k: "Cuisines", v: "20" },
                { k: "Tracking", v: "Daily" },
              ].map((s) => (
                <div
                  key={s.k}
                  className="rounded-[14px] bg-white/[0.06] backdrop-blur border border-white/[0.08] px-3 py-2.5 text-center"
                >
                  <div className="font-display font-800 text-[13px] tracking-[-0.02em] text-white leading-none">{s.v}</div>
                  <div className="font-mono text-[9px] tracking-[0.12em] text-white/55 mt-1 uppercase">{s.k}</div>
                </div>
              ))}
            </div>
          </div>

        {/* ── RIGHT — auth card — layered glass/paper ── */}
        <div className="w-full min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-[26px] sm:rounded-[30px] overflow-hidden bg-white"
            style={{
              border: "1px solid #E8E0D0",
              boxShadow: "0 18px 52px rgba(15,26,28,0.08), 0 5px 18px rgba(15,26,28,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
          >
            {/* inner paper highlight + ambient */}
            <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E8E0D0] to-transparent opacity-60" />
            <div
              aria-hidden
              className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-[0.14] pointer-events-none"
              style={{ background: "radial-gradient(circle, var(--veyra-clay) 0%, transparent 70%)" }}
            />
            <div
              aria-hidden
              className="absolute -bottom-20 -left-20 w-52 h-52 rounded-full blur-3xl opacity-[0.07] pointer-events-none"
              style={{ background: "radial-gradient(circle, var(--veyra-sage) 0%, transparent 70%)" }}
            />

            <div className="relative p-5 sm:p-7 md:p-8">
              {/* Header — official VEYRA brand */}
              <div className="flex items-start gap-3.5 mb-6">
                <VeyraLogo size="sm" className="shrink-0 max-w-[110px] h-auto" />
                <div className="min-w-0 flex-1">
                  <h1 className="font-display font-800 text-[20px] sm:text-[22px] tracking-[-0.03em] leading-none text-[var(--veyra-ink)]">
                    Welcome to Veyra
                  </h1>
                  <p className="text-[13px] sm:text-[13.5px] leading-[1.55] text-[#6B7280] mt-1.5 max-w-[34ch] font-400">
                    Your personal wellness journey — <span className="label-serif italic text-[var(--veyra-ink)]">warm, intelligent, yours.</span>
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 shrink-0 mt-1 px-2.5 py-1.5 rounded-full bg-[#F5F0E8] border border-[#E8E0D0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--veyra-sage)] animate-pulse" />
                  <span className="font-mono text-[9px] tracking-[0.12em] font-700 text-[#6B7280] uppercase">Secure</span>
                </div>
              </div>

              {/* Tab toggle — tactile pill with motion */}
              <div
                className="relative flex p-1 rounded-[16px] sm:rounded-[18px] mb-6 gap-1"
                style={{ background: "#F5F0E8", border: "1px solid #E8E0D0" }}
                role="tablist"
                aria-label="Authentication"
              >
                {(["login", "signup"] as const).map((tab) => {
                  const active = activeTab === tab
                  return (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveTab(tab)}
                      className={`relative flex-1 py-2.5 sm:py-3 rounded-[12px] text-[13px] font-700 tracking-[-0.01em] transition-colors z-10 ${active ? "text-white" : "text-[#6B7280] hover:text-[var(--veyra-ink)]"}`}
                      style={{ fontFamily: "Outfit, sans-serif" }}
                    >
                      {active && (
                        <motion.div
                          layoutId="auth-tab"
                          className="absolute inset-0 rounded-[12px] shadow-[0_4px_14px_rgba(15,26,28,0.14)]"
                          style={{ background: "var(--veyra-ink)" }}
                          transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center justify-center gap-1.5">
                        {tab === "login" ? "Log In" : "Sign Up"}
                        {active && <span className="w-1 h-1 rounded-full bg-[var(--veyra-clay)] hidden sm:inline" aria-hidden />}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Form — AnimatePresence for elegant cross-fade */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  {activeTab === "login" ? (
                    <LoginForm onSwitchToSignup={() => setActiveTab("signup")} />
                  ) : (
                    <SignupForm onSwitchToLogin={() => setActiveTab("login")} />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* trust row — editorial */}
              <div className="mt-7 pt-4 border-t border-[#F5F0E8] flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-[11px] text-[#9CA3AF]">
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.10em] uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8E0D0]" />
                  Private by design
                </span>
                <span className="w-px h-3 bg-[#E8E0D0] hidden sm:block" aria-hidden />
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.10em] uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8E0D0]" />
                  No spam, ever
                </span>
                <span className="w-px h-3 bg-[#E8E0D0] hidden sm:block" aria-hidden />
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.10em] uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8E0D0]" />
                  Cancel anytime
                </span>
              </div>
            </div>
          </motion.div>

          {/* helper below card */}
          <p className="text-center font-mono text-[10px] tracking-[0.10em] text-[#9CA3AF] uppercase mt-3 px-4 leading-relaxed">
            By continuing you agree to our warm, human terms — built for real life.
          </p>

          {/* mobile companion hint */}
          <div className="lg:hidden mt-4 flex items-center justify-center gap-2 opacity-60">
            <span className="w-6 h-px bg-[#E8E0D0]" aria-hidden />
            <span className="font-mono text-[9px] tracking-[0.12em] text-[#9CA3AF] uppercase">Intelligent • Warm • Personal</span>
            <span className="w-6 h-px bg-[#E8E0D0]" aria-hidden />
          </div>
        </div>
      </div>
      </div>
    </MotionConfig>
  )
}
