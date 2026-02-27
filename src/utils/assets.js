export const resolveAssetPath = (path) => {
    if (!path) return '';
    // If it's already a full URL or starts with context-sensitive protocols, return it
    if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) {
        return path;
    }

    // Get the base URL (e.g., /talk-with-ai/ for GitHub Pages)
    const base = import.meta.env.BASE_URL || '/';

    // Normalize base to always have a trailing slash
    const normalizedBase = base.endsWith('/') ? base : `${base}/`;

    // Normalize path to NOT have a leading slash
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;

    return `${normalizedBase}${normalizedPath}`;
};
