import { request, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import { BASE_URL, SECRET } from "../global";
import { v4 as uuidv4 } from "uuid";
import md5 from "md5";
import { sign } from "jsonwebtoken";

const prisma = new PrismaClient({ errorFormat: "pretty" })

export const getAllComments = async (req: Request, res: Response) => {
    try {
        const comments = await prisma.comment.findMany()
        res.json(comments)
    } catch (error) {
        console.error("Error fetching comments:", error)
        res.status(500).json({ error: "Internal server error" })
    }
}

export const createComment = async (req: Request, res: Response) => {
    const { kosId, userId, content } = req.body

    if (!kosId || !userId || !content) {
        return res.status(400).json({ error: "Missing required fields" })
    }

    try {
        const newComment = await prisma.comment.create({
            data: {
                kosId,
                userId,
                content
            }
        })
        res.status(201).json(newComment)
    } catch (error) {
        console.error("Error creating comment:", error)
        res.status(500).json({ error: "Internal server error" })
    }
}

export const deleteComment = async (req: Request, res: Response) => {
    const { id } = req.params

    if (!id) {
        return res.status(400).json({ error: "Missing required fields" })
    }

    try {
        const deletedComment = await prisma.comment.delete({
            where: { id: Number(id) }
        })
        res.status(200).json(deletedComment)
    } catch (error) {
        console.error("Error deleting comment:", error)
        res.status(500).json({ error: "Internal server error" })
    }
}

export const updateComment = async (req: Request, res: Response) => {
    const { id } = req.params
    const { content } = req.body

    if (!id || !content) {
        return res.status(400).json({ error: "Missing required fields" })
    }

    try {
        const updatedComment = await prisma.comment.update({
            where: { id: Number(id) },
            data: { content }
        })
        res.status(200).json(updatedComment)
    } catch (error) {
        console.error("Error updating comment:", error)
        res.status(500).json({ error: "Internal server error" })
    }
}
