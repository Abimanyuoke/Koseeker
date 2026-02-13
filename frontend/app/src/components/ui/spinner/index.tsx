import Image from "next/image";
import { motion } from "framer-motion";

interface SpinnerProps {
    className?: string;
    src?: string;
    width?: number;
    height?: number;
}

export default function Spinner({ className, src = "", height, width }: SpinnerProps) {
    return (
        <div className={`flex items-center justify-center h-screen ${className}`}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="w-20 h-20">
                <Image
                    src={src}
                    alt="Spinner"
                    width={width}
                    height={height}
                    className="object-contain"/>
            </motion.div>
        </div>
    );
}
