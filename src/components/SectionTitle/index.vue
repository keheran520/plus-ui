<template>
  <div class="section-title">
    <slot>{{ title }}</slot>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  title?: string;
}>();
</script>

<style lang="scss" scoped>
.section-title {
  position: relative;
  padding-left: 12px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  line-height: 24px;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 4px;
    width: 4px;
    height: 16px;
    background: #165dff;
    border-radius: 2px;
  }
}
</style>
