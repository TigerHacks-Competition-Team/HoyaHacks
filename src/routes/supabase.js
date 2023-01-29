import { createClient } from "@supabase/supabase-js";

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

export const listingForStateChange = (id) => supabase.from("notes")