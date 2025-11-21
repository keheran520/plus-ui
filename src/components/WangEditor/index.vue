<template>
  <div class="wang-editor-container">
    <Toolbar
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
      class="wang-editor-toolbar"
    />
    <Editor
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :mode="mode"
      :style="styles"
      class="wang-editor-content"
      @onCreated="handleCreated"
      @onChange="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import '@wangeditor/editor/dist/css/style.css';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor';
import { propTypes } from '@/utils/propTypes';
import { globalHeaders } from '@/utils/request';

const props = defineProps({
  /* 编辑器的内容 */
  modelValue: propTypes.string.def(''),
  /* 高度 */
  height: propTypes.number.def(400),
  /* 最小高度 */
  minHeight: propTypes.number.def(400),
  /* 只读 */
  readOnly: propTypes.bool.def(false),
  /* 上传文件大小限制(MB) */
  fileSize: propTypes.number.def(5),
  /* 模式：default 或 simple */
  mode: propTypes.string.def('default'),
  /* 占位符 */
  placeholder: propTypes.string.def('请输入内容...')
});

const emit = defineEmits(['update:modelValue']);

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef<IDomEditor>();

// 内容 HTML
const valueHtml = ref('');

// 监听外部传入的值
watch(
  () => props.modelValue,
  (val) => {
    if (val !== valueHtml.value) {
      valueHtml.value = val || '';
    }
  },
  { immediate: true }
);

// 工具栏配置
const toolbarConfig: Partial<IToolbarConfig> = {
  toolbarKeys: [
    'headerSelect',
    'blockquote',
    '|',
    'bold',
    'underline',
    'italic',
    'through',
    'color',
    'bgColor',
    'clearStyle',
    '|',
    'fontSize',
    'fontFamily',
    'lineHeight',
    '|',
    'bulletedList',
    'numberedList',
    'todo',
    {
      key: 'group-justify',
      title: '对齐',
      iconSvg: '<svg viewBox="0 0 1024 1024"><path d="M768 793.6v102.4H51.2v-102.4h716.8z m204.8-230.4v102.4H51.2v-102.4h921.6z m-204.8-230.4v102.4H51.2v-102.4h716.8zM972.8 102.4v102.4H51.2V102.4h921.6z"></path></svg>',
      menuKeys: ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyJustify']
    },
    {
      key: 'group-indent',
      title: '缩进',
      iconSvg: '<svg viewBox="0 0 1024 1024"><path d="M0 64h1024v128H0z m384 192h640v128H384z m0 192h640v128H384z m0 192h640v128H384zM0 832h1024v128H0z m0-128V320l256 192z"></path></svg>',
      menuKeys: ['indent', 'delIndent']
    },
    '|',
    'emotion',
    'insertLink',
    {
      key: 'group-image',
      title: '图片',
      iconSvg: '<svg viewBox="0 0 1024 1024"><path d="M959.877 128l0.123 0.123v767.775l-0.123 0.122H64.102l-0.122-0.122V128.123l0.122-0.123h895.775zM960 64H64C28.795 64 0 92.795 0 128v768c0 35.205 28.795 64 64 64h896c35.205 0 64-28.795 64-64V128c0-35.205-28.795-64-64-64zM832 288.01c0 53.023-42.988 96.01-96.01 96.01s-96.01-42.987-96.01-96.01S682.967 192 735.99 192 832 234.988 832 288.01zM896 832H128V704l224.01-384 256 320h64l224.01-192z"></path></svg>',
      menuKeys: ['insertImage', 'uploadImage']
    },
    {
      key: 'group-video',
      title: '视频',
      iconSvg: '<svg viewBox="0 0 1024 1024"><path d="M981.184 160.096C837.568 139.456 678.848 128 512 128S186.432 139.456 42.816 160.096C15.296 267.808 0 386.848 0 512s15.264 244.16 42.816 351.904C186.464 884.544 345.152 896 512 896s325.568-11.456 469.184-32.096C1008.704 756.192 1024 637.152 1024 512s-15.264-244.16-42.816-351.904zM384 704V320l320 192-320 192z"></path></svg>',
      menuKeys: ['insertVideo', 'uploadVideo']
    },
    'insertTable',
    'codeBlock',
    'divider',
    '|',
    'undo',
    'redo',
    '|',
    'fullScreen'
  ]
};

