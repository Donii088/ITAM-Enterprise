import { Spinner } from './Spinner';

export function PageLoader() {
  return (
    <div className="flex h-full min-h-[50vh] w-full items-center justify-center">
      <Spinner size={28} />
    </div>
  );
}

export function SplashLoader() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 shadow-elevated">
        <span className="text-lg font-bold tracking-tight text-white">IT</span>
      </div>
      <Spinner size={22} />
    </div>
  );
}
