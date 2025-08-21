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

    const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return;
        e.preventDefault()
        router.push(`${url}?search=${keyword}`)
    }

    return (
        <input type="text" id="keyword" value={keyword} onChange={e => setKeyword(e.target.value)}
            className={`text-[14px] font-lato font-bold w-[300px] rounded-md p-2 bg-slate-50  focus:outline-none`}
            placeholder="Masukkan nama lokasi/area/alamat" onKeyUp={handleSearch} />
    )
}
export default Search
