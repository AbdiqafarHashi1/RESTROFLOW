'use client';

import { Category } from '@/types';

export function CategoryChips({ categories, active, onChange }: { categories: Category[]; active: string; onChange: (slug: string) => void }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max items-center gap-2.5">
        <button
          onClick={() => onChange('all')}
          className={`whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-medium transition ${active === 'all' ? 'border-primary bg-primary text-black shadow-[0_8px_18px_rgba(200,164,93,0.3)]' : 'border-border bg-card/90 text-muted hover:border-primary/50 hover:text-white'}`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onChange(category.slug)}
            className={`whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-medium transition ${active === category.slug ? 'border-primary bg-primary text-black shadow-[0_8px_18px_rgba(200,164,93,0.3)]' : 'border-border bg-card/90 text-muted hover:border-primary/50 hover:text-white'}`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
