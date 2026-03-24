export function slugify(str: string) {
    if (!str) return '';
    
    // Convert to minor
    str = str.toLowerCase();
    
    // Remove accents
    str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
    str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
    str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
    str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
    str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
    str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
    str = str.replace(/(đ)/g, 'd');
    
    // Convert spaces to hyphens and remove special characters
    str = str.replace(/[^a-z0-9 -]/g, '')
             .replace(/\s+/g, '-')
             .replace(/-+/g, '-');
             
    return str;
}

export interface TocHeading {
    id: string;
    text: string;
    level: number;
}

export function extractHeadings(content: any): TocHeading[] {
    const headings: TocHeading[] = [];
    if (!content) return headings;

    if (typeof content === 'string') {
        const regex = /^(#{2,3})\s+(.+)$/gm;
        let match;
        while ((match = regex.exec(content)) !== null) {
            const level = match[1].length;
            const text = match[2].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`~>]/g, '').trim(); // Remove md links & emphasis in heading
            headings.push({ id: slugify(text), text, level });
        }
    } else if (Array.isArray(content)) {
        content.forEach(block => {
            if (block._type === 'block' && (block.style === 'h2' || block.style === 'h3') && block.children?.length > 0) {
                const text = block.children.map((c: any) => c.text).join('').trim();
                if (text) {
                    const level = parseInt((block.style as string).replace('h', ''), 10);
                    headings.push({ id: slugify(text), text, level });
                }
            }
        });
    }
    return headings;
}
