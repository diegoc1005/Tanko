import { Request, Response } from 'express';
import { unitRepository, CreateUnitDTO, UpdateUnitDTO } from '../repositories/unit.repository.js';

export class UnitController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const activeOnly = req.query.active === 'true';
      const units = activeOnly
        ? await unitRepository.findActive()
        : await unitRepository.findAll();
      res.status(200).json({ success: true, data: units });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch units',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const unit = await unitRepository.findById(req.params.id);
      if (!unit) {
        res.status(404).json({ success: false, error: 'Unit not found' });
        return;
      }
      res.status(200).json({ success: true, data: unit });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch unit',
      });
    }
  }

  async getByUserId(req: Request, res: Response): Promise<void> {
    try {
      const units = await unitRepository.findByUserId(req.params.userId);
      res.status(200).json({ success: true, data: units });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch units',
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateUnitDTO = req.body;
      const unit = await unitRepository.create(data);
      res.status(201).json({ success: true, data: unit });
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(400).json({ success: false, error: 'Unit with this plates already exists' });
        return;
      }
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create unit',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const data: UpdateUnitDTO = req.body;
      const unit = await unitRepository.update(req.params.id, data);
      res.status(200).json({ success: true, data: unit });
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ success: false, error: 'Unit not found' });
        return;
      }
      if (error.code === 'P2002') {
        res.status(400).json({ success: false, error: 'Unit with this plates already exists' });
        return;
      }
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update unit',
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await unitRepository.delete(req.params.id);
      res.status(200).json({ success: true, message: 'Unit deleted' });
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ success: false, error: 'Unit not found' });
        return;
      }
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete unit',
      });
    }
  }
}

export const unitController = new UnitController();
