const { z } = require('zod');

const addSchoolSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  address: z.string().trim().min(1, "Address is required").max(255),
  latitude: z.coerce.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90"),
  longitude: z.coerce.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180")
});

const listSchoolsSchema = z.object({
  latitude: z.coerce.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90"),
  longitude: z.coerce.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180")
});

module.exports = {
  addSchoolSchema,
  listSchoolsSchema
};
