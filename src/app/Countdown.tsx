import { useI18n } from "@/features/i18n/useI18n";

export function Countdown({ seconds }: { seconds: number }) {
  const { t } = useI18n();
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-ink-950/30">
      <p className="font-medium text-ink-100 text-lg">{t.getReady}</p>
      <p
        key={seconds}
        className="font-extrabold text-9xl text-white drop-shadow-[0_8px_24px_rgb(13_30_44/0.6)] motion-safe:animate-pop"
      >
        {seconds}
      </p>
    </div>
  );
}
