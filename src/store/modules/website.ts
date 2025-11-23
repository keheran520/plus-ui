import { defineStore } from 'pinia';
import { getWebsiteConfig } from '@/api/system/config';

interface WebsiteConfig {
  logo: string;
  favicon: string;
  name: string;
  description: string;
  copyright: string;
  icp: string;
  keywords: string;
  author: string;
  email: string;
  phone: string;
  address: string;
}

export const useWebsiteStore = defineStore('website', {
  state: (): { config: WebsiteConfig; loading: boolean } => ({
    config: {
      logo: '',
      favicon: '',
      name: '',
      description: '',
      copyright: '',
      icp: '',
      keywords: '',
      author: '',
      email: '',
      phone: '',
      address: ''
    },
    loading: false
  }),

  getters: {
    getConfig(): WebsiteConfig {
      return this.config;
    },
    getLoading(): boolean {
      return this.loading;
    }
  },

  actions: {
    async fetchWebsiteConfig(tenantId?: string) {
      this.loading = true;
      try {
        const res = await getWebsiteConfig(tenantId);
        if (res.data) {
          this.config = {
            logo: res.data.logo || '',
            favicon: res.data.favicon || '',
            name: res.data.name || '',
            description: res.data.description || '',
            copyright: res.data.copyright || '',
            icp: res.data.icp || '',
            keywords: res.data.keywords || '',
            author: res.data.author || '',
            email: res.data.email || '',
            phone: res.data.phone || '',
            address: res.data.address || ''
          };
        }
      } catch (error) {
        console.error('获取网站配置失败:', error);
      } finally {
        this.loading = false;
      }
    }
  }
});
