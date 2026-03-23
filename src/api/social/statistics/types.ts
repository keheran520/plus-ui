export interface SocialStatisticsVO {
  statId: string | number;
  targetType: string;
  targetId: string | number;
  likeCount: number;
  favoriteCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  score?: number;
  targetTitle?: string;
}

export interface SocialStatisticsForm extends BaseEntity {
  statId?: string | number;
  targetType?: string;
  targetId?: string | number;
  likeCount?: number;
  favoriteCount?: number;
  commentCount?: number;
  shareCount?: number;
  viewCount?: number;
  score?: number;
}

export interface SocialStatisticsQuery extends PageQuery {
  targetType?: string;
  targetId?: string | number;
  likeCount?: number;
  favoriteCount?: number;
  commentCount?: number;
  shareCount?: number;
  viewCount?: number;
  params?: any;
}
