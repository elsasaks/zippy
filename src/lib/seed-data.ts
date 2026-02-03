import type { TimeCode, User } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export const DEFAULT_TIME_CODES: TimeCode[] = [
  {
    code: '2022 AR HOLD',
    description: 'Acc Receivables modules for Swedbank EE,LT,LV',
    activityCode: '500 - Development',
    functionCode: 'A500 - Default',
    startDate: '2022-01-01',
    endDate: '2027-12-31',
    favorite: true,
  },
  {
    code: 'IA1397',
    description: 'Acc Receivables modules for Swedbank EE,LT,LV',
    activityCode: '500 - Development',
    functionCode: 'A500 - Default',
    startDate: '2022-01-01',
    endDate: '2027-12-31',
    favorite: true,
  },
  {
    code: 'IA1468',
    description: 'Inv proc. auto for Swedbank EE,LT,LV branches',
    activityCode: '500 - Development',
    functionCode: 'A500 - Default',
    startDate: '2022-01-01',
    endDate: '2027-12-31',
    favorite: true,
  },
  {
    code: 'IA1416',
    description: 'Accounts Payable & Receivables data load BDW',
    activityCode: '500 - Development',
    functionCode: 'A500 - Default',
    startDate: '2022-01-01',
    endDate: '2027-12-31',
    favorite: true,
  },
  {
    code: 'IA1406',
    description: 'Acc data transformation from Loans source sys',
    activityCode: '500 - Development',
    functionCode: 'A500 - Default',
    startDate: '2022-01-01',
    endDate: '2027-12-31',
    favorite: true,
  },
  {
    code: 'IA1414',
    description: 'SEPA ISO 20022 migration',
    activityCode: '500 - Development',
    functionCode: 'A500 - Default',
    startDate: '2022-01-01',
    endDate: '2026-02-28',
    favorite: false,
  },
  {
    code: 'IA1500',
    description: 'Core Banking System Integration',
    activityCode: '500 - Development',
    functionCode: 'A500 - Default',
    startDate: '2025-01-01',
    endDate: '2027-12-31',
    favorite: false,
  },
  {
    code: 'SUPPORT',
    description: 'General support and maintenance',
    activityCode: '600 - Support',
    functionCode: 'A600 - Default',
    startDate: '2020-01-01',
    endDate: '2030-12-31',
    favorite: false,
  },
]

export function createDefaultUser(): User {
  return {
    id: uuidv4(),
    name: 'Default User',
    createdAt: new Date().toISOString(),
  }
}
