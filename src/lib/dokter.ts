import { supabase } from './supabase';

export interface DokterContact {
  label: string;
  value: string;
}

export interface DokterPractice {
  workplace: string;
  address: string;
  contacts: DokterContact[];
}

export interface Dokter {
  id: string;
  name: string;
  specialization: string;
  practices: DokterPractice[];
  image_url?: string;
  created_at?: string;
}

export async function getDokters(): Promise<Dokter[]> {
  const { data, error } = await supabase
    .from('dokters')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching docs:", error);
    return [];
  }

  return data as Dokter[];
}

export async function getDokterById(id: string): Promise<Dokter | null> {
  const { data, error } = await supabase
    .from('dokters')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching doc by id:", error);
    return null;
  }

  return data as Dokter;
}

export async function saveDokter(dokter: Omit<Dokter, 'id' | 'created_at'>, id?: string) {
  if (id) {
    const { error } = await supabase
      .from('dokters')
      .update({
        name: dokter.name,
        specialization: dokter.specialization,
        practices: dokter.practices,
        image_url: dokter.image_url
      })
      .eq('id', id);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('dokters')
      .insert([{
        name: dokter.name,
        specialization: dokter.specialization,
        practices: dokter.practices,
        image_url: dokter.image_url
      }]);

    if (error) throw error;
  }
}

export async function deleteDokter(id: string) {
  const { error } = await supabase
    .from('dokters')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
