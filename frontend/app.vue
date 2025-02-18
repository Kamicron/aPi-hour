<template>
  <div>
    <!-- <PiHeader /> -->
    <navbar />
    <NuxtPage />
    <PiFooter />
  </div>
</template>

<script lang="ts" setup>
import { EToast } from '~/assets/ts/enums/toast.enum'
const { $toast } = useNuxtApp()

$toast.configure({
  position: {
    top: 20,
    right: 20
  },
  styles: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    types: {
      [EToast.SUCCESS]: {
        backgroundColor: '#48BB78',
        color: '#ffffff',
        borderColor: '#2F855A'
      },
      [EToast.ERROR]: {
        backgroundColor: '#F56565',
        color: '#ffffff',
        borderColor: '#C53030'
      },
      [EToast.WARNING]: {
        backgroundColor: '#ED8936',
        color: '#ffffff',
        borderColor: '#C05621'
      },
      [EToast.INFO]: {
        backgroundColor: '#4299E1',
        color: '#ffffff',
        borderColor: '#2B6CB0'
      }
    }
  }
})
</script>

<style lang="scss">

</style>
