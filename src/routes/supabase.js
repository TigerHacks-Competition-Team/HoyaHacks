import { createClient } from "@supabase/supabase-js";
//import type { subscribe } from "svelte/internal";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const updateNotesState = (id, state) => supabase.from("notes").upsert({id, state})

export async function uploadVideoToDB(file) {
    const {data, error} = await supabase
        .storage
        .from('custom-videos')
        .upload(`videos/${file.name}`, file, {
            cacheControl: '3600',
            upsert: false
        });

    console.log(error);

    return await supabase
                .storage
                .from('custom-videos')
                .getPublicUrl(`videos/${file.name}`);
}

export function listeningForStateChange(userId, callback) {
    supabase
        .channel('any')
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'notes',
            filter: `user=eq.${userId}`
        }, callback)
        .subscribe();
}

export function updateNote(data) {
    return supabase
        .from('notes')
        .upsert(data)
        .select();
}