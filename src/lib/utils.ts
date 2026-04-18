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

/**
 * Skraca wygenerowany slug poprzez usunięcie popularnych polskich i angielskich "stop words"
 * i ograniczenie liczby słów do maxWords.
 */
export function shortenSlug(slug: string, maxWords: number = 4): string {
    if (!slug) return '';
    const stopWords = ['i', 'oraz', 'w', 'z', 'na', 'do', 'od', 'dla', 'o', 'za', 'po', 'jak', 'to', 'jest', 'ze', 'ale', 'a', 'the', 'and', 'of', 'in', 'on', 'at', 'by', 'for'];
    let words = slug.split('-');
    words = words.filter(w => !stopWords.includes(w) && w.length > 1);
    return words.slice(0, maxWords).join('-');
}
