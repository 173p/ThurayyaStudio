import { sb, MEDIA_BUCKET, publicMediaUrl } from './client';

const MAX_SIDE = 1920;

function slugName(name) {
    const base = name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50);
    return base || 'image';
}

async function prepare(file) {
    if (file.type === 'image/gif' || !file.type.startsWith('image/')) return { blob: file, ext: (file.name.split('.').pop() || 'gif').toLowerCase(), type: file.type };
    let bitmap;
    try {
        bitmap = await createImageBitmap(file);
    } catch {
        return { blob: file, ext: (file.name.split('.').pop() || 'jpg').toLowerCase(), type: file.type };
    }
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const webp = await new Promise((res) => canvas.toBlob(res, 'image/webp', 0.85));
    if (!webp || (scale === 1 && webp.size >= file.size)) return { blob: file, ext: (file.name.split('.').pop() || 'jpg').toLowerCase(), type: file.type };
    return { blob: webp, ext: 'webp', type: 'image/webp' };
}

export async function uploadImage(file, folder = '') {
    if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not an image.`);
    const { blob, ext, type } = await prepare(file);
    if (blob.size > 5 * 1024 * 1024) throw new Error(`${file.name} is still over 5 MB after compressing. Try a smaller image.`);
    const path = `${folder ? `${folder}/` : ''}${slugName(file.name)}-${Date.now().toString(36)}.${ext}`;
    const { error } = await sb.storage.from(MEDIA_BUCKET).upload(path, blob, { contentType: type, cacheControl: '31536000', upsert: false });
    if (error) throw error;
    return { path, url: publicMediaUrl(path), size: blob.size };
}

export async function listMedia() {
    const { data, error } = await sb.storage.from(MEDIA_BUCKET).list('', { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } });
    if (error) throw error;
    return (data ?? [])
        .filter((f) => f.id && f.name !== '.emptyFolderPlaceholder')
        .map((f) => ({
            path: f.name,
            name: f.name,
            size: f.metadata?.size ?? 0,
            type: (f.metadata?.mimetype || '').replace('image/', '').toUpperCase() || f.name.split('.').pop().toUpperCase(),
            created_at: f.created_at,
            url: publicMediaUrl(f.name),
        }));
}

export async function removeMedia(path) {
    const { error } = await sb.storage.from(MEDIA_BUCKET).remove([path]);
    if (error) throw error;
}
