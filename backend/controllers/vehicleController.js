import * as Vehicle from '../models/Vehicle.js';

export const getVehicles = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    
    // Enforce strict limit <= 25
    const activeLimit = Math.min(25, Math.max(1, limit));

    const sessionUser = req.session.user;
    const isBranchRestricted = sessionUser?.role !== 'ADMIN';
    const userBranch = sessionUser?.branch;

    let vehicles, totalCount;

    if (isBranchRestricted && userBranch) {
      // Non-Admin: only see their own branch's vehicles
      [vehicles, totalCount] = await Promise.all([
        Vehicle.findByBranch(userBranch, page, activeLimit),
        Vehicle.countByBranch(userBranch)
      ]);
    } else {
      // ADMIN, CRM, etc.: see all vehicles
      [vehicles, totalCount] = await Promise.all([
        Vehicle.findAll(page, activeLimit),
        Vehicle.countAll()
      ]);
    }

    // Expose headers for cross-origin or local clients
    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count, X-Page, X-Limit');
    res.setHeader('X-Total-Count', totalCount.toString());
    res.setHeader('X-Page', page.toString());
    res.setHeader('X-Limit', activeLimit.toString());

    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createVehicle = async (req, res) => {
  try {
    const saved = await Vehicle.create(req.body);
    res.status(201).json(saved);
  } catch (error) {
    // MySQL ER_DUP_ENTRY error code for unique chassisNumber
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Chassis Number already exists' });
    }
    res.status(400).json({ error: error.message });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params; // id = chassisNumber
    const updated = await Vehicle.updateByChassis(id, req.body);

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
    const deleted = await Vehicle.deleteByChassis(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json({ message: 'Vehicle deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
