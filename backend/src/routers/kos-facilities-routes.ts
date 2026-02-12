import express from "express";
import {
    getKosFacilities,
    getFacilityById,
    addKosFacility,
    addMultipleFacilities,
    updateKosFacility,
    deleteKosFacility,
    deleteMultipleFacilities
} from "../controllers/kos-faclities-controller";
import {
    verifyAddFacility,
    verifyAddMultipleFacilities,
    verifyUpdateFacility,
    verifyDeleteMultipleFacilities,
    verifyFacilityId,
    verifyKosId
} from "../validators/kos-facilities-validation";

const app = express();
app.use(express.json());

app.get("/kos/:kosId", verifyKosId, getKosFacilities);
app.get("/:id", verifyFacilityId, getFacilityById);
app.post("/", verifyAddFacility, addKosFacility);
app.post("/multiple", verifyAddMultipleFacilities, addMultipleFacilities);
app.put("/:id", verifyFacilityId, verifyUpdateFacility, updateKosFacility);
app.delete("/:id", verifyFacilityId, deleteKosFacility);
app.delete("/kos/:kosId/multiple", verifyKosId, verifyDeleteMultipleFacilities, deleteMultipleFacilities);

export default app;
