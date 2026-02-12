import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import { BASE_URL, SECRET } from "../types/global";
import { v4 as uuidv4 } from "uuid";
import md5 from "md5";
import { sign } from "jsonwebtoken";


const prisma = new PrismaClient({ errorFormat: "pretty" })

export const getAllUsers = async (request: Request, response: Response) => {
    try {
        /** get requested data (data has been sent from request) */
        const { search } = request.query

        /** process to get user, contains means search name of user based on sent keyword */
        const allUser = await prisma.user.findMany({
            where: { name: { contains: search?.toString() || "" } }
        })

        return response.json({
            status: true,
            data: allUser,
            message: `user has retrieved`
        }).status(200)
    } catch (error) {
        return response
            .json({
                status: false,
                message: `There is an error. ${error}`
            })
            .status(400)
    }
}

export const getUserById = async (request: Request, response: Response) => {
    try {
        const { id } = request.params;

        if (!id) {
            return response.status(400).json({
                status: false,
                message: 'User ID is required'
            });
        }

        const userId = Number(id);

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return response.status(404).json({
                status: false,
                message: `User not found`
            });
        }

        return response.json({
            status: true,
            data: user,
            message: `User has been retrieved`
        }).status(200);
    } catch (error) {
        return response
            .json({
                status: false,
                message: `There is an error. ${error}`
            })
            .status(400);
    }
}

export const createUser = async (request: Request, response: Response) => {
    try {
        /** get requested data (data has been sent from request) */
        const { name, email, password, role, phone } = request.body
        const uuid = uuidv4()

        /** variable filename use to define of uploaded file name */
        let filename = ""
        if (request.file) filename = request.file.filename /** get file name of uploaded file */

        /** process to save new user */
        const newUser = await prisma.user.create({
            data: { uuid, name, email, password: md5(password), role, profile_picture: filename, phone }
        })

        return response.json({
            status: true,
            data: newUser,
            message: `New user has created`
        }).status(200)
    } catch (error) {
        return response
            .json({
                status: false,
                message: `There is an error. ${error}`
            })
            .status(400)
    }
}



export const updateUser = async (request: Request, response: Response) => {
    try {
        const { id } = request.params
        const { name, email, password, role, phone } = request.body

        const findUser = await prisma.user.findFirst({ where: { id: Number(id) } })
        if (!findUser) return response
            .status(404)
            .json({ status: false, message: `user is not found` })

        let filename = findUser.profile_picture
        if (request.file) {
            filename = request.file.filename
            let path = `${BASE_URL}/../public/profile_picture/${findUser.profile_picture}`
            let exists = fs.existsSync(path)
            if (exists && findUser.profile_picture !== ``) fs.unlinkSync(path)
        }

        const updatedUser = await prisma.user.update({
            data: {
                name: name || findUser.name,
                email: email || findUser.email,
                password: password ? md5(password) : findUser.password,
                role: role || findUser.role,
                phone: phone || findUser.phone,
                profile_picture: filename
            },
            where: { id: Number(id) }
        })

        return response.json({
            status: true,
            data: updatedUser,
            message: `user has updated`
        }).status(200)
    } catch (error) {
        return response
            .json({
                status: false,
                message: `There is an error. ${error}`
            })
            .status(400)
    }
}

export const changePassword = async (request: Request, response: Response) => {
    try {
        const { id } = request.params
        const { currentPassword, newPassword } = request.body

        const findUser = await prisma.user.findFirst({ where: { id: Number(id) } })
        if (!findUser) return response
            .status(404)
            .json({ status: false, message: `User is not found` })

        if (md5(currentPassword) !== findUser.password) {
            return response
                .status(400)
                .json({ status: false, message: `Password lama tidak sesuai` })
        }

        const updatedUser = await prisma.user.update({
            data: {
                password: md5(newPassword)
            },
            where: { id: Number(id) }
        })

        return response.json({
            status: true,
            data: updatedUser,
            message: `Password has been changed`
        }).status(200)
    } catch (error) {
        return response
            .json({
                status: false,
                message: `There is an error. ${error}`
            })
            .status(400)
    }
}

