// import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// export function SampleNextArrow(props: { className?: string; style?: any; onClick?: () => void }) {
//     const { onClick } = props;
//     return (
//         <div
//             onClick={onClick}
//             className="absolute bottom-[-50px] right-[45%] z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md cursor-pointer hover:shadow-lg transition">
//             <FaChevronRight className="text-gray-600" />
//         </div>
//     );
// }

// export function SamplePrevArrow(props: { className?: string; style?: any; onClick?: () => void }) {
//     const { onClick } = props;
//     return (
//         <div
//             onClick={onClick}
//             className="absolute bottom-[-50px] left-[45%] z-10  w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md cursor-pointer hover:shadow-lg transition">
//             <FaChevronLeft className="text-gray-600" />
//         </div>
//     );
// }


import { SlArrowLeft, SlArrowRight } from "react-icons/sl";

export function CustomArrows(props: { next: () => void; prev: () => void }) {
    const { next, prev } = props;

    return (
        <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 space-x-6 flex items-center gap-6">
            <button
                onClick={prev}
                className="bg-white shadow-lg shadow-gray-400/50 ring-1 ring-gray-300/30 w-10 h-10 flex items-center justify-center rounded-full cursor-pointer">
                <SlArrowLeft className="text-gray-700 text-xl" />
            </button>

            <span className="text-gray-700 font-semibold cursor-pointer hover:text-primary">
                Lihat semua promo
            </span>
            <button
                onClick={next}
                className="bg-white shadow-lg shadow-gray-400/50 ring-1 ring-gray-300/30 w-10 h-10 flex items-center justify-center rounded-full cursor-pointer">
                <SlArrowRight className="text-gray-700 text-xl" />
            </button>
        </div>
    );
}

