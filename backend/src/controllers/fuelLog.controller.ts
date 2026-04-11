import { Request, Response } from 'express';
import { fuelLogRepository, CreateFuelLogDTO, UpdateFuelLogDTO } from '../repositories/fuelLog.repository.js';

export class FuelLogController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const logs = await fuelLogRepository.findAll();
      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch fuel logs',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const log = await fuelLogRepository.findById(req.params.id);
      if (!log) {
        res.status(404).json({ success: false, error: 'Fuel log not found' });
        return;
      }
      res.status(200).json({ success: true, data: log });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch fuel log',
      });
    }
  }

  async getByUnitId(req: Request, res: Response): Promise<void> {
    try {
      const logs = await fuelLogRepository.findByUnitId(req.params.unitId);
      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch fuel logs',
      });
    }
  }

  async getByUserId(req: Request, res: Response): Promise<void> {
    try {
      const logs = await fuelLogRepository.findByUserId(req.params.userId);
      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch fuel logs',
      });
    }
  }

  async getByDateRange(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        res.status(400).json({ success: false, error: 'startDate and endDate are required' });
        return;
      }
      const logs = await fuelLogRepository.findByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch fuel logs',
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateFuelLogDTO = {
        ...req.body,
        date: new Date(req.body.date),
      };
      const log = await fuelLogRepository.create(data);
      res.status(201).json({ success: true, data: log });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create fuel log',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const data: UpdateFuelLogDTO = {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : undefined,
      };
      const log = await fuelLogRepository.update(req.params.id, data);
      res.status(200).json({ success: true, data: log });
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ success: false, error: 'Fuel log not found' });
        return;
      }
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update fuel log',
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await fuelLogRepository.delete(req.params.id);
      res.status(200).json({ success: true, message: 'Fuel log deleted' });
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ success: false, error: 'Fuel log not found' });
        return;
      }
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete fuel log',
      });
    }
  }
}

export const fuelLogController = new FuelLogController();
