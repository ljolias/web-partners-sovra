'use client';

import Image from 'next/image';

interface SovraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export function SovraLogo({ size = 'md', showText = true, className = '' }: SovraLogoProps) {
  const sizes = {
    sm: { logo: 24, text: 'text-base' },
    md: { logo: 32, text: 'text-lg lg:text-xl' },
    lg: { logo: 40, text: 'text-xl lg:text-2xl' },
    xl: { logo: 48, text: 'text-2xl lg:text-3xl' },
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center gap-2 lg:gap-3 ${className}`}>
      <Image
        src="/sovra-logo.svg"
        alt="Sovra"
        width={currentSize.logo}
        height={currentSize.logo}
        className="object-contain rounded-lg"
        priority
      />
      {showText && (
        <span className={`font-bold text-[var(--color-text-primary)] ${currentSize.text}`}>
          Sovra
        </span>
      )}
    </div>
  );
}
