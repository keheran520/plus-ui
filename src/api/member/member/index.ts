import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { MemberCheckinSummaryVO, MemberDetailVO, MemberForm, MemberOverviewVO, MemberQuery, MemberVO } from '@/api/member/member/types';

/**
 * 查询会员列表
 * @param query
 * @returns {*}
 */

export const listMember = (query?: MemberQuery): AxiosPromise<MemberVO[]> => {
  return request({
    url: '/member/member/list',
    method: 'get',
    params: query
  });
};

export const getMemberOverview = (query?: MemberQuery): AxiosPromise<MemberOverviewVO> => {
  return request({
    url: '/member/member/overview',
    method: 'get',
    params: query
  });
};

/**
 * 查询会员详细
 * @param id
 */
export const getMember = (id: string | number): AxiosPromise<MemberVO> => {
  return request({
    url: '/member/member/' + id,
    method: 'get'
  });
};

/**
 * 新增会员
 * @param data
 */
export const addMember = (data: MemberForm) => {
  return request({
    url: '/member/member',
    method: 'post',
    data: data
  });
};

/**
 * 修改会员
 * @param data
 */
export const updateMember = (data: MemberForm) => {
  return request({
    url: '/member/member',
    method: 'put',
    data: data
  });
};

/**
 * 删除会员
 * @param id
 */
export const delMember = (id: string | number | Array<string | number>) => {
  return request({
    url: '/member/member/' + id,
    method: 'delete'
  });
};

/**
 * 查询会员详情(关联用户信息)
 * @param id 会员ID
 */
export const getMemberDetail = (id: string | number): AxiosPromise<MemberDetailVO> => {
  return request({
    url: '/member/member/detail/' + id,
    method: 'get'
  });
};

/**
 * 通过用户ID查询会员详情
 * @param userId 用户ID
 */
export const getMemberDetailByUserId = (userId: string | number): AxiosPromise<MemberDetailVO> => {
  return request({
    url: '/member/member/detail/user/' + userId,
    method: 'get'
  });
};

/**
 * 充值
 * @param data
 */
export const recharge = (data: { id: number | string; amount: number; remark?: string }) => {
  return request({
    url: '/member/member/recharge',
    method: 'post',
    params: data
  });
};

/**
 * 扣减余额
 * @param data
 */
export const deductBalance = (data: { id: number | string; amount: number; remark?: string }) => {
  return request({
    url: '/member/member/deduct',
    method: 'post',
    params: data
  });
};

/**
 * 调整积分
 * @param data
 */
export const adjustPoints = (data: { id: number | string; points: number; remark?: string }) => {
  return request({
    url: '/member/member/adjustPoints',
    method: 'post',
    params: data
  });
};

/**
 * 冻结会员
 * @param ids
 */
export const freezeMember = (ids: number[]) => {
  return request({
    url: '/member/member/freeze',
    method: 'post',
    data: ids
  });
};

/**
 * 解冻会员
 * @param ids
 */
export const unfreezeMember = (ids: number[]) => {
  return request({
    url: '/member/member/unfreeze',
    method: 'post',
    data: ids
  });
};

/**
 * 修改会员等级
 * @param data
 */
export const changeLevel = (data: { id: number | string; levelId: number }) => {
  return request({
    url: '/member/member/changeLevel',
    method: 'post',
    params: data
  });
};

export const grantMemberBadge = (data: { memberId: number | string; badgeId: number | string; remark?: string }) => {
  return request({
    url: '/member/member/grantBadge',
    method: 'post',
    params: data
  });
};

/**
 * 导出会员
 * @param query
 */
export const exportMember = (query: any) => {
  return request({
    url: '/member/member/export',
    method: 'post',
    data: query
  });
};

/**
 * 生成会员编号
 */
export const generateMemberNo = (): AxiosPromise<string> => {
  return request({
    url: '/member/member/generateMemberNo',
    method: 'get'
  });
};

/**
 * 获取已关联会员的用户ID列表
 */
export const getLinkedUserIds = (): AxiosPromise<number[]> => {
  return request({
    url: '/member/member/linkedUserIds',
    method: 'get'
  });
};

export const adjustGrowth = (data: { id: number; growthValue: number; changeType: string; remark?: string }) => {
  return request({
    url: '/member/member/adjustGrowth',
    method: 'post',
    params: data
  });
};

export const getMemberCheckinStatus = (memberId: string | number): AxiosPromise<boolean> => {
  return request({
    url: '/member/member/checkin/status',
    method: 'get',
    params: { memberId }
  });
};

export const getMemberCheckinSummary = (memberId: string | number): AxiosPromise<MemberCheckinSummaryVO> => {
  return request({
    url: '/member/member/checkin/summary',
    method: 'get',
    params: { memberId }
  });
};

export const memberCheckin = (memberId: string | number) => {
  return request({
    url: '/member/member/checkin',
    method: 'post',
    params: { memberId }
  });
};
