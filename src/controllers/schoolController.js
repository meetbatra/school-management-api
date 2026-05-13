const pool = require('../config/db');
const { getDistance } = require('../utils/haversine');

const addSchool = async (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  const [result] = await pool.query(
    'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
    [name, address, latitude, longitude]
  );

  return res.status(201).json({
    success: true,
    message: 'School added successfully',
    schoolId: result.insertId
  });
};

const listSchools = async (req, res) => {
  const userLat = parseFloat(req.query.latitude);
  const userLon = parseFloat(req.query.longitude);

  const [schools] = await pool.query('SELECT * FROM schools');

  if (schools.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'No schools found',
      data: []
    });
  }

  const schoolsWithDistance = schools.map(school => {
    const distance_km = getDistance(
      userLat, 
      userLon, 
      parseFloat(school.latitude), 
      parseFloat(school.longitude)
    );
    return {
      ...school,
      distance_km
    };
  });

  schoolsWithDistance.sort((a, b) => a.distance_km - b.distance_km);

  return res.status(200).json({
    success: true,
    count: schoolsWithDistance.length,
    data: schoolsWithDistance
  });
};

module.exports = {
  addSchool,
  listSchools
};
