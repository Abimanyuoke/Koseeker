import Image from "next/image";
import { motion } from "framer-motion";

export default function Spinner() {
    return (
        <div className="flex items-center justify-center h-screen">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="w-20 h-20"
            >
                <Image
                    src="/ninja-logo.png" 
                    alt="Spinner"
                    width={80}
                    height={80}
                    className="object-contain"
                />
            </motion.div>
        </div>
    );
}
