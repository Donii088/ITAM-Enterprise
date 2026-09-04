import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { routes } from '@/routes/routes';

export function GlobalSearchBox() {
  const [term, setTerm] = React.useState('');
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (term.trim().length >= 2) {
      navigate(`${routes.search}?q=${encodeURIComponent(term.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="hidden w-full max-w-sm md:block">
      <Input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search assets, users, tickets…"
        leftIcon={<Search className="h-4 w-4" />}
        aria-label="Global search"
        className="border-transparent bg-muted/60 shadow-none hover:border-transparent focus-visible:border-border focus-visible:bg-surface"
      />
    </form>
  );
}
