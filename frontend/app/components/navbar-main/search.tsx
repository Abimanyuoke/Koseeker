"use client"

import { useRouter } from "next/navigation"
import { KeyboardEvent, useState } from "react"

type Props = {
    url: string,
    search: string
}

const Search = ({ url, search }: Props) => {
    const [keyword, setKeyword] = useState<string>(search)
    const router = useRouter()

    const performSearch = () => {
        router.push(`${url}?search=${keyword}`, { scroll: false })
    }
    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return;
        e.preventDefault()
        performSearch()
    }
    const handleButtonClick = () => {
        performSearch()
    }

    return (
        <div className="flex items-center gap-2">
            <input type="text" id="keyword" value={keyword} onChange={e => setKeyword(e.target.value)}
                className={`text-[14px] font-lato font-bold w-[300px] rounded-md p-2 bg-slate-50  focus:outline-none`}
                placeholder="Masukkan nama lokasi/area/alamat" onKeyUp={handleKeyPress} />
            <button onClick={handleButtonClick} className="text-[16px] text-white cursor-pointer bg-primary font-bold px-8 py-2 rounded-sm" suppressHydrationWarning>Cari</button>
        </div>
    )
}
export default Search
