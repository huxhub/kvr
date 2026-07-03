import Vehicle from '../models/Vehicle.js';

export const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({}, '-__v').lean();
    // Return chassisNumber as top-level id for frontend compatibility
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createVehicle = async (req, res) => {
  try {
    const newVehicle = new Vehicle(req.body);
    const saved = await newVehicle.save();
    res.status(201).json(saved.toObject());
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Chassis Number already exists' });
    }
    res.status(400).json({ error: error.message });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params; // id = chassisNumber
    const updated = await Vehicle.findOneAndUpdate(
      { chassisNumber: id },
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Vehicle.findOneAndDelete({ chassisNumber: id });

    if (!result) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json({ message: 'Vehicle deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
