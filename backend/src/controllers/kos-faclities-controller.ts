import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ errorFormat: "pretty" });

export const getKosFacilities = async (request: Request, response: Response) => {
    try {
        const { kosId } = request.params;

        if (!kosId) {
            return response.status(400).json({
                status: false,
                message: "Kos ID is required"
            });
        }

        const kos = await prisma.kos.findUnique({
            where: { id: Number(kosId) }
        });

        if (!kos) {
            return response.status(404).json({
                status: false,
                message: "Kos not found"
            });
        }

        const facilities = await prisma.kosFacility.findMany({
            where: { kosId: Number(kosId) },
            orderBy: { createdAt: 'desc' }
        });

        return response.status(200).json({
            status: true,
            data: facilities,
            message: "Kos facilities retrieved successfully"
        });

    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

export const getFacilityById = async (request: Request, response: Response) => {
    try {
        const { id } = request.params;

        const facility = await prisma.kosFacility.findUnique({
            where: { id: Number(id) },
            include: {
                kos: {
                    select: {
                        id: true,
                        name: true,
                        uuid: true
                    }
                }
            }
        });

        if (!facility) {
            return response.status(404).json({
                status: false,
                message: "Facility not found"
            });
        }

        return response.status(200).json({
            status: true,
            data: facility,
            message: "Facility retrieved successfully"
        });

    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

export const addKosFacility = async (request: Request, response: Response) => {
    try {
        const { kosId, facility } = request.body;

        const kos = await prisma.kos.findUnique({
            where: { id: Number(kosId) }
        });

        if (!kos) {
            return response.status(404).json({
                status: false,
                message: "Kos not found"
            });
        }

        const existingFacility = await prisma.kosFacility.findFirst({
            where: {
                kosId: Number(kosId),
                facility: facility.trim()
            }
        });

        if (existingFacility) {
            return response.status(400).json({
                status: false,
                message: "This facility already exists for this kos"
            });
        }

        const newFacility = await prisma.kosFacility.create({
            data: {
                kosId: Number(kosId),
                facility: facility.trim()
            },
            include: {
                kos: {
                    select: {
                        id: true,
                        name: true,
                        uuid: true
                    }
                }
            }
        });

        return response.status(201).json({
            status: true,
            data: newFacility,
            message: "Facility added successfully"
        });

    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

export const addMultipleFacilities = async (req: Request, res: Response) => {
    try {
        const { kosId, facilities } = req.body;

        const kos = await prisma.kos.findUnique({
            where: { id: Number(kosId) }
        });

        if (!kos) {
            return res.status(404).json({
                status: false,
                message: "Kos not found"
            });
        }

        const facilitiesData = facilities.map((fac: { facility: string }) => ({
            kosId: Number(kosId),
            facility: fac.facility.trim()
        }));

        const newFacilities = await prisma.kosFacility.createMany({
            data: facilitiesData,
            skipDuplicates: true
        });

        res.status(201).json({
            status: true,
            message: "Facilities added successfully",
            data: newFacilities
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: (error instanceof Error) ? error.message : String(error)
        });
    }
};

export const updateKosFacility = async (request: Request, response: Response) => {
    try {
        const { id } = request.params;
        const { facility } = request.body;

        const existingFacility = await prisma.kosFacility.findUnique({
            where: { id: Number(id) }
        });

        if (!existingFacility) {
            return response.status(404).json({
                status: false,
                message: "Facility not found"
            });
        }

        const duplicateFacility = await prisma.kosFacility.findFirst({
            where: {
                kosId: existingFacility.kosId,
                facility: facility.trim(),
                id: { not: Number(id) }
            }
        });

        if (duplicateFacility) {
            return response.status(400).json({
                status: false,
                message: "This facility name already exists for this kos"
            });
        }

        const updatedFacility = await prisma.kosFacility.update({
            where: { id: Number(id) },
            data: { facility: facility.trim() },
            include: {
                kos: {
                    select: {
                        id: true,
                        name: true,
                        uuid: true
                    }
                }
            }
        });

        return response.status(200).json({
            status: true,
            data: updatedFacility,
            message: "Facility updated successfully"
        });

    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

export const deleteKosFacility = async (request: Request, response: Response) => {
    try {
        const { id } = request.params;

        const facility = await prisma.kosFacility.findUnique({
            where: { id: Number(id) }
        });

        if (!facility) {
            return response.status(404).json({
                status: false,
                message: "Facility not found"
            });
        }

        const deletedFacility = await prisma.kosFacility.delete({
            where: { id: Number(id) }
        });

        return response.status(200).json({
            status: true,
            data: deletedFacility,
            message: "Facility deleted successfully"
        });

    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};

export const deleteMultipleFacilities = async (request: Request, response: Response) => {
    try {
        const { kosId } = request.params;
        const { facilityIds } = request.body;

        if (!facilityIds || !Array.isArray(facilityIds) || facilityIds.length === 0) {
            return response.status(400).json({
                status: false,
                message: "Facility IDs array is required"
            });
        }

        const kos = await prisma.kos.findUnique({
            where: { id: Number(kosId) }
        });

        if (!kos) {
            return response.status(404).json({
                status: false,
                message: "Kos not found"
            });
        }

        const facilities = await prisma.kosFacility.findMany({
            where: {
                id: { in: facilityIds.map(id => Number(id)) },
                kosId: Number(kosId)
            }
        });

        if (facilities.length !== facilityIds.length) {
            return response.status(400).json({
                status: false,
                message: "Some facilities not found or don't belong to this kos"
            });
        }

        const deletedFacilities = await prisma.kosFacility.deleteMany({
            where: {
                id: { in: facilityIds.map(id => Number(id)) },
                kosId: Number(kosId)
            }
        });

        return response.status(200).json({
            status: true,
            data: { deletedCount: deletedFacilities.count },
            message: `${deletedFacilities.count} facilities deleted successfully`
        });

    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `There is an error: ${error}`
        });
    }
};
