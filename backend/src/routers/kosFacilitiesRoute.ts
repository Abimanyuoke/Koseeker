import express from "express";
import {
    getKosFacilities,
    getFacilityById,
    addKosFacility,
    addMultipleFacilities,
    updateKosFacility,
    deleteKosFacility,
    deleteMultipleFacilities
} from "../controllers/kosFaclities";
import {
    verifyAddFacility,
    verifyAddMultipleFacilities,
    verifyUpdateFacility,
    verifyDeleteMultipleFacilities,
    verifyFacilityId,
    verifyKosId
} from "../middlewares/kosFacilitiesValidation";
import { verifyToken, verifyRole } from "../middlewares/authorization";

const app = express();
app.use(express.json());

// Get all facilities for a specific kos
// GET /facilities/kos/:kosId
app.get("/kos/:kosId", verifyKosId, getKosFacilities);

// Get specific facility by ID
// GET /facilities/:id
app.get("/:id", verifyFacilityId, getFacilityById);

// Add a single facility to a kos
// POST /facilities
app.post("/", verifyAddFacility, addKosFacility);

// Add multiple facilities to a kos
// POST /facilities/multiple
app.post("/multiple", verifyAddMultipleFacilities, addMultipleFacilities);

// Update a facility
// PUT /facilities/:id
app.put("/:id", verifyFacilityId, verifyUpdateFacility, updateKosFacility);

// Delete a single facility
// DELETE /facilities/:id
app.delete("/:id", verifyFacilityId, deleteKosFacility);

// Delete multiple facilities for a kos
// DELETE /facilities/kos/:kosId/multiple
app.delete("/kos/:kosId/multiple", verifyKosId, verifyDeleteMultipleFacilities, deleteMultipleFacilities);

export default app;
