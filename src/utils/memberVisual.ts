export interface MemberBadgeVisualInput {
  badgeCode?: string;
  badgeIcon?: string;
  conditionType?: string;
  conditionValue?: number | string;
}

const LEVEL_IMAGE_MAP: Record<string, string> = {
  V1: '/assets/member/levels/v1.svg',
  V2: '/assets/member/levels/v2.svg',
  V3: '/assets/member/levels/v3.svg',
  V4: '/assets/member/levels/v4.svg',
  V5: '/assets/member/levels/v5.svg',
  V6: '/assets/member/levels/v6.svg',
  V7: '/assets/member/levels/v7.svg'
};

export function getMemberLevelImage(levelCode?: string, levelImage?: string) {
  if (levelImage) {
    return levelImage;
  }
  const normalizedCode = String(levelCode || '').toUpperCase();
  return LEVEL_IMAGE_MAP[normalizedCode] || '';
}

export function getMemberBadgeImage(badge?: MemberBadgeVisualInput) {
  if (badge?.badgeIcon) {
    return badge.badgeIcon;
  }

  const badgeCode = String(badge?.badgeCode || '').toLowerCase();
  if (badgeCode.includes('streak') && String(badge?.conditionValue || '') === '7') {
    return '/assets/member/badges/checkin-streak-7.svg';
  }
  if (badgeCode.includes('streak') && String(badge?.conditionValue || '') === '30') {
    return '/assets/member/badges/checkin-streak-30.svg';
  }
  if (badgeCode.includes('total') && String(badge?.conditionValue || '') === '100') {
    return '/assets/member/badges/checkin-total-100.svg';
  }

  if (badge?.conditionType === 'checkin_streak' && String(badge?.conditionValue || '') === '7') {
    return '/assets/member/badges/checkin-streak-7.svg';
  }
  if (badge?.conditionType === 'checkin_streak' && String(badge?.conditionValue || '') === '30') {
    return '/assets/member/badges/checkin-streak-30.svg';
  }
  if (badge?.conditionType === 'checkin_total' && String(badge?.conditionValue || '') === '100') {
    return '/assets/member/badges/checkin-total-100.svg';
  }

  return '';
}
