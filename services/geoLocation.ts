const MAJOR_CITIES: Record<string, { lat: number; lng: number; timezone: string }> = {
  '北京': { lat: 39.9042, lng: 116.4074, timezone: 'Asia/Shanghai' },
  '上海': { lat: 31.2304, lng: 121.4737, timezone: 'Asia/Shanghai' },
  '广州': { lat: 23.1291, lng: 113.2644, timezone: 'Asia/Shanghai' },
  '深圳': { lat: 22.5431, lng: 114.0579, timezone: 'Asia/Shanghai' },
  '杭州': { lat: 30.2741, lng: 120.1551, timezone: 'Asia/Shanghai' },
  '南京': { lat: 32.0603, lng: 118.7969, timezone: 'Asia/Shanghai' },
  '武汉': { lat: 30.5928, lng: 114.3055, timezone: 'Asia/Shanghai' },
  '成都': { lat: 30.5728, lng: 104.0668, timezone: 'Asia/Shanghai' },
  '重庆': { lat: 29.4316, lng: 106.9123, timezone: 'Asia/Shanghai' },
  '西安': { lat: 34.3416, lng: 108.9398, timezone: 'Asia/Shanghai' },
  '天津': { lat: 39.0842, lng: 117.2010, timezone: 'Asia/Shanghai' },
  '苏州': { lat: 31.2990, lng: 120.5853, timezone: 'Asia/Shanghai' },
  '香港': { lat: 22.3193, lng: 114.1694, timezone: 'Asia/Hong_Kong' },
  '澳门': { lat: 22.1987, lng: 113.5439, timezone: 'Asia/Macau' },
  '台北': { lat: 25.0330, lng: 121.5654, timezone: 'Asia/Taipei' },
};

export interface GeoLocation {
  lat: number;
  lng: number;
  timezone: string;
}

/**
 * 通过城市名称获取地理位置（简单版）
 * @param location 城市名称
 * @returns 地理位置信息
 */
export async function getGeoLocation(location: string): Promise<GeoLocation> {
  // 检查是否是主要城市
  for (const [city, coords] of Object.entries(MAJOR_CITIES)) {
    if (location.includes(city)) {
      return coords;
    }
  }

  // 如果没有找到，使用 OpenStreetMap Nominatim API（免费）
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
    );
    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      
      // 推测时区（简化版，基于经度）
      const timezone = guessTimezone(lng);
      
      return { lat, lng, timezone };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }

  // 默认返回北京坐标
  console.warn(`Location "${location}" not found, using Beijing as default`);
  return { lat: 39.9042, lng: 116.4074, timezone: 'Asia/Shanghai' };
}

/**
 * 根据经度推测时区（简化版）
 * @param lng 经度
 * @returns 时区字符串
 */
function guessTimezone(lng: number): string {
  const timezoneOffset = Math.round(lng / 15) * 60 * 60 * 1000;
  const offsetHours = timezoneOffset / (60 * 60 * 1000);
  
  const timezone = `Etc/GMT${offsetHours >= 0 ? '-' : '+'}${Math.abs(offsetHours)}`;
  
  // 对于中国地区，优先使用 Asia/Shanghai
  if (lng >= 73 && lng <= 135 && timezoneOffset / (60 * 60 * 1000) === -8) {
    return 'Asia/Shanghai';
  }
  
  return timezone;
}
