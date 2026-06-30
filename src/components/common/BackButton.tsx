import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { resolveBackPath } from '@/lib/back-navigation';

interface BackButtonProps {
  to?: string;
  className?: string;
}

export function BackButton({ to, className }: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const target = to ?? resolveBackPath(location.pathname);

  if (!target) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn('shrink-0', className)}
      onClick={() => navigate(target)}
      aria-label="Go back"
    >
      <ArrowLeft className="w-4 h-4" />
    </Button>
  );
}
