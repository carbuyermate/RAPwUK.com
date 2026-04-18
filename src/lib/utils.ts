/**
 * Generuje przyjazny URL (slug) z podanego tekstu.
 * Obsługuje polskie znaki, usuwa znaki specjalne, zamienia spacje na myślniki.
 */
export function createSlug(text: string): string {
    const polishChars: { [key: string]: string } = {
        'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
        'Ą': 'a', 'Ć': 'c', 'Ę': 'e', 'Ł': 'l', 'Ń': 'n', 'Ó': 'o', 'Ś': 's', 'Ź': 'z', 'Ż': 'z'
    };

    let slug = text.split('').map(char => polishChars[char] || char).join('');

    return slug
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Usuń znaki niebędące słowami, spacjami lub myślnikami
        .replace(/[\s_-]+/g, '-')   // Zamień spacje/podkreślenia na jeden myślnik
        .replace(/^-+|-+$/g, '');   // Usuń myślniki z początku i końca
}
