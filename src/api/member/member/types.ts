export interface MemberVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 用户ID（关联sys_user.user_id）
   */
  userId: string | number;

  /**
   * 会员编号（唯一）
   */
  memberNo: string;

  /**
   * 会员姓名
   */
  name: string;

  /**
   * 手机号（唯一）
   */
  phone: string;

  /**
   * 性别（0=男 1=女 2=未知）
   */
  gender: string;

  /**
   * 生日
   */
  birthday: string;

  /**
   * 简介
   */
  signature: string;

  /**
   * 地区
   */
  region: string;

  /**
   * 职业
   */
  occupation: string;

  /**
   * 学校
   */
  school: string;

  /**
   * 头像（图片ID）
   */
  avatar: number;

  /**
   * 会员等级ID
   */
  levelId: string | number;

  /**
   * 当前余额
   */
  balance: number;

  /**
   * 当前积分
   */
  points: number;

  /**
   * 累计消费金额
   */
  totalConsumeAmount: number;

  /**
   * 状态（0=正常 1=禁用）
   */
  status: string;

  /**
   * 注册时间
   */
  registerTime: string;

  /**
   * 备注
   */
  remark: string;

}

export interface MemberForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 用户ID（关联sys_user.user_id）
   */
  userId?: string | number;

  /**
   * 会员编号（唯一）
   */
  memberNo?: string;

  /**
   * 会员姓名
   */
  name?: string;

  /**
   * 手机号（唯一）
   */
  phone?: string;

  /**
   * 性别（0=男 1=女 2=未知）
   */
  gender?: string;

  /**
   * 生日
   */
  birthday?: string;

  /**
   * 简介
   */
  signature?: string;

  /**
   * 地区
   */
  region?: string;

  /**
   * 职业
   */
  occupation?: string;

  /**
   * 学校
   */
  school?: string;

  /**
   * 头像（图片ID）
   */
  avatar?: number;

  /**
   * 会员等级ID
   */
  levelId?: string | number;

  /**
   * 当前余额
   */
  balance?: number;

  /**
   * 当前积分
   */
  points?: number;

  /**
   * 累计消费金额
   */
  totalConsumeAmount?: number;

  /**
   * 状态（0=正常 1=禁用）
   */
  status?: string;

  /**
   * 注册时间
   */
  registerTime?: string;

  /**
   * 备注
   */
  remark?: string;

}

export interface MemberQuery extends PageQuery {

  /**
   * 用户ID（关联sys_user.user_id）
   */
  userId?: string | number;

  /**
   * 会员编号（唯一）
   */
  memberNo?: string;

  /**
   * 会员姓名
   */
  name?: string;

  /**
   * 手机号（唯一）
   */
  phone?: string;

  /**
   * 性别（0=男 1=女 2=未知）
   */
  gender?: string;

  /**
   * 生日
   */
  birthday?: string;

  /**
   * 简介
   */
  signature?: string;

  /**
   * 地区
   */
  region?: string;

  /**
   * 职业
   */
  occupation?: string;

  /**
   * 学校
   */
  school?: string;

  /**
   * 头像（图片ID）
   */
  avatar?: number;

  /**
   * 会员等级ID
   */
  levelId?: string | number;

  /**
   * 当前余额
   */
  balance?: number;

  /**
   * 当前积分
   */
  points?: number;

  /**
   * 累计消费金额
   */
  totalConsumeAmount?: number;

  /**
   * 状态（0=正常 1=禁用）
   */
  status?: string;

  /**
   * 注册时间
   */
  registerTime?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