// 编辑器配置
const editorConfig: Partial<IEditorConfig> = {
  placeholder: props.placeholder,
  readOnly: props.readOnly,
  MENU_CONF: {
    // 配置上传图片
    uploadImage: {
      server: import.meta.env.VITE_APP_BASE_API + '/resource/oss/upload',
      fieldName: 'file',
      headers: globalHeaders(),
      maxFileSize: props.fileSize * 1024 * 1024, // 单位为 bytes
      maxNumberOfFiles: 10,
      allowedFileTypes: ['image/*'],
      timeout: 30 * 1000, // 30 秒

      // 自定义插入图片
      customInsert(res: any, insertFn: any) {
        if (res.code === 200) {
          // res 即服务端的返回结果
          const url = res.data.url;
          const alt = res.data.fileName || '';
          const href = url;
          // 从 res 中找到 url alt href ，然后插入图片
          insertFn(url, alt, href);
        } else {
          proxy?.$modal.msgError(res.msg || '图片上传失败');
        }
      },

      // 单个文件上传失败
      onFailed(file: File, res: any) {
        proxy?.$modal.msgError(`${file.name} 上传失败`);
      },

      // 上传错误，或者触发 timeout 超时
      onError(file: File, err: any, res: any) {
        proxy?.$modal.msgError(`${file.name} 上传出错`);
      }
    },

    // 配置上传视频
    uploadVideo: {
      server: import.meta.env.VITE_APP_BASE_API + '/resource/oss/upload',
      fieldName: 'file',
      headers: globalHeaders(),
      maxFileSize: 100 * 1024 * 1024, // 100M
      maxNumberOfFiles: 5,
      allowedFileTypes: ['video/*'],
      timeout: 60 * 1000, // 60 秒

      // 自定义插入视频
      customInsert(res: any, insertFn: any) {
        if (res.code === 200) {
          const url = res.data.url;
          insertFn(url);
        } else {
          proxy?.$modal.msgError(res.msg || '视频上传失败');
        }
      },

      onFailed(file: File, res: any) {
        proxy?.$modal.msgError(`${file.name} 上传失败`);
      },

      onError(file: File, err: any, res: any) {
        proxy?.$modal.msgError(`${file.name} 上传出错`);
      }
    }
  }
};

// 计算样式
const styles = computed(() => {
  const style: any = {};
  if (props.minHeight) {
    style.minHeight = `${props.minHeight}px`;
  }
  if (props.height) {
    style.height = `${props.height}px`;
  }
  return style;
});

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});

// 编辑器创建完成时的回调
const handleCreated = (editor: IDomEditor) => {
  editorRef.value = editor;
};

// 编辑器内容改变时的回调
const handleChange = (editor: IDomEditor) => {
  emit('update:modelValue', valueHtml.value);
};
</script>

<style lang="scss" scoped>
.wang-editor-container {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  overflow: hidden;

  .wang-editor-toolbar {
    border-bottom: 1px solid var(--el-border-color);
    background-color: var(--el-bg-color);
  }

  .wang-editor-content {
    overflow-y: auto;
    background-color: var(--el-bg-color);

    :deep(.w-e-text-container) {
      background-color: var(--el-bg-color);
    }

    :deep(.w-e-text-placeholder) {
      color: var(--el-text-color-placeholder);
    }
  }
}

// 深色模式适配
html.dark {
  .wang-editor-container {
    border-color: var(--el-border-color);

    .wang-editor-toolbar {
      background-color: var(--el-bg-color);
      border-bottom-color: var(--el-border-color);
    }

    .wang-editor-content {
      background-color: var(--el-bg-color);

      :deep(.w-e-text-container) {
        background-color: var(--el-bg-color);
        color: var(--el-text-color-primary);

        [data-slate-editor] {
          color: var(--el-text-color-primary);
        }
      }
    }
  }
}
</style>
