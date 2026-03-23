export interface MemberVO {
  id: string | number
  userId: string | number
  memberNo: string
  realName: string
  idCard: string
  birthday: string
  source: string
  levelId: string | number
  balance: number
  points: number
  growthValue: number
  totalConsumeAmount: number
  status: string
  registerTime: string
  signature: string
  region: string
  occupation: string
  school: string
  remark: string
}

export interface MemberOverviewVO {
  totalMembers: number
  activeMembers: number
  frozenMembers: number
  todayNewMembers: number
  totalBalance: number
  totalPoints: number
  totalGrowthValue: number
  totalConsumeAmount: number
}

export interface MemberDetailUserVO {
  userId: string | number
  userName: string
  nickName: string
  phonenumber: string
  email: string
  sex: string
  avatar: string
  status: string
  deptName: string
}

export interface MemberDetailVO {
  id: string | number
  userId: string | number
  memberNo: string
  realName: string
  idCard: string
  birthday: string
  source: string
  levelId: string | number
  levelName: string
  levelCode: string
  levelImage: string
  balance: number
  balanceYuan: string
  points: number
  growthValue: number
  totalConsumeAmount: number
  totalConsumeYuan: string
  status: string
  registerTime: string
  remark: string
  signature: string
  region: string
  occupation: string
  school: string
  createTime: string
  user: MemberDetailUserVO
}

export interface MemberForm extends BaseEntity {
  id?: string | number
  userId?: string | number
  memberNo?: string
  realName?: string
  idCard?: string
  birthday?: string
  source?: string
  levelId?: string | number
  balance?: number
  points?: number
  growthValue?: number
  totalConsumeAmount?: number
  status?: string
  registerTime?: string
  signature?: string
  region?: string
  occupation?: string
  school?: string
  remark?: string
}

export interface MemberQuery extends PageQuery {
  userId?: string | number
  memberNo?: string
  realName?: string
  idCard?: string
  birthday?: string
  source?: string
  levelId?: string | number
  balance?: number
  points?: number
  growthValue?: number
  totalConsumeAmount?: number
  status?: string
  registerTime?: string
  params?: any
}
