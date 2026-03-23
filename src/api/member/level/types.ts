export interface LevelVO {
  id: string | number
  levelName: string
  levelCode: string
  levelSort: number
  requiredGrowth: number
  ossId: string | number
  levelImage: string
  benefits: string
  status: string
  remark: string
  builtIn?: boolean
}

export interface LevelForm extends BaseEntity {
  id?: string | number
  levelName?: string
  levelCode?: string
  levelSort?: number
  requiredGrowth?: number
  ossId?: string | number
  levelImage?: string
  benefits?: string
  status?: string
  remark?: string
}

export interface LevelQuery extends PageQuery {
  levelName?: string
  levelCode?: string
  levelSort?: number
  requiredGrowth?: number
  benefits?: string
  status?: string
  params?: any
}
