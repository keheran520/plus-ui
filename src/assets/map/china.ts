/**
 * 简化版中国地图数据
 * 使用 ECharts 内置的地图注册功能
 * 如需完整地图，可从 https://github.com/apache/echarts/tree/master/test/data/map/json 下载
 */

export const registerChinaMap = async (echarts: any) => {
  // 方法1: 使用在线CDN加载（推荐）
  try {
    const response = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json');
    const geoJson = await response.json();
    echarts.registerMap('china', geoJson);
    return true;
  } catch (error) {
    console.warn('加载在线地图数据失败，使用降级方案:', error);
    return false;
  }
};

// 方法2: 如果不想使用在线CDN，可以使用以下简化数据（仅包含轮廓）
export const simpleChinaMapData = {
  type: 'FeatureCollection',
  features: []
};
