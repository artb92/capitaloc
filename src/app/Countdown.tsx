import { useI18n } from "@/features/i18n/useI18n";

export function Countdown({ seconds }: { seconds: number }) {
  const { t } = useI18n();
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/20">
      <p className="font-medium text-lg text-white drop-shadow">{t.getReady}</p>
      <p key={seconds} className="animate-ping-once font-bold text-8xl text-white drop-shadow-lg">
        {seconds}
      </p>
    </div>
  );
}
