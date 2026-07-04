import { useState, useCallback } from 'react';
import { getVehicles as apiGetVehicles, saveVehicle as apiSaveVehicle, createVehicle as apiCreateVehicle, deleteVehicle as apiDeleteVehicle } from '../models/apiModel.js';
import { useAuth } from '../context/AuthContext.jsx';
import { addAuditLog } from '../models/auditModel.js';

export function useVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchVehicles = useCallback(async (page = 1, limit = 25) => {
    setLoading(true);
    try {
      const { vehicles: fetchedVehicles, totalCount } = await apiGetVehicles(page, limit);
      setVehicles(fetchedVehicles);
      setTotalVehicles(totalCount);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveVehicle = async (submissionData, remarks) => {
    try {
      const auditEntries = await apiSaveVehicle(submissionData, user.role, remarks);
      
      // Save generated audit logs
      if (auditEntries && auditEntries.length > 0) {
        for (const entry of auditEntries) {
          await addAuditLog(entry);
        }
      }

      await fetchVehicles(currentPage);
      return { success: true, auditEntries };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const createVehicle = async (submissionData, remarks) => {
    try {
      await apiCreateVehicle(submissionData, user.role);
      
      // Save initial audit log entry
      const auditEntry = {
        chassisNumber: submissionData.chassisNumber,
        customerName: submissionData.customerName,
        updatedBy: user.role,
        department: 'Customer Booking',
        previousStatus: 'None',
        newStatus: 'Booked',
        remarks: remarks || 'Initial customer booking files generated.'
      };
      try {
        await addAuditLog(auditEntry);
      } catch (auditErr) {
        console.error("Failed to save initial audit log:", auditErr);
      }

      await fetchVehicles(currentPage);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteVehicle = async (chassisNumber) => {
    try {
      await apiDeleteVehicle(chassisNumber, user.role);
      await fetchVehicles(currentPage);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return { vehicles, totalVehicles, currentPage, loading, error, fetchVehicles, saveVehicle, createVehicle, deleteVehicle };
}
