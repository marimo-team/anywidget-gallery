import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '~/utils/cn';
import { motion } from 'motion/react';
import { Button } from 'react-aria-components';

type IframeProps = {
  src: string;
  title: string;
  className?: string;
  loadingClassName?: string;
  errorClassName?: string;
  fallbackComponent?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  sandbox?: string;
  allow?: string;
  retry?: boolean;
  retryInterval?: number;
  height?: string | number;
  width?: string | number;
  timeout?: number;
};

export default function Iframe({
  src,
  title,
  className = '',
  loadingClassName = '',
  errorClassName = '',
  fallbackComponent,
  onLoad,
  onError,
  sandbox = 'allow-scripts allow-same-origin allow-popups allow-forms',
  allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
  retry = false,
  retryInterval = 5000,
  height = '100%',
  width = '100%',
  timeout = 30000,
}: IframeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    // Set timeout to detect unusually long loading times
    if (timeout > 0) {
      timeoutRef.current = setTimeout(() => {
        if (isLoading) {
          setHasError(true);
          setErrorMessage('Loading timed out');
          setIsLoading(false);
          onError?.(new Error('Loading timed out'));
        }
      }, timeout);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [src]);

  // Function to handle retry logic
  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);

    // Force iframe reload by updating the src
    if (iframeRef.current) {
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) iframeRef.current.src = src;
      }, 50);
    }
  };

  // Set up auto-retry if enabled
  useEffect(() => {
    let retryTimer: NodeJS.Timeout | null = null;

    if (retry && hasError) {
      retryTimer = setTimeout(handleRetry, retryInterval);
    }

    return () => {
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [hasError, retry, retryInterval]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setErrorMessage('Failed to load content');
    setIsLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    onError?.(new Error('Failed to load iframe content'));
  };

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <motion.div
          className="absolute top-0 left-0 h-1 bg-blue-500 z-10"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 5 }}
        />
      )}

      {hasError && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10',
            errorClassName
          )}
        >
          {fallbackComponent || (
            <div className="flex flex-col items-center space-y-4 p-6 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Failed to load content</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{errorMessage}</p>
              <Button
                onPress={handleRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Retry
              </Button>
            </div>
          )}
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={src}
        title={title}
        className={cn('border-0', className, {
          'opacity-0': isLoading || hasError,
          'opacity-100': !isLoading && !hasError,
        })}
        onLoad={handleLoad}
        onError={handleError}
        sandbox={sandbox}
        allow={allow}
        loading="lazy"
        style={{ height, width }}
      />
    </div>
  );
}
