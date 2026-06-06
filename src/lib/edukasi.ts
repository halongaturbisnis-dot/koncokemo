import { supabase } from './supabase';

export interface Edukasi {
  id: string;
  title: string;
  subtitle: string;
  media_url: string;
  media_type: 'image' | 'video';
  content: string;
  order_index?: number;
  created_at?: string;
}

export async function getEdukasis(): Promise<Edukasi[]> {
  const { data, error } = await supabase
    .from('edukasi')
    .select('*')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching edukasi:", error);
    return [];
  }

  return data as Edukasi[];
}

export async function getEdukasiById(id: string): Promise<Edukasi | null> {
  const { data, error } = await supabase
    .from('edukasi')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching edukasi by id:", error);
    return null;
  }

  return data as Edukasi;
}

export async function saveEdukasi(edukasi: Omit<Edukasi, 'id' | 'created_at'>, id?: string) {
  if (id) {
    const { error } = await supabase
      .from('edukasi')
      .update({
        title: edukasi.title,
        subtitle: edukasi.subtitle,
        media_url: edukasi.media_url,
        media_type: edukasi.media_type,
        content: edukasi.content,
        order_index: edukasi.order_index || 0
      })
      .eq('id', id);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('edukasi')
      .insert([{
        title: edukasi.title,
        subtitle: edukasi.subtitle,
        media_url: edukasi.media_url,
        media_type: edukasi.media_type,
        content: edukasi.content,
        order_index: edukasi.order_index || 0
      }]);

    if (error) throw error;
  }
}

export async function deleteEdukasi(id: string) {
  const { error } = await supabase
    .from('edukasi')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function updateEdukasiOrder(orderedIds: string[]) {
  const updates = orderedIds.map((id, index) => 
    supabase.from('edukasi').update({ order_index: index }).eq('id', id)
  );
  
  await Promise.all(updates);
}
