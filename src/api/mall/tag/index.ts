import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { TagVO, TagForm, TagQuery } from '@/api/mall/tag/types';

/**
 * 查询商品标签列表
 * @param query
 * @returns {*}
 */

export const listTag = (query?: TagQuery): AxiosPromise<TagVO[]> => {
  return request({
    url: '/mall/tag/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询商品标签详细
 * @param id
 */
export const getTag = (id: string | number): AxiosPromise<TagVO> => {
  return request({
    url: '/mall/tag/' + id,
    method: 'get'
  });
};

/**
 * 新增商品标签
 * @param data
 */
export const addTag = (data: TagForm) => {
  return request({
    url: '/mall/tag',
    method: 'post',
    data: data
  });
};

/**
 * 修改商品标签
 * @param data
 */
export const updateTag = (data: TagForm) => {
  return request({
    url: '/mall/tag',
    method: 'put',
    data: data
  });
};

/**
 * 删除商品标签
 * @param id
 */
export const delTag = (id: string | number | Array<string | number>) => {
  return request({
    url: '/mall/tag/' + id,
    method: 'delete'
  });
};
