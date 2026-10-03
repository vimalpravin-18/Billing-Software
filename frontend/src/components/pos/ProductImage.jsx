import React, { useState } from 'react';
import { Package, Coffee, Cake, Cookie, UtensilsCrossed } from 'lucide-react';

const getCategoryFallback = (categoryName) => {
  const cat = (categoryName || '').toLowerCase();
  if (cat.includes('bever') || cat.includes('coffee') || cat.includes('tea')) {
    return {
      Icon: Coffee,
      bg: 'bg-amber-100/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
    };
  }
  if (cat.includes('cake') || cat.includes('dessert') || cat.includes('sweet')) {
    return {
      Icon: Cake,
      bg: 'bg-rose-100/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400',
    };
  }
  if (cat.includes('cookie') || cat.includes('biscuit')) {
    return {
      Icon: Cookie,
      bg: 'bg-orange-100/80 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400',
    };
  }
  if (cat.includes('savor') || cat.includes('puff') || cat.includes('roll')) {
    return {
      Icon: UtensilsCrossed,
      bg: 'bg-emerald-100/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
    };
  }
  return {
    Icon: Package,
    bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  };
};

const ProductImage = ({ product, className = '', alt = '' }) => {
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!product) return null;

  const localSrc = `/images/products/prod_${product.id}.jpg`;
  const remoteSrc =
    product.imageUrl &&
    !product.imageUrl.startsWith('file:') &&
    (product.imageUrl.startsWith('http') || product.imageUrl.startsWith('/'))
      ? product.imageUrl
      : null;

  const initialSrc = localSrc;
  const { Icon, bg } = getCategoryFallback(product.category?.name || product.categoryName);

  return (
    <div className={`relative overflow-hidden w-full h-full bg-slate-100 dark:bg-slate-800 ${className}`}>
      {!loaded && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center ${bg} transition-opacity duration-300`}>
          <Icon className="w-8 h-8 opacity-75 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider mt-1 opacity-90">
            {product.category?.name || 'Bakery'}
          </span>
        </div>
      )}

      {!hasError ? (
        <img
          src={initialSrc}
          alt={alt || product.name}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={(e) => {
            if (remoteSrc && e.target.src !== remoteSrc) {
              e.target.src = remoteSrc;
            } else {
              setHasError(true);
            }
          }}
          className={`w-full h-full object-cover transition-all duration-300 ${
            loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          } group-hover:scale-105`}
        />
      ) : (
        <div className={`w-full h-full flex flex-col items-center justify-center ${bg}`}>
          <Icon className="w-8 h-8 opacity-80" />
          <span className="text-xs font-black mt-1 text-center px-1 truncate max-w-full">
            {product.name}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProductImage;
