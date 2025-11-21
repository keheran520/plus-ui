import { App } from 'vue';

// 导入全局组件
import Editor from '@/components/Editor/index.vue';
import WangEditor from '@/components/WangEditor/index.vue';
import DictTag from '@/components/DictTag/index.vue';
import Pagination from '@/components/Pagination/index.vue';
import RightToolbar from '@/components/RightToolbar/index.vue';
import FileUpload from '@/components/FileUpload/index.vue';
import ImageUpload from '@/components/ImageUpload/index.vue';
import ImagePreview from '@/components/ImagePreview/index.vue';
import SvgIcon from '@/components/SvgIcon/index.vue';

export default {
  install: (app: App) => {
    // 注册全局组件
    app.component('Editor', Editor);
    app.component('WangEditor', WangEditor);
    app.component('DictTag', DictTag);
    app.component('Pagination', Pagination);
    app.component('RightToolbar', RightToolbar);
    app.component('FileUpload', FileUpload);
    app.component('ImageUpload', ImageUpload);
    app.component('ImagePreview', ImagePreview);
    app.component('SvgIcon', SvgIcon);
  }
};
