import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export function SampleNextArrow(props: { className?: string; style?: any; onClick?: () => void }) {
    const { onClick } = props;
    return (
        <div
            onClick={onClick}
            className="absolute top-1/2 right-5 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md cursor-pointer hover:shadow-lg transition">
            <FaChevronRight className="text-gray-600" />
        </div>
    );
}

export function SamplePrevArrow(props: { className?: string; style?: any; onClick?: () => void }) {
    const { onClick } = props;
    return (
        <div
            onClick={onClick}
            className="absolute top-1/2 left-5 -translate-y-1/2 z-10  w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md cursor-pointer hover:shadow-lg transition">
            <FaChevronLeft className="text-gray-600" />
        </div>
    );
}
