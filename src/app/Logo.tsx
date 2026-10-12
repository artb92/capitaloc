export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <img src="/favicon.svg" alt="" className="size-8" />
      <span className="font-display font-extrabold text-[1.35rem] leading-none tracking-tight">
        capita
        <span className="bg-gradient-to-r from-violet-600 to-rose-500 bg-clip-text text-transparent">
          loc
        </span>
      </span>
    </span>
  );
}