export const changePicture = async (request: Request, response: Response) => {
    try {
        const { id } = request.params

        const findUser = await prisma.user.findFirst({ where: { id: Number(id) } })
        if (!findUser) return response
            .status(200)
            .json({ status: false, message: `User is not found` })

        let filename = findUser.profile_picture
        if (request.file) {
            filename = request.file.filename
            let path = `${BASE_URL}/../public/profile_picture/${findUser.profile_picture}`
            let exists = fs.existsSync(path)
            if (exists && findUser.profile_picture !== ``) fs.unlinkSync(path)
        }

        const updatePicture = await prisma.user.update({
            data: { profile_picture: filename },
            where: { id: Number(id) }
        })

        return response.json({
            status: true,
            data: updatePicture,
            message: `Picture has changed`
        }).status(200)
    } catch (error) {
        return response.json({
            status: false,
            message: `There is an error. ${error}`
        }).status(400)
    }
}

export const deleteUser = async (request: Request, response: Response) => {
    try {
        const { id } = request.params
        const findUser = await prisma.user.findFirst({ where: { id: Number(id) } })
        if (!findUser) return response
            .status(200)
            .json({ status: false, message: `user is not found` })

        let path = `${BASE_URL}/public/profile_picture/${findUser.profile_picture}`
        let exists = fs.existsSync(path)
        if (exists && findUser.profile_picture !== ``) fs.unlinkSync(path)


        const deleteduser = await prisma.user.delete({
            where: { id: Number(id) }
        })
        return response.json({
            status: true,
            data: deleteduser,
            message: `user has deleted`
        }).status(200)
    } catch (error) {
        return response
            .json({
                status: false,
                message: `There is an error. ${error}`
            })
            .status(400)
    }
}

export const authentication = async (request: Request, response: Response) => {
    try {
        const { email, password } = request.body

        const findUser = await prisma.user.findFirst({
            where: { email, password: md5(password) }
        })

        if (!findUser) return response
            .status(200)
            .json({ status: false, logged: false, message: `Email or password is invalid` })

        let data = {
            id: findUser.id,
            name: findUser.name,
            email: findUser.email,
            role: findUser.role,
            profile_picture: findUser.profile_picture,
        }

        let payload = JSON.stringify(data)

        let token = sign(payload, SECRET || "joss")

        return response
            .status(200)
            .json({ status: true, logged: true, data: data, message: `Login Success`, token })
    } catch (error) {
        return response
            .json({
                status: false,
                message: `There is an error. ${error}`
            })
            .status(400)
    }
}

export const googleAuthentication = async (request: Request, response: Response) => {
    try {
        const { email, name, googleId, picture } = request.body

        console.log('Google Auth - Received data:', { email, name, googleId, picture })

        let findUser = await prisma.user.findFirst({
            where: { email }
        })

        if (!findUser) {
            const uuid = uuidv4()
            findUser = await prisma.user.create({
                data: {
                    uuid,
                    name: name || '',
                    email: email || '',
                    password: md5(googleId),
                    role: 'society',
                    profile_picture: picture || '',
                    phone: ''
                }
            })
        } else {
            if (picture && picture.startsWith('https://')) {
                findUser = await prisma.user.update({
                    where: { id: findUser.id },
                    data: {
                        profile_picture: picture
                    }
                })
            }
        }

        let data = {
            id: findUser.id,
            name: findUser.name,
            email: findUser.email,
            role: findUser.role,
            profile_picture: findUser.profile_picture,
        }

        console.log('Google Auth - Returning user data:', data)

        let payload = JSON.stringify(data)

        let token = sign(payload, SECRET || "joss")

        return response
            .status(200)
            .json({ status: true, logged: true, data: data, message: `Google Login Success`, token })
    } catch (error) {
        return response
            .json({
                status: false,
                message: `There is an error. ${error}`
            })
            .status(400)
    }
}