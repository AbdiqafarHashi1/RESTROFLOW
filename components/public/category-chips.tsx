'use client';

import { Category } from '@/types';

export function CategoryChips({ categories, active, onChange }: { categories: Category[]; active: string; onChange: (slug: string) => void }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2">
      <div className="flex gap-2">
        <button onClick={() => onChange('all')} className={`rounded-full px-4 py-2 text-sm ${active === 'all' ? 'bg-primary text-black' : 'bg-card text-muted'}`}>All</button>
        {categories.map((category) => (
          <button key={category.id} onClick={() => onChange(category.slug)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${active === category.slug ? 'bg-primary text-black' : 'bg-card text-muted'}`}>{category.name}</button>
        ))}
      </div>
    </div>
  );
}
