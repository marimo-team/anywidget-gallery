import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '~/utils/cn';
import { ImageOff } from 'lucide-react';
import { Button } from 'react-aria-components';

type ImageProps = {
  src: string;
  alt: string;
  className?: string;
  loadingClassName?: string;
  errorClassName?: string;
  fallbackComponent?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  retry?: boolean;
  retryInterval?: number;
  height?: string | number;
  width?: string | number;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  loadingIndicator?: React.ReactNode;
  errorIndicator?: React.ReactNode;
};

export default function Image({
  src,
  alt,
  className = '',
  loadingClassName = '',
  errorClassName = '',
  fallbackComponent,
  onLoad,
  onError,
  retry = false,
  retryInterval = 5000,
  height = 'auto',
  width = 'auto',
  objectFit = 'cover',
  errorIndicator,
}: ImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);

    // Force reload by updating the src with a cache-busting query param
    if (imgRef.current) {
      const cacheBuster = `?t=${Date.now()}`;
      const srcWithoutCacheBuster = src.split('?')[0];
      imgRef.current.src = `${srcWithoutCacheBuster}${cacheBuster}`;
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    setErrorMessage('Failed to load image');

    const error = new Error('Image failed to load');
    onError?.(error);

    if (retry && retryInterval > 0) {
      retryTimeoutRef.current = setTimeout(() => {
        handleRetry();
      }, retryInterval);
    }
  };

  // If there's an error and a fallback component is provided, show it
  if (hasError && fallbackComponent) {
    return <>{fallbackComponent}</>;
  }

  return (
    <div
      className={cn('relative', className)}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof width === 'number' ? `${width}px` : width,
      }}
    >
      {isLoading && !hasError && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse',
            loadingClassName
          )}
        />
      )}

      {hasError && !fallbackComponent && (
        <div
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800',
            errorClassName
          )}
        >
          {errorIndicator || (
            <>
              <ImageOff className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">{errorMessage}</p>
              {retry && (
                <Button
                  onPress={handleRetry}
                  className="mt-2 px-3 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                >
                  Retry
                </Button>
              )}
            </>
          )}
        </div>
      )}

      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full',
          hasError && 'hidden',
          isLoading && 'opacity-0',
          !isLoading && !hasError && 'opacity-100 transition-opacity duration-200'
        )}
        style={{ objectFit }}
      />
    </div>
  );
}
