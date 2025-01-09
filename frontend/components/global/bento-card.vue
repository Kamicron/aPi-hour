<template>
  <div class='bento-card'>

    <h2>{{ title }}</h2>

    <slot></slot>

  </div>

</template>



<script setup lang='ts'>

// ----- Define -----

defineProps({

  title: {type: String, required: true},

})

// ------------------



</script>



<style lang='scss' scoped>

.bento-card{

  background-color: $color-surface;

  border-radius: $border-radius;

  box-shadow: $box-shadow-light;

  padding: $spacing-large;

  margin-bottom: 0 0 $spacing-medium $spacing-medium;

  transition: transform 0.3s ease, box-shadow 0.3s ease;



}

</style>