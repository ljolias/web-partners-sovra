'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingDisplayProps {
  rating: number | string;
  maxRating?: number;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function RatingDisplay({
  rating: rawRating,
  maxRating = 5,
  showValue = true,
  size = 'md',
}: RatingDisplayProps) {
  const rating = typeof rawRating === 'string' ? parseFloat(rawRating) : rawRating;

  const sizes = {
    sm: 'h-3 w-3 sm:h-4 sm:w-4',
    md: 'h-4 w-4 sm:h-5 sm:w-5',
    lg: 'h-5 w-5 sm:h-6 sm:w-6',
  };

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {Array.from({ length: maxRating }).map((_, i) => {
          const isFull = i < fullStars;
          const isHalf = i === fullStars && hasHalfStar;

          return (
            <Star
              key={i}
              className={cn(
                sizes[size],
                isFull || isHalf ? 'text-[var(--color-accent-orange)] fill-[var(--color-accent-orange)]' : 'text-[var(--color-neutral-dark)]'
              )}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
