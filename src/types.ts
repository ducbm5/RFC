/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Runner {
  userId: string;
  cuLy: string;
  gioiTinh: string;
  namSinh: number;
  tuoi: number;
  thoiGianTao: string;
}

export interface AgeGroupStat {
  name: string;
  count: number;
}

export interface DistanceStat {
  name: string;
  count: number;
}

export interface GenderStat {
  name: string;
  count: number;
}
