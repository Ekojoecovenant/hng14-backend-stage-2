import { Request, Response } from 'express';
import prisma from '../config/db';

export class ProfileController {
  async getProfiles(req: Request, res: Response) {
    try {
      const {
        gender, age_group, country_id,
        min_age, max_age,
        min_gender_probability, min_country_probability,
        sort_by = 'created_at',
        order = 'desc',
        page = 1,
        limit = 10
      } = req.query;

      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.min(50, Math.max(1, Number(limit)));

      const skip = (pageNum - 1) * limitNum;

      const where: any = {};

      // basic filters
      if (gender) where.gender = String(gender).toLowerCase();
      if (age_group) where.age_group = String(age_group).toLowerCase();

      if (country_id) {
        const code = String(country_id).toUpperCase().trim();
        where.country_id = code;
        // console.log(`${code}`)
      }

      // age range
      if (min_age || max_age) {
        where.age = {};
        if (min_age) where.age.gte = Number(min_age);
        if (max_age) where.age.lte = Number(max_age);
      }
        
      // probability filter
      if (min_gender_probability) {
        where.gender_probability = { gte: Number(min_gender_probability) };
      }
      if (min_country_probability) {
        where.country_probability = { gte: Number(min_gender_probability) };
      }

      //sorting
      const validSort = ['age', 'created_at', 'gender_probability'];
      const sortField = validSort.includes(String(sort_by)) ? String(sort_by) : 'created_at';
      const sortOrder = String(order).toLowerCase() === 'asc' ? 'asc' : 'desc';

      const [data, total] = await Promise.all([
        prisma.profile.findMany({
          where,
          orderBy: { [sortField]: sortOrder },
          skip,
          take: limitNum,
          select: {
            id: true,
            name: true,
            gender: true,
            age: true,
            age_group: true,
            country_id: true,
            country_name: true,
            gender_probability: true,
            country_probability: true,
            created_at: true
          }
        }),
        prisma.profile.count({ where })
      ]);

      res.json({
        status: 'success',
        page: pageNum,
        limit: limitNum,
        total,
        data
      });

    } catch (error: any) {
      console.error(error);
      res.status(500).json({
        status: 'error',
        message: 'Internal Server error',
      })
    }
  }

  async searchProfiles(req: Request, res: Response) {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim() === '') {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Query parameter q is required' 
      });
    }

    const query = q.toLowerCase().trim();
    const where: any = {};

    // Gender
    if (query.includes('male') && !query.includes('female')) where.gender = 'male';
    if (query.includes('female') && !query.includes('male')) where.gender = 'female';

    // Age group
    if (query.includes('young')) where.age = { gte: 16, lte: 24 };
    if (query.includes('teen') || query.includes('teenager')) where.age_group = 'teenager';
    if (query.includes('adult')) where.age_group = 'adult';
    if (query.includes('senior')) where.age_group = 'senior';
    if (query.includes('child')) where.age_group = 'child';

    // Age numbers
    const ageMatch = query.match(/(\d+)/);
    if (ageMatch) {
      const num = Number(ageMatch[0]);
      if (query.includes('above') || query.includes('over')) {
        where.age = { ...(where.age || {}), gte: num };
      }
      if (query.includes('below') || query.includes('under')) {
        where.age = { ...(where.age || {}), lte: num };
      }
    }

    // Country detection (simple keyword match)
    const countryMap: Record<string, string> = {
      'nigeria': 'NG', 'kenya': 'KE', 'ghana': 'GH', 'tanzania': 'TZ',
      'uganda': 'UG', 'rwanda': 'RW', 'angola': 'AO', 'south africa': 'ZA',
      'egypt': 'EG', 'morocco': 'MA', 'senegal': 'SN', 'dr congo': 'CD'
    };

    for (const [key, code] of Object.entries(countryMap)) {
      if (query.includes(key)) {
        where.country_id = code;
        break;
      }
    }

    if (Object.keys(where).length === 0) {
      return res.status(422).json({
        status: 'error',
        message: 'Unable to interpret query'
      });
    }

      const page = Number(req.query.page) || 1;
      const limit = Math.min(50, Number(req.query.limit) || 10);

    const [data, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.profile.count({ where })
    ]);

    res.json({
      status: 'success',
      page,
      limit,
      total,
      data
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}
}

export const profileController = new ProfileController();