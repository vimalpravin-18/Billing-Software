import React, { useState, useCallback } from 'react';
import { Package, Coffee, Cake, Cookie, UtensilsCrossed } from 'lucide-react';

const KNOWN_LOCAL_PRODUCT_IDS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

const getCategoryFallback = (categoryName) => {
  const cat = (categoryName || '').toLowerCase();
  if (cat.includes('bever') || cat.includes('coffee') || cat.includes('tea') || cat.includes('juice')) {
    return {
      Icon: Coffee,
      bg: 'bg-amber-100/90 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300',
    };
  }
  if (cat.includes('cake') || cat.includes('dessert') || cat.includes('sweet') || cat.includes('pastr')) {
    return {
      Icon: Cake,
      bg: 'bg-rose-100/90 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300',
    };
  }
  if (cat.includes('cookie') || cat.includes('biscuit') || cat.includes('snack')) {
    return {
      Icon: Cookie,
      bg: 'bg-orange-100/90 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300',
    };
  }
  if (cat.includes('savor') || cat.includes('puff') || cat.includes('roll') || cat.includes('bread') || cat.includes('bun')) {
    return {
      Icon: UtensilsCrossed,
      bg: 'bg-emerald-100/90 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300',
    };
  }
  return {
    Icon: Package,
    bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  };
};

const ProductImage = React.memo(({ product, className = '', alt = '' }) => {
  const categoryName = product?.category?.name || product?.categoryName || '';
  const { Icon, bg } = getCategoryFallback(categoryName);

  // Safely resolve primary and secondary image URLs
  const prodIdNum = Number(product?.id);
  const hasLocalAsset = !isNaN(prodIdNum) && KNOWN_LOCAL_PRODUCT_IDS.has(prodIdNum);
  const localPath = hasLocalAsset ? `/images/products/prod_${prodIdNum}.jpg` : null;

  const validRemoteUrl =
    product?.imageUrl &&
    typeof product.imageUrl === 'string' &&
    !product.imageUrl.startsWith('file:') &&
    (product.imageUrl.startsWith('http://') ||
      product.imageUrl.startsWith('https://') ||
      product.imageUrl.startsWith('/'))
      ? product.imageUrl
      : null;

  // Use local asset first if known to exist, else valid remote URL
  const primarySrc = localPath || validRemoteUrl;
  const secondarySrc = localPath ? validRemoteUrl : null;

  const [currentSrc, setCurrentSrc] = useState(primarySrc);
  const [hasError, setHasError] = useState(!primarySrc);
  const [loaded, setLoaded] = useState(false);

  const handleError = useCallback(
    (e) => {
      // CRITICAL: Kill onerror on target element to permanently stop recursive firing
      e.target.onerror = null;
      if (secondarySrc && currentSrc !== secondarySrc) {
        setCurrentSrc(secondarySrc);
      } else {
        setHasError(true);
      }
    },
    [secondarySrc, currentSrc]
  );

  if (!product) return null;

  // If no source exists or loading failed, display clean high-contrast category icon
  if (hasError || !currentSrc) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center select-none ${bg} ${className}`}>
        <Icon className="w-7 h-7 sm:w-8 sm:h-8 opacity-80" strokeWidth={2.2} />
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider mt-1 text-center px-1 truncate max-w-full leading-none">
          {categoryName || product.name || 'Bakery'}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden w-full h-full bg-slate-100 dark:bg-slate-800 select-none ${className}`}>
      {/* Clean, static placeholder without frantic animate-pulse */}
      {!loaded && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center ${bg} z-0`}>
          <Icon className="w-7 h-7 sm:w-8 sm:h-8 opacity-50" strokeWidth={2.2} />
          <span className="text-[10px] font-black uppercase tracking-wider mt-1 opacity-70">
            {categoryName || 'Bakery'}
          </span>
        </div>
      )}

      <img
        src={currentSrc}
        alt={alt || product.name}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-150 relative z-10 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
});

export default ProductImage;
