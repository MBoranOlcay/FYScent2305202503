import { supabase } from '@/lib/supabaseClient';
import PerfumeListClient from '@/components/PerfumeListClient';
import type { Metadata } from 'next';
import type { Product as Perfume } from '@/types';

// Tip tanımı EN ÜSTE!
type PerfumeNoteFromDB = {
  note_type: string;
  note: { name: string } | null;
};

export const metadata: Metadata = {
  title: 'Tüm Parfümler - FindYourScent',
  description: 'FindYourScent koleksiyonundaki tüm eşsiz parfümleri, markaları ve notaları keşfedin.',
};

async function getAllPerfumes(): Promise<Perfume[]> {
  console.log("[getAllPerfumes] Fetching all perfumes from Supabase...");
  const { data, error } = await supabase
    .from('perfumes')
    .select(`
      id, 
      name, 
      slug, 
      description, 
      images,
      brand:brands ( name ), 
      fragranceNotes:perfume_notes (
        note_type,
        note:notes ( name ) 
      ),
      details_family 
    `)
    .order('name', { ascending: true });

  if (error) {
    console.error('Supabase error fetching all perfumes:', error.message);
    return [];
  }
  if (!data) {
    console.log('Supabase: No perfumes found in getAllPerfumes.');
    return [];
  }
  console.log(`[getAllPerfumes] ${data.length} perfumes received from Supabase.`);

  return data.map(p => ({
    id: p.id?.toString() ?? `unknown-${Math.random()}`,
    name: p.name ?? 'İsim Yok',
    slug: p.slug ?? '',
    brand: p.brand?.name ?? 'Bilinmeyen Marka',
    description: p.description ?? '',
    images: Array.isArray(p.images) ? p.images : [],
    fragranceNotes: Array.isArray(p.fragranceNotes) 
      ? p.fragranceNotes.map((pn: PerfumeNoteFromDB) => ({
          name: pn.note?.name ?? 'Bilinmeyen Nota',
          type: (pn.note_type ?? 'base') as 'top' | 'heart' | 'base',
          description: '',
        }))
      : [],
    details: { 
      family: p.details_family ?? undefined 
    },
    longDescription: undefined, 
    price: undefined, 
    ratings: undefined, 
    sizes: undefined, 
    reviews: undefined, 
    relatedProducts: undefined,
  })) as Perfume[];
}

export default async function PerfumesPage() {
  const initialPerfumesData = await getAllPerfumes();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold font-serif text-gray-800 mb-8 text-center">
        Tüm Parfümler
      </h1>
      <PerfumeListClient initialPerfumes={initialPerfumesData} />
    </div>
  );
}