"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { IoMdHeartEmpty } from "react-icons/io";

interface LikeButtonProps {
    kosId: number;
    userId: number;
    token: string;
}

export default function LikeButton({ kosId, userId, token }: LikeButtonProps) {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    // 🔹 ambil status like + jumlah like saat mount
    useEffect(() => {
        const fetchLikeStatus = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/like/check/${kosId}/${userId}`);
                setLiked(res.data.data.liked);

                const countRes = await axios.get(`http://localhost:5000/like/kos/${kosId}`);
                setLikeCount(countRes.data.data.count);
            } catch (err) {
                console.error(err);
            }
        };
        fetchLikeStatus();
    }, [kosId, userId]);

    // 🔹 handle klik tombol like
    const toggleLike = async () => {
        try {
            const res = await axios.post(
                `http://localhost:5000/like/toggle`,
                { kosId, userId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update UI sesuai response
            setLiked(res.data.data.liked);
            setLikeCount(res.data.data.count);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <button
            onClick={toggleLike}
            className="flex items-center gap-2 text-red-500"
        >
            {liked ? <IoMdHeartEmpty  size={24} /> : <FaRegHeart size={24} />}
            <span>{likeCount}</span>
        </button>
    );
}
