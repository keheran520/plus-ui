import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ImageAccessLogVO, ImageAccessLogForm, ImageAccessLogQuery } from '@/api/picturebed/imageAccessLog/types';

/**
 * 查询图片访问日志列表
 * @param query
 * @returns {*}
 */

export const listImageAccessLog = (query?: ImageAccessLogQuery): AxiosPromise<ImageAccessLogVO[]> => {
  return request({
    url: '/picturebed/imageAccessLog/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询图片访问日志详细
 * @param logId
 */
export const getImageAccessLog = (logId: string | number): AxiosPromise<ImageAccessLogVO> => {
  return request({
    url: '/picturebed/imageAccessLog/' + logId,
    method: 'get'
  });
};

/**
 * 新增图片访问日志
 * @param data
 */
export const addImageAccessLog = (data: ImageAccessLogForm) => {
  return request({
    url: '/picturebed/imageAccessLog',
    method: 'post',
    data: data
  });
};

/**
 * 修改图片访问日志
 * @param data
 */
export const updateImageAccessLog = (data: ImageAccessLogForm) => {
  return request({
    url: '/picturebed/imageAccessLog',
    method: 'put',
    data: data
  });
};

/**
 * 删除图片访问日志
 * @param logId
 */
export const delImageAccessLog = (logId: string | number | Array<string | number>) => {
  return request({
    url: '/picturebed/imageAccessLog/' + logId,
    method: 'delete'
  });
};
