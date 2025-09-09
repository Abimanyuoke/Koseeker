"use client"

import { useRouter, usePathname } from "next/navigation"
import { KeyboardEvent, useState, forwardRef, useImperativeHandle } from "react"

type Props = {
    search: string
}

export interface SearchRef {
    performSearch: () => void;
}

const Search = forwardRef<SearchRef, Props>(({ search }, ref) => {
    const [keyword, setKeyword] = useState<string>(search)
    const router = useRouter()
    const pathname = usePathname() // Hook untuk mendapatkan path saat ini

    const performSearch = () => {
        // Update URL tanpa refresh dan tanpa scroll ke atas
        const searchParams = new URLSearchParams(window.location.search);
        if (keyword.trim()) {
            searchParams.set('search', keyword.trim());
        } else {
            searchParams.delete('search');
        }

        // Gunakan pathname saat ini sebagai base URL
        const newUrl = `${pathname}?${searchParams.toString()}`;

        // Gunakan replaceState untuk update URL tanpa navigation
        window.history.replaceState(null, '', newUrl);

        // Trigger event untuk update komponen yang mendengarkan perubahan URL
        window.dispatchEvent(new PopStateEvent('popstate'));
    }

    useImperativeHandle(ref, () => ({
        performSearch
    }));

    const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return;
        e.preventDefault(); // Mencegah form submission default
        e.stopPropagation(); // Mencegah event bubbling

        performSearch();
    }

    return (
        <input type="text" id="keyword" value={keyword} onChange={e => setKeyword(e.target.value)}
            className={`text-[14px] font-lato font-bold w-[300px] rounded-md p-2 bg-slate-50  focus:outline-none`}
            placeholder="Masukkan nama lokasi/area/alamat" onKeyDown={handleSearch} />
    )
})

Search.displayName = 'Search';

export default Search
