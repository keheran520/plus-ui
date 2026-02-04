import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { BalanceLogVO, BalanceLogForm, BalanceLogQuery } from '@/api/member/balanceLog/types';

/**
 * 查询会员余额记录列表
 * @param query
 * @returns {*}
 */

export const listBalanceLog = (query?: BalanceLogQuery): AxiosPromise<BalanceLogVO[]> => {
  return request({
    url: '/member/balanceLog/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询会员余额记录详细
 * @param id
 */
export const getBalanceLog = (id: string | number): AxiosPromise<BalanceLogVO> => {
  return request({
    url: '/member/balanceLog/' + id,
    method: 'get'
  });
};

/**
 * 新增会员余额记录
 * @param data
 */
export const addBalanceLog = (data: BalanceLogForm) => {
  return request({
    url: '/member/balanceLog',
    method: 'post',
    data: data
  });
};

/**
 * 修改会员余额记录
 * @param data
 */
export const updateBalanceLog = (data: BalanceLogForm) => {
  return request({
    url: '/member/balanceLog',
    method: 'put',
    data: data
  });
};

/**
 * 删除会员余额记录
 * @param id
 */
export const delBalanceLog = (id: string | number | Array<string | number>) => {
  return request({
    url: '/member/balanceLog/' + id,
    method: 'delete'
  });
};

/**
 * 查询指定会员的余额记录
 * @param memberId
 */
export const getBalanceLogByMemberId = (memberId: number) => {
  return request({
    url: '/member/balanceLog/member/' + memberId,
    method: 'get'
  });
};

/**
 * 导出余额记录
 * @param query
 */
export const exportBalanceLog = (query: any) => {
  return request({
    url: '/member/balanceLog/export',
    method: 'post',
    data: query
  });
};
