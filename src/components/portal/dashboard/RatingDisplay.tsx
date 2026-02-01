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
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
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
                isFull || isHalf ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              )}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
