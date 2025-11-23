export interface PhoneVerifyConfigVO {
  /**
   * 配置ID
   */
  configId: string | number;

  /**
   * 配置名称
   */
  configName: string;

  /**
   * 服务商类型
   */
  provider: string | number;

  /**
   * AccessKey ID
   */
  accessKeyId: string | number;

  /**
   * AccessKey Secret / SecretKey / App Secret
   */
  accessKeySecret: string;

  /**
   * 接入点
   */
  endpoint: string;

  /**
   * SDK AppId
   */
  sdkAppId: string | number;

  /**
   * 通道号
   */
  sender: string;

  /**
   * 签名通道号
   */
  signature: string;

  /**
   * 签名名称
   */
  signName: string;

  /**
   * 默认模板ID
   */
  defaultTemplateId: string | number;

  /**
   * 调试模式(0:关闭 1:开启)
   */
  debugMode: string;

  /**
   * 是否默认配置(N:否 Y:是)
   */
  isDefault: string;

  /**
   * 备注
   */
  remark: string;
}

export interface PhoneVerifyConfigForm extends BaseEntity {
  /**
   * 配置ID
   */
  configId?: string | number;

  /**
   * 配置名称
   */
  configName?: string;

  /**
   * 服务商类型
   */
  provider?: string | number;

  /**
   * AccessKey ID
   */
  accessKeyId?: string | number;

  /**
   * AccessKey Secret / SecretKey / App Secret
   */
  accessKeySecret?: string;

  /**
   * 接入点
   */
  endpoint?: string;

  /**
   * SDK AppId
   */
  sdkAppId?: string | number;

  /**
   * 通道号
   */
  sender?: string;

  /**
   * 签名通道号
   */
  signature?: string;

  /**
   * 签名名称
   */
  signName?: string;

  /**
   * 默认模板ID
   */
  defaultTemplateId?: string | number;

  /**
   * 调试模式(0:关闭 1:开启)
   */
  debugMode?: string;

  /**
   * 是否默认配置(N:否 Y:是)
   */
  isDefault?: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface PhoneVerifyConfigQuery extends PageQuery {
  /**
   * 配置名称
   */
  configName?: string;

  /**
   * 服务商类型
   */
  provider?: string | number;

  /**
   * AccessKey ID
   */
  accessKeyId?: string | number;

  /**
   * AccessKey Secret / SecretKey / App Secret
   */
  accessKeySecret?: string;

  /**
   * 接入点
   */
  endpoint?: string;

  /**
   * SDK AppId
   */
  sdkAppId?: string | number;

  /**
   * 通道号
   */
  sender?: string;

  /**
   * 签名通道号
   */
  signature?: string;

  /**
   * 签名名称
   */
  signName?: string;

  /**
   * 默认模板ID
   */
  defaultTemplateId?: string | number;

  /**
   * 调试模式(0:关闭 1:开启)
   */
  debugMode?: string;

  /**
   * 是否默认配置(N:否 Y:是)
   */
  isDefault?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
