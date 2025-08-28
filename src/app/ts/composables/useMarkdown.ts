import { useMemo } from 'react';
import { Formatter } from '../utils';

export function useMarkdown(content: string) {
    return useMemo(() => Formatter.parseMarkdown(content), [content]);
}
