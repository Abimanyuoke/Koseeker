"use client"

import React, { FormEvent, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { BASE_API_URL } from "../../../global";
import { getCookies } from "../../../lib/client-cookies";
import { IUser } from "../../../app/types";
import { post } from "../../../lib/bridge";
import FileInput from "../../components/fileInput"
import { IoEyeSharp } from "react-icons/io5";
import { HiEyeSlash } from "react-icons/hi2";
import Image from "next/image";
import imgSignup from "../../../public/images/kosimage.jpeg"
import { BsFillTelephoneForwardFill } from "react-icons/bs";
import { MdEmail } from "react-icons/md";
import { FaImage, FaLock, FaUser } from "react-icons/fa";
import logo from "../../../public/images/logo.svg";

export default function SignUp() {

    const [user, setUser] = useState<IUser>({
        id: 0,
        uuid: ``,
        name: ``,
        email: ``,
        password: ``,
        profile_picture: ``,
        role: `society`,
        createdAt: ``,
        updatedAt: ``,
        phone: ``
    })
    const router = useRouter()
    const TOKEN = getCookies("token") || ""
    const [file, setFile] = useState<File | null>(null)
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const handleSubmit = async (e: FormEvent) => {
        try {
            e.preventDefault()
            setIsLoading(true)
            const url = `${BASE_API_URL}/user`
            const { name, email, password, role, phone } = user
            const payload = new FormData()
            payload.append("name", name || "")
            payload.append("email", email || "")
            payload.append("password", password || "")
            payload.append("role", role || "society")
            payload.append("phone", phone || "")
            if (file !== null) payload.append("profile_picture", file)

            const response = await post(url, payload, TOKEN)
            const data = response as { status: boolean; message: string }

            if (data.status) {
                toast.success("Your account has been created, please Login")
                setTimeout(() => {
                    router.replace(`/auth/login`)
                }, 2000)
            } else {
                toast.warning("Your password or email is wrong", { duration: 2000 })
            }
        } catch (error) {
            console.error(error)
            toast.error(`Something went wrong`, { duration: 2000 })
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <div className="bg-gradient-to-br from-green-50 min-h-screen w-full relative overflow-hidden font-lato ">
            {/* Animated Background Blobs */}
            {/* <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div> */}

            <div className="w-full min-h-screen flex justify-center items-center relative py-8 px-4">
                <div className="relative flex max-w-5xl w-full shadow-2xl rounded-2xl overflow-hidden backdrop-blur-sm bg-white/80">
                    {/* Left Side - Image with Overlay */}
                    <div className="hidden lg:block lg:w-1/2 relative">
                        <div className="relative h-full">
                            <Image
                                src={imgSignup}
                                alt="Signup Koseeker"
                                fill
                                className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-10">
                                <div className="space-y-4">
                                    <h2 className="text-5xl font-bold leading-tight">
                                        Start Your
                                        <span className="block">Journey Today</span>
                                    </h2>
                                    <p className="text-[15px] text-white/90 leading-relaxed max-w-md">
                                        Join thousands of students finding their perfect kos. Your comfortable home away from home awaits!
                                    </p>
                                    {/* <div className="flex gap-2 pt-4">
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Signup Form */}
                    <div className="w-full lg:w-1/2 p-8 lg:px-12 bg-white relative overflow-y-hidden max-h-[95vh]">
                        {/* Logo and Header */}
                        <div className="flex flex-col items-center mb-4 ">
                            <div className="relative mb-1">
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                                <Image
                                    src={logo}
                                    alt="Koseeker Logo"
                                    width={70}
                                    height={70}
                                    className="relative object-cover drop-shadow-lg"
                                />
                            </div>
                            <h1 className="text-3xl font-black text-gray-800 mb-2">Create Account</h1>
                            <p className="text-gray-500 text-sm">Fill in your details to get started</p>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {/* Name Field */}
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                                    <FaUser className="text-base" />
                                </div>
                                <input
                                    id="name"
                                    type="text"
                                    value={user.name}
                                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                                    required
                                    placeholder="Full Name"
                                    className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-400 rounded-md focus:outline-none focus:border-primary transition-all duration-300 text-gray-700 placeholder:text-gray-400 placeholder:text-sm"
                                />
                            </div>

                            {/* Email Field */}
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                                    <MdEmail className="text-base" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={user.email}
                                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                                    required
                                    placeholder="Email Address"
                                    className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-400 rounded-md focus:outline-none focus:border-primary transition-all duration-300 text-gray-700 placeholder:text-gray-400 placeholder:text-sm"
                                />
                            </div>

                            {/* Phone Field */}
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                                    <BsFillTelephoneForwardFill className="text-sm" />
                                </div>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={user.phone}
                                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                                    required
                                    placeholder="+62 812-3456-7890"
                                    className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-400 rounded-md focus:outline-none focus:border-primary transition-all duration-300 text-gray-700 placeholder:text-gray-400 placeholder:text-sm"
                                />
                            </div>

                            {/* Password Field */}
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                                    <FaLock className="text-base" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={user.password}
                                    onChange={(e) => setUser({ ...user, password: e.target.value })}
                                    required
                                    placeholder="Password"
                                    className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-400 rounded-md focus:outline-none focus:border-primary transition-all duration-300 text-gray-700 placeholder:text-gray-400 placeholder:text-sm" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
                                    {showPassword ? (
                                        <IoEyeSharp className="text-xl" />
                                    ) : (
                                        <HiEyeSlash className="text-xl" />
                                    )}
                                </button>
                            </div>

                            {/* File Upload */}
                            <div className="relative">
                                <FaImage className="absolute left-3 top-1/2 translate-y-0.5 transform  text-gray-400 text-lg"/>
                                    <FileInput
                                        acceptTypes={["image/png", "image/jpeg", "image/jpg"]}
                                        id="profile_picture"
                                        className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-400 rounded-md focus:outline-none focus:border-primary transition-all duration-300 text-gray-700 placeholder:text-gray-400"
                                        label="Profile Picture (Optional)"
                                        onChange={(f) => setFile(f)}
                                        required={false}/>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-3 uppercase text-sm font-semibold bg-primary shadow-lg p-[10px] hover:text-white duration-200 transition-all hover:scale-105 text-white py-2 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating Account...
                                    </span>
                                ) : (
                                    "Create Account"
                                )}
                            </button>


                            {/* Login Link */}
                            <div className="text-center pt-4">
                                <p className="text-gray-600 text-sm">
                                    Already have an account?{" "}
                                    <button
                                        type="button"
                                        onClick={() => router.push("/auth/login")}
                                        className="text-primary font-semibold hover:underline transition-all cursor-pointer">
                                        Login here
                                    </button>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style> */}
        </div>
    )
}

