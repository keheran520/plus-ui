import request from '@/utils/request';
import type { AxiosPromise } from 'axios';

/**
 * 游客批量上传图片
 */
export function guestUploadImages(data: FormData): AxiosPromise<any> {
  return request({
    url: '/open/picturebed/image/guest/upload',
    headers: {
      isToken: false,
      'Content-Type': 'multipart/form-data'
    },
    method: 'post',
    data: data
  });
}

/**
 * 获取公开图片列表
 */
export function getPublicImages(query: any): AxiosPromise<any> {
  return request({
    url: '/open/picturebed/image/list',
    headers: {
      isToken: false
    },
    method: 'get',
    params: query
  });
}

/**
 * 根据分类获取公开图片
 */
export function getPublicImagesByCategory(categoryId: number, query: any): AxiosPromise<any> {
  return request({
    url: `/open/picturebed/image/listByCategory/${categoryId}`,
    headers: {
      isToken: false
    },
    method: 'get',
    params: query
  });
}

/**
 * 根据相册获取公开图片
 */
export function getPublicImagesByAlbum(albumId: number, query: any): AxiosPromise<any> {
  return request({
    url: `/open/picturebed/image/listByAlbum/${albumId}`,
    headers: {
      isToken: false
    },
    method: 'get',
    params: query
  });
}

/**
 * 根据标签获取公开图片
 */
export function getPublicImagesByTags(tags: string, query: any): AxiosPromise<any> {
  return request({
    url: '/open/picturebed/image/listByTags',
    headers: {
      isToken: false
    },
    method: 'get',
    params: {
      tags,
      ...query
    }
  });
}

/**
 * 获取图片详情
 */
export function getPublicImageDetail(imageId: number): AxiosPromise<any> {
  return request({
    url: `/open/picturebed/image/${imageId}`,
    headers: {
      isToken: false
    },
    method: 'get'
  });
}

/**
 * 增加浏览量
 */
export function increaseViewCount(imageId: number): AxiosPromise<any> {
  return request({
    url: `/open/picturebed/image/view/${imageId}`,
    headers: {
      isToken: false
    },
    method: 'post'
  });
}

/**
 * 点赞
 */
export function likeImage(imageId: number): AxiosPromise<any> {
  return request({
    url: `/open/picturebed/image/like/${imageId}`,
    headers: {
      isToken: false
    },
    method: 'post'
  });
}

/**
 * 取消点赞
 */
export function unlikeImage(imageId: number): AxiosPromise<any> {
  return request({
    url: `/open/picturebed/image/unlike/${imageId}`,
    headers: {
      isToken: false
    },
    method: 'post'
  });
}

/**
 * 增加下载次数
 */
export function increaseDownloadCount(imageId: number): AxiosPromise<any> {
  return request({
    url: `/open/picturebed/image/download/${imageId}`,
    headers: {
      isToken: false
    },
    method: 'post'
  });
}

/**
 * 获取热门图片
 */
export function getHotImages(query: any): AxiosPromise<any> {
  return request({
    url: '/open/picturebed/image/hot',
    headers: {
      isToken: false
    },
    method: 'get',
    params: query
  });
}

/**
 * 获取最新图片
 */
export function getLatestImages(query: any): AxiosPromise<any> {
  return request({
    url: '/open/picturebed/image/latest',
    headers: {
      isToken: false
    },
    method: 'get',
    params: query
  });
}

/**
 * 获取推荐图片
 */
export function getRecommendImages(query: any): AxiosPromise<any> {
  return request({
    url: '/open/picturebed/image/recommend',
    headers: {
      isToken: false
    },
    method: 'get',
    params: query
  });
}

/**
 * 搜索图片
 */
export function searchImages(keyword: string, query: any): AxiosPromise<any> {
  return request({
    url: '/open/picturebed/image/search',
    headers: {
      isToken: false
    },
    method: 'get',
    params: {
      keyword,
      ...query
    }
  });
}

/**
 * 获取分类列表（开放接口）- 树形结构
 */
export function getPublicCategories(): AxiosPromise<any> {
  return request({
    url: '/open/picturebed/category/tree',
    headers: {
      isToken: false
    },
    method: 'get'
  });
}

/**
 * 获取分类列表（开放接口）- 扁平结构
 */
export function getPublicCategoriesList(): AxiosPromise<any> {
  return request({
    url: '/open/picturebed/category/list',
    headers: {
      isToken: false
    },
    method: 'get'
  });
}

/**
 * 获取标签列表（开放接口）
 */
export function getPublicTags(categoryId?: number): AxiosPromise<any> {
  const url = categoryId 
    ? `/open/picturebed/tag/listByCategory/${categoryId}`
    : '/open/picturebed/tag/list';
  
  return request({
    url,
    headers: {
      isToken: false
    },
    method: 'get'
  });
}

/**
 * 获取图床统计信息（开放接口）
 */
export function getStatistics(): AxiosPromise<any> {
  return request({
    url: '/open/picturebed/image/statistics',
    headers: {
      isToken: false
    },
    method: 'get'
  });
}
