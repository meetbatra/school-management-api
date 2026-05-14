const pool = require('../config/db');
const { getDistance } = require('../utils/haversine');
const AppError = require('../utils/AppError');

const addSchool = async (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  const [result] = await pool.query(
    'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
    [name, address, latitude, longitude]
  );

  if (!result?.insertId) {
    throw new AppError('Failed to add school', 500, 'SCHOOL_CREATE_FAILED');
  }

  return res.status(201).json({
    success: true,
    message: 'School added successfully',
    schoolId: result.insertId
  });
};

const listSchools = async (req, res) => {
  const userLat = Number(req.query.latitude);
  const userLon = Number(req.query.longitude);

  if (!Number.isFinite(userLat) || !Number.isFinite(userLon)) {
    throw new AppError('Invalid coordinates', 400, 'INVALID_COORDINATES');
  }

  const [schools] = await pool.query('SELECT * FROM schools');

  if (!Array.isArray(schools) || schools.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'No schools found',
      data: []
    });
  }

  const schoolsWithDistance = schools
    .map((school) => {
      const schoolLat = Number(school.latitude);
      const schoolLon = Number(school.longitude);

      if (!Number.isFinite(schoolLat) || !Number.isFinite(schoolLon)) {
        return null;
      }

      const distance_km = getDistance(userLat, userLon, schoolLat, schoolLon);

      return {
        ...school,
        distance_km
      };
    })
    .filter(Boolean);

  return res.status(200).json({
    success: true,
    count: schoolsWithDistance.length,
    data: schoolsWithDistance.sort((a, b) => a.distance_km - b.distance_km)
  });
};

module.exports = {
  addSchool,
  listSchools
};
